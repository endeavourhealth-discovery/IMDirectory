<template>
  <div id="landing-page-container">
    <div class="flex flex-row justify-content-center align-items-center loading-container" v-if="loading">
      <ProgressSpinner />
    </div>
    <div id="landing-content" v-else>
      <Card>
        <template #title>
          Suggested
        </template>
        <template #content>
          <DataTable
            :value="activities"
            v-model:selection="selected"
            selectionMode="single"
            @rowSelect="onRowSelect"
            dataKey="dateTime"
            @row-dblclick="onDoubleClick"
            :scrollable="true"
            scrollHeight="flex"
            class="p-datatable-sm"
          >
            <template #empty>
              No recent activity
            </template>
            <Column field="name" header="Name"></Column>
            <Column field="type" header="Type"></Column>
            <Column field="latestActivity" header="Latest activity">
              <template #body="{data}">
                <div v-tooltip="getActivityTooltipMessage(data)">{{ getActivityMessage(data) }}</div>
              </template>
            </Column>
            <Column :exportable="false" bodyStyle="text-align: center; overflow: visible; justify-content: flex-end; gap: 0.25rem;">
              <template #body="{data}">
                <Button
                  icon="pi pi-fw pi-eye"
                  class="p-button-rounded p-button-text p-button-plain activity-row-button"
                  @click="view(data)"
                  v-tooltip.top="'View'"
                />
                <Button
                  icon="pi pi-fw pi-info-circle"
                  class="p-button-rounded p-button-text p-button-plain activity-row-button"
                  @click="showInfo(data)"
                  v-tooltip.top="'Info'"
                />
                <Button
                  icon="fa-solid fa-pen-to-square"
                  class="p-button-rounded p-button-text p-button-plain activity-row-button"
                  @click="edit(data)"
                  v-tooltip.top="'Edit'"
                />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
      <div id="dashboard-container">
        <template v-for="(cardData, index) in cardsData" :key="index">
          <component
            :is="cardData.component"
            :inputData="cardData.inputData"
            :name="cardData.name"
            :description="cardData.description"
            :id="'dashCard-' + index"
            labelKey="http://www.w3.org/2000/01/rdf-schema#label"
            dataKey="http://www.w3.org/2002/07/owl#hasValue"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ReportTable from "@/components/landingPage/ReportTable.vue";
import PieChartDashCard from "@/components/landingPage/PieChartDashCard.vue";
import EntityService from "@/services/EntityService";
import { mapState } from "vuex";
import DirectService from "@/services/DirectService";
import { TTIriRef, RecentActivityItem, IriCount, DashboardLayout } from "im-library/dist/types/interfaces/Interfaces";
import { Env, Vocabulary, Helpers, ConfigService } from "im-library";
const { IM, RDF, RDFS } = Vocabulary;
const {
  DataTypeCheckers: { isArrayHasLength, isObjectHasKeys },
  Sorters: { byOrder }
} = Helpers;

export default defineComponent({
  name: "LandingPage",
  components: {
    ReportTable,
    PieChartDashCard
  },
  computed: {
    ...mapState(["recentLocalActivity"])
  },
  watch: {
    async recentLocalActivity() {
      await this.init();
    }
  },
  async mounted() {
    await this.init();
  },
  data() {
    return {
      activities: [] as RecentActivityItem[],
      selected: {} as any,
      loading: false,
      configs: [] as DashboardLayout[],
      cardsData: [] as { name: string; description: string; inputData: IriCount; component: string }[]
    };
  },
  methods: {
    async init(): Promise<void> {
      this.loading = true;
      await this.getConfigs();
      await this.getCardsData();
      await this.getRecentActivityDetails();
      this.loading = false;
    },

    async getRecentActivityDetails() {
      const storedActivity: RecentActivityItem[] = Object.assign([], this.recentLocalActivity);
      for (let activity of storedActivity) {
        const result = await EntityService.getPartialEntity(activity.iri, [RDFS.LABEL, RDF.TYPE]);
        if (isObjectHasKeys(result, [RDF.TYPE, RDFS.LABEL])) {
          activity.name = result[RDFS.LABEL];
          activity.type = result[RDF.TYPE].map((type: TTIriRef) => type.name).join(", ");
        }
      }
      storedActivity.reverse();
      this.activities = storedActivity;
    },

    async getConfigs(): Promise<void> {
      this.configs = await ConfigService.getDashboardLayout("conceptDashboard");
      if (isArrayHasLength(this.configs)) {
        this.configs.sort(byOrder);
      }
    },

    getActivityTooltipMessage(activity: RecentActivityItem) {
      const dateTime = new Date(activity.dateTime);
      return ["on", dateTime.toDateString(), "at", dateTime.toTimeString().substring(0, 9)].join(" ");
    },

    getActivityMessage(activity: RecentActivityItem) {
      let action = "";
      const dateTime = new Date(activity.dateTime);
      switch (activity.app) {
        case Env.VIEWER_URL:
          action = "Viewed";
          break;
        case Env.EDITOR_URL:
          action = "Edited";
          break;

        default:
          break;
      }

      return action + " " + this.getDayDisplay(dateTime);
    },

    getDayDisplay(dateTime: Date) {
      const now = new Date();
      if (dateTime.getDay() === now.getDay()) return "today";
      if (now.getDay() - dateTime.getDay() === 1) return "yesterday";
      if (now.getDay() - dateTime.getDay() < 7) return "this week";
      if (dateTime.getMonth() === now.getMonth()) return "this month";
      if (dateTime.getFullYear() === now.getFullYear()) return "this year";
    },

    onDoubleClick(event: any) {
      DirectService.directTo(event.data.app, event.data.iri, this, event.data.route || "concept");
    },

    async getCardsData(): Promise<void> {
      const cards = [] as { name: string; description: string; inputData: IriCount; component: string }[];
      for (const config of this.configs) {
        const result = await EntityService.getPartialEntity(config.iri, [RDFS.LABEL, RDFS.COMMENT, IM.STATS_REPORT_ENTRY]);
        if (!isObjectHasKeys(result)) return;
        const cardData = {
          name: result[RDFS.LABEL],
          description: result[RDFS.COMMENT],
          inputData: result[IM.STATS_REPORT_ENTRY],
          component: config.type
        };
        cards.push(cardData);
      }
      this.cardsData = cards;
    },

    view(data?: any) {
      if (data) this.onRowSelect(data);
      DirectService.directTo(Env.VIEWER_URL, this.selected.iri, this, "concept");
    },

    edit(data?: any) {
      if (data) this.onRowSelect(data);
      DirectService.directTo(Env.EDITOR_URL, this.selected.iri, this, "editor");
    },

    showInfo(data?: any) {
      if (data) this.onRowSelect(data);
      this.$emit("openBar");
    },

    onRowSelect(event: any) {
      this.selected = event?.data || event;
      this.$store.commit("updateSelectedConceptIri", this.selected.iri);
    }
  }
});
</script>

<style scoped>
#landing-page-container {
  height: 100%;
  width: 100%;
  overflow: auto;
}

.loading-container {
  width: 100%;
  height: 100%;
}

#landing-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  overflow: auto;
}

.p-card {
  box-shadow: none;
}

#dashboard-container {
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  height: 100%;
  overflow: auto;
  border: none;
  box-shadow: none;
  border-radius: none;
}

.activity-row-button:hover {
  background-color: #6c757d !important;
  color: #ffffff !important;
}
</style>
