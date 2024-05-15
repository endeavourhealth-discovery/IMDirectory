<template>
  <div class="flex flex-row justify-content-center align-items-center loading-container" v-if="loading">
    <ProgressSpinner />
  </div>
  <div v-else class="activity-container">
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
              <span class="activity-name" @mouseover="showOverlay($event, data.iri)" @mouseleave="hideOverlay($event)">{{ data.name }}</span>
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
      <OverlaySummary ref="OS" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref, watch } from "vue";
import { useUserStore } from "@/stores/userStore";
import { RecentActivityItem } from "@im-library/interfaces";
import ActionButtons from "@/components/shared/ActionButtons.vue";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { getDisplayFromDate } from "@im-library/helpers/UtilityMethods";

import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { byOrder } from "@im-library/helpers/Sorters";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import _, { isArray } from "lodash";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { DirectService, EntityService, ConfigService, UserService } from "@/services";
import setupOverlay from "@/composables/setupOverlay";
import rowClick from "@/composables/rowClick";
import { IM, RDF, RDFS, SHACL } from "@im-library/vocabulary";
import { useDirectoryStore } from "@/stores/directoryStore";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";

const { onRowClick }: { onRowClick: Function } = rowClick();
const { OS, showOverlay, hideOverlay } = setupOverlay();

const directService = new DirectService();
const directoryStore = useDirectoryStore();
const userStore = useUserStore();
const recentLocalActivity = computed(() => userStore.recentLocalActivity);
const currentUser = computed(() => userStore.currentUser);
const selected: Ref<any> = ref({});
const activities: Ref<RecentActivityItem[]> = ref([]);
const loading: Ref<boolean> = ref(false);

watch(
  () => _.cloneDeep(recentLocalActivity.value),
  async () => await getRecentActivityDetails()
);

onMounted(async () => init());

async function init(): Promise<void> {
  loading.value = true;
  await getRecentActivityDetails();
  loading.value = false;
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

function locateInTree(iri: string) {
  directoryStore.updateFindInTreeIri(iri);
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
</script>

<style scoped>
.loading-container {
  width: 100%;
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

.datatable-container {
  flex: 1 1 auto;
  overflow: auto;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
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
