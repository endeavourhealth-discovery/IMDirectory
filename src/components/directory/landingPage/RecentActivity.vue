<template>
  <div class="loading-container flex flex-row items-center justify-center" v-if="loading">
    <ProgressSpinner />
  </div>
  <div v-else class="activity-container">
    <div class="flex flex-row flex-nowrap items-center justify-between">
      <span class="title"> Suggested </span>
      <Button @click="confirmClearRecentActivity" label="Clear suggestions" :disabled="!activities.length" data-testid="clear-suggestions-button" />
    </div>
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
          <template #body="{ data }: { data: RecentActivityItem }">
            <div class="activity-name-icon-container">
              <IMFontAwesomeIcon v-if="data.icon" :icon="data.icon" class="recent-icon" :style="data.color" />
              <span class="activity-name flex-1" @mouseover="showOverlay($event, data.iri)" @mouseleave="hideOverlay">{{ data.name }}</span>
            </div>
          </template>
        </Column>
        <Column field="latestActivity" header="Latest activity">
          <template #body="{ data }: { data: RecentActivityItem }">
            <span class="activity-message" v-tooltip="getActivityTooltipMessage(data)">{{ getActivityMessage(data) }}</span>
          </template>
        </Column>
        <Column :exportable="false">
          <template #body="{ data }: { data: RecentActivityItem }">
            <div class="action-buttons-container">
              <ActionButtons
                v-if="data.iri"
                :buttons="['findInTree', 'view', 'edit', 'favourite']"
                :iri="data.iri"
                :name="data.name"
                @locate-in-tree="locateInTree"
              />
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
import { RecentActivityItem } from "@/interfaces";
import ActionButtons from "@/components/shared/ActionButtons.vue";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { getDisplayFromDate } from "@/helpers/UtilityMethods";

import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import { cloneDeep, isArray } from "lodash-es";
import { TTIriRef } from "@/interfaces/AutoGen";
import { DirectService, EntityService } from "@/services";
import setupOverlay from "@/composables/setupOverlay";
import { RDF, RDFS } from "@/vocabulary";
import { useDirectoryStore } from "@/stores/directoryStore";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { useConfirm } from "primevue/useconfirm";

const { OS, showOverlay, hideOverlay } = setupOverlay();

const directService = new DirectService();
const directoryStore = useDirectoryStore();
const confirm = useConfirm();
const userStore = useUserStore();
const recentLocalActivity = computed(() => userStore.recentLocalActivity);
const selected: Ref<RecentActivityItem> = ref({} as RecentActivityItem);
const activities: Ref<RecentActivityItem[]> = ref([]);
const loading: Ref<boolean> = ref(false);

watch(
  () => cloneDeep(recentLocalActivity.value),
  async () => await getRecentActivityDetails()
);

onMounted(async () => await init());

async function init(): Promise<void> {
  loading.value = true;
  await getRecentActivityDetails();
  loading.value = false;
}

async function onRowSelect(event: { data: RecentActivityItem }) {
  await directService.select(event.data.iri);
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
  const iris = recentLocalActivity.value.map((rla: RecentActivityItem) => rla.iri);
  const results = await EntityService.getPartialEntities(iris, [RDFS.LABEL, RDF.TYPE]);

  const temp: RecentActivityItem[] = [];

  for (const rla of recentLocalActivity.value) {
    const clone = { ...rla };

    let result = null;
    if (results && isArray(results)) result = results.find(r => r["@id"] === rla.iri);

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

function confirmClearRecentActivity() {
  confirm.require({
    message: "Are you sure you want to clear suggested?",
    header: "Clear suggested",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true
    },
    acceptProps: {
      label: "Clear",
      severity: "danger"
    },
    accept: async () => {
      await clearRecentActivity();
    }
  });
}

async function clearRecentActivity() {
  await userStore.clearRecentLocalActivity();
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
  flex: 0 0 auto;
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
</style>
