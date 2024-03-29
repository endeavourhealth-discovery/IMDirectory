<template>
  <div id="landing-page-container">
    <div class="flex flex-row justify-content-center align-items-center loading-container" v-if="loading">
      <ProgressSpinner />
    </div>
    <div id="landing-content" v-else>
      <div class="activity-container">
        <span class="title"> Suggested </span>
        <div class="datatable-container">
          <DataTable
            :value="activities"
            v-model:selection="selected"
            selectionMode="single"
            @rowSelect="onRowSelect"
            dataKey="dateTime"
            :scrollable="true"
            scrollHeight="flex"
            class="p-datatable-sm activity-datatable"
          >
            <template #empty> No recent activity </template>
            <Column field="name" header="Name">
              <template #body="{ data }: any">
                <div class="activity-name-icon-container">
                  <IMFontAwesomeIcon v-if="data.icon" :icon="data.icon" class="recent-icon" :style="data.color" />
                  <span class="activity-name">{{ data.name }}</span>
                </div>
              </template>
            </Column>
            <Column field="latestActivity" header="Latest activity">
              <template #body="{ data }: any">
                <span class="activity-message" v-tooltip="getActivityTooltipMessage(data)">{{ getActivityMessage(data) }}</span>
              </template>
            </Column>
            <Column :exportable="false">
              <template #body="{ data }: any">
                <div class="action-buttons-container">
                  <ActionButtons :buttons="['findInTree', 'view', 'edit']" :iri="data.iri" @locate-in-tree="locateInTree" />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
      <div id="dashboard-container">
        <template v-for="(cardData, index) in cardsData" :key="index">
          <component
            :is="cardData.component"
            :inputData="cardData.inputData"
            :name="cardData.name"
            :description="cardData.description"
            :id="'dashCard-' + index"
            labelKey="http://www.w3.org/2000/01/rdf-schema#label"
            dataKey="http://endhealth.info/im#hasValue"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ReportTable from "@/components/directory/landingPage/ReportTable.vue";
import PieChartDashCard from "@/components/directory/landingPage/PieChartDashCard.vue";
import ActionButtons from "../shared/ActionButtons.vue";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";
import { useDirectoryStore } from "@/stores/directoryStore";
import { getDisplayFromDate } from "@im-library/helpers/UtilityMethods";

export default defineComponent({
  components: { ReportTable, PieChartDashCard, ActionButtons, IMFontAwesomeIcon }
});
</script>

<script setup lang="ts">
import { computed, Ref, ref, watch, onMounted, defineComponent } from "vue";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import _, { isArray } from "lodash";
import { RecentActivityItem, IriCount, DashboardLayout } from "@im-library/interfaces";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { DirectService, EntityService, ConfigService, UserService } from "@/services";
import { IM, RDF, RDFS } from "@im-library/vocabulary";
import rowClick from "@/composables/rowClick";
import { useUserStore } from "@/stores/userStore";

import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { byOrder } from "@im-library/helpers/Sorters";
const userStore = useUserStore();
const directoryStore = useDirectoryStore();
const directService = new DirectService();
const recentLocalActivity = computed(() => userStore.recentLocalActivity);
const currentUser = computed(() => userStore.currentUser);

const activities: Ref<RecentActivityItem[]> = ref([]);
const selected: Ref<any> = ref({});
const loading: Ref<boolean> = ref(false);
const configs: Ref<DashboardLayout[]> = ref([]);
const cardsData: Ref<{ name: string; description: string; inputData: IriCount; component: string }[]> = ref([]);
const { onRowClick }: { onRowClick: Function } = rowClick();

watch(
  () => _.cloneDeep(recentLocalActivity.value),
  async () => await getRecentActivityDetails()
);

onMounted(async () => init());

async function init(): Promise<void> {
  loading.value = true;
  await getConfigs();
  await getCardsData();
  await getRecentActivityDetails();
  loading.value = false;
}

async function getRecentActivityDetails() {
  let localActivity: RecentActivityItem[] = [];
  if (isArrayHasLength(recentLocalActivity.value)) localActivity = recentLocalActivity.value;
  if (currentUser.value) {
    const results = await UserService.getUserMRU();
    if (isArrayHasLength(results)) localActivity = results;
  }
  const iris = localActivity.map((rla: RecentActivityItem) => rla.iri);
  const results = await EntityService.getPartialEntities(iris, [RDFS.LABEL, RDF.TYPE]);

  const temp: RecentActivityItem[] = [];

  for (const rla of localActivity) {
    const clone = { ...rla };

    let result = null;
    if (results && isArray(results)) result = results.find((r: any) => r["@id"] === rla.iri);

    if (result && isObjectHasKeys(result, [RDF.TYPE, RDFS.LABEL])) {
      clone.name = result[RDFS.LABEL];
      clone.type = result[RDF.TYPE].map((type: TTIriRef) => type.name).join(", ");
      clone.icon = getFAIconFromType(result[RDF.TYPE]);
      clone.color = "color:" + getColourFromType(result[RDF.TYPE]);
    }

    temp.push(clone);
  }

  temp.reverse();
  activities.value = temp;
}

async function getConfigs(): Promise<void> {
  const result = await ConfigService.getDashboardLayout("conceptDashboard");
  if (result && isArray(result)) configs.value = result;
  if (isArrayHasLength(configs.value)) {
    configs.value.sort(byOrder);
  }
}

function onRowSelect(event: any) {
  directService.select(event.data.iri, "Folder");
}

function getActivityTooltipMessage(activity: RecentActivityItem) {
  const dateTime = new Date(activity.dateTime);
  return ["on", dateTime.toDateString(), "at", dateTime.toTimeString().substring(0, 9)].join(" ");
}

function getActivityMessage(activity: RecentActivityItem) {
  const dateTime = new Date(activity.dateTime);
  return activity.action + " " + getDisplayFromDate(new Date(), dateTime);
}

async function getCardsData(): Promise<void> {
  const cards = [] as { name: string; description: string; inputData: IriCount; component: string }[];
  for (const config of configs.value) {
    const result = await EntityService.getPartialEntity(config.iri, [RDFS.LABEL, RDFS.COMMENT, IM.STATS_REPORT_ENTRY]);
    if (!isObjectHasKeys(result)) return;
    result[IM.STATS_REPORT_ENTRY].forEach((stat: any) => (stat[IM.HAS_VALUE] = Number(stat[IM.HAS_VALUE])));
    const cardData = {
      name: result[RDFS.LABEL],
      description: result[RDFS.COMMENT] ? result[RDFS.COMMENT] : "",
      inputData: result[IM.STATS_REPORT_ENTRY],
      component: config.type
    };
    cards.push(cardData);
  }
  cardsData.value = cards;
}

function locateInTree(iri: string) {
  directoryStore.updateFindInTreeIri(iri);
}
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
  flex-flow: column nowrap;
  justify-content: flex-start;
  overflow: auto;
}

.activity-datatable {
  width: 100%;
}

.activity-container {
  flex: 1 1 auto;
  display: flex;
  width: 100%;
  flex-flow: column nowrap;
  overflow: auto;
  padding: 1rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.datatable-container {
  flex: 1 1 auto;
  overflow: auto;
}

.p-card {
  box-shadow: none;
}

#dashboard-container {
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  flex: 0 0 50%;
  overflow: auto;
  padding: 1rem;
  gap: 1rem;
}

.recent-icon {
  height: 1rem;
  font-size: 1rem;
}

.action-buttons-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}

.activity-name-icon-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  overflow: auto;
  gap: 0.25rem;
}

.activity-name {
  flex: 0 1 auto;
}
</style>
