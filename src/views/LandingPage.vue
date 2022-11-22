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
            @row-dblclick="onDoubleClick"
            :scrollable="true"
            scrollHeight="flex"
            class="p-datatable-sm"
          >
            <template #empty> No recent activity </template>
            <Column field="name" header="Name"></Column>
            <Column field="latestActivity" header="Latest activity">
              <template #body="{ data }">
                <div v-tooltip="getActivityTooltipMessage(data)">{{ getActivityMessage(data) }}</div>
              </template>
            </Column>
            <Column :exportable="false" bodyStyle="text-align: center; overflow: visible; justify-content: flex-end; gap: 0.25rem;">
              <template #body="{ data }">
                <Button
                  icon="fa-solid fa-sitemap"
                  class="p-button-rounded p-button-text p-button-plain row-button"
                  @click="open(data)"
                  v-tooltip.top="'Select'"
                  data-testid="select-button"
                />
                <Button
                  icon="pi pi-fw pi-external-link"
                  class="p-button-rounded p-button-text p-button-plain activity-row-button"
                  @click="view(data)"
                  v-tooltip.top="'View'"
                  data-testid="view-button"
                />
                <Button
                  icon="fa-solid fa-pen-to-square"
                  class="p-button-rounded p-button-text p-button-plain activity-row-button"
                  @click="edit(data)"
                  v-tooltip.top="'Edit'"
                  data-testid="edit-button"
                />
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
export default defineComponent({
  components: { ReportTable, PieChartDashCard }
});
</script>

<script setup lang="ts">
import { defineComponent, computed, Ref, ref, watch, onMounted } from "vue";
import ReportTable from "../components/home/landingPage/ReportTable.vue";
import PieChartDashCard from "../components/home/landingPage/PieChartDashCard.vue";
import { useStore } from "vuex";
import _ from "lodash";
import { TTIriRef, RecentActivityItem, IriCount, DashboardLayout } from "im-library/dist/types/interfaces/Interfaces";
import { Vocabulary, Helpers, Services } from "im-library";
import { RouteRecordName, useRoute, useRouter } from "vue-router";
import axios from "axios";
const { IM, RDF, RDFS } = Vocabulary;
const {
  DataTypeCheckers: { isArrayHasLength, isObjectHasKeys },
  Sorters: { byOrder }
} = Helpers;
const { EntityService, ConfigService, Env, DirectService } = Services;
const router = useRouter();
const store = useStore();
const recentLocalActivity = computed(() => store.state.recentLocalActivity);

const entityService = new EntityService(axios);
const configService = new ConfigService(axios);
const directService = new DirectService(store);

const activities: Ref<RecentActivityItem[]> = ref([]);
const selected: Ref<any> = ref({});
const loading = ref(false);
const configs: Ref<DashboardLayout[]> = ref([]);
const cardsData: Ref<{ name: string; description: string; inputData: IriCount; component: string }[]> = ref([]);

watch(
  () => _.cloneDeep(recentLocalActivity.value),
  async () => await getRecentActivityDetails()
);

onMounted(async () => await init());

async function init(): Promise<void> {
  loading.value = true;
  await getConfigs();
  await getCardsData();
  await getRecentActivityDetails();
  loading.value = false;
}

async function getRecentActivityDetails() {
  const storedActivity: RecentActivityItem[] = Object.assign([], recentLocalActivity.value);
  for (let activity of storedActivity) {
    const result = await entityService.getPartialEntity(activity.iri, [RDFS.LABEL, RDF.TYPE]);
    if (isObjectHasKeys(result, [RDF.TYPE, RDFS.LABEL])) {
      activity.name = result[RDFS.LABEL];
      activity.type = result[RDF.TYPE].map((type: TTIriRef) => type.name).join(", ");
    }
  }
  storedActivity.reverse();
  activities.value = storedActivity;
}

async function getConfigs(): Promise<void> {
  configs.value = await configService.getDashboardLayout("conceptDashboard");
  if (isArrayHasLength(configs.value)) {
    configs.value.sort(byOrder);
  }
}

function getActivityTooltipMessage(activity: RecentActivityItem) {
  const dateTime = new Date(activity.dateTime);
  return ["on", dateTime.toDateString(), "at", dateTime.toTimeString().substring(0, 9)].join(" ");
}

function getActivityMessage(activity: RecentActivityItem) {
  let action = "";
  const dateTime = new Date(activity.dateTime);
  switch (activity.app) {
    case Env.DIRECTORY_URL:
      action = "Viewed";
      break;
    case Env.EDITOR_URL:
      action = "Edited";
      break;

    default:
      break;
  }

  return action + " " + getDayDisplay(dateTime);
}

function getDayDisplay(dateTime: Date) {
  const now = new Date();
  if (dateTime.getDay() === now.getDay()) return "today";
  if (now.getDay() - dateTime.getDay() === 1) return "yesterday";
  if (now.getDay() - dateTime.getDay() < 7) return "this week";
  if (dateTime.getMonth() === now.getMonth()) return "this month";
  if (dateTime.getFullYear() === now.getFullYear()) return "this year";
}

function onDoubleClick(event: any) {
  directService.directTo(event.data.app, event.data.iri, event.data.route || "concept");
}

async function getCardsData(): Promise<void> {
  const cards = [] as { name: string; description: string; inputData: IriCount; component: string }[];
  for (const config of configs.value) {
    const result = await entityService.getPartialEntity(config.iri, [RDFS.LABEL, RDFS.COMMENT, IM.STATS_REPORT_ENTRY]);
    if (!isObjectHasKeys(result)) return;
    const cardData = {
      name: result[RDFS.LABEL],
      description: result[RDFS.COMMENT],
      inputData: result[IM.STATS_REPORT_ENTRY],
      component: config.type
    };
    cards.push(cardData);
  }
  cardsData.value = cards;
}

function view(data: any) {
  onRowSelect(data);
  directService.directTo(Env.DIRECTORY_URL, selected.value.iri, "folder");
}

function open(data: any) {
  onRowSelect(data);
  router.push({
    name: "Folder",
    params: { selectedIri: selected.value.iri }
  });
}

function edit(data: any) {
  onRowSelect(data);
  directService.directTo(Env.EDITOR_URL, selected.value.iri, "editor");
}

function onRowSelect(event: any) {
  selected.value = event?.data || event;
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
  flex-flow: column;
  justify-content: flex-start;
  overflow: auto;
}

.activity-container {
  flex: 1 1 auto;
  display: flex;
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
  flex: 1 0 auto;
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
