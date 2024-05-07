<template>
  <div id="landing-page-container">
    <div class="flex flex-row justify-content-center align-items-center loading-container" v-if="loading">
      <ProgressSpinner />
    </div>
    <div id="landing-content" v-else>
      <div id="shortcuts-container">
        <h2>Quick links</h2>
        <div class="shortcuts">
          <template v-for="shortcut of shortcuts">
            <Shortcut
              :icon="shortcut.icon"
              :label="shortcut.label"
              :command="shortcut.command"
              :url="shortcut.url"
              :color="shortcut.color"
              :size="shortcut.size"
            />
          </template>
        </div>
      </div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, Ref, ref, watch, onMounted, defineComponent } from "vue";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import _, { isArray } from "lodash";
import { RecentActivityItem, IriCount, DashboardLayout } from "@im-library/interfaces";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { DirectService, EntityService, ConfigService, UserService } from "@/services";
import { IM, RDF, RDFS, SHACL } from "@im-library/vocabulary";
import rowClick from "@/composables/rowClick";
import { useUserStore } from "@/stores/userStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { getDisplayFromDate } from "@im-library/helpers/UtilityMethods";

import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { byOrder } from "@im-library/helpers/Sorters";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import setupOverlay from "@/composables/setupOverlay";
import Shortcut from "@/components/directory/landingPage/Shortcut.vue";
import ActionButtons from "../shared/ActionButtons.vue";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";

const userStore = useUserStore();
const directoryStore = useDirectoryStore();
const directService = new DirectService();
const recentLocalActivity = computed(() => userStore.recentLocalActivity);
const currentUser = computed(() => userStore.currentUser);

const activities: Ref<RecentActivityItem[]> = ref([]);
const selected: Ref<any> = ref({});
const loading: Ref<boolean> = ref(false);
const { onRowClick }: { onRowClick: Function } = rowClick();
const { OS, showOverlay, hideOverlay } = setupOverlay();
const shortcuts: Ref<{ label: string; icon: string | string[]; url?: string; command?: Function; color: string; size: number }[]> = ref([
  {
    label: "Ontology",
    icon: getFAIconFromType([{ "@id": IM.CONCEPT }]),
    command: () => directService.select(IM.NAMESPACE + "HealthModelOntology", "Folder"),
    color: getColourFromType([{ "@id": IM.CONCEPT }]),
    size: 4
  },
  {
    label: "Sets",
    icon: getFAIconFromType([{ "@id": IM.SET }]),
    command: () => directService.select(IM.MODULE_SETS, "Folder"),
    color: getColourFromType([{ "@id": IM.SET }]),
    size: 4
  },
  {
    label: "Models",
    icon: getFAIconFromType([{ "@id": SHACL.NODESHAPE }]),
    command: () => directService.select(IM.NAMESPACE + "DataModels", "Folder"),
    color: getColourFromType([{ "@id": SHACL.NODESHAPE }]),
    size: 4
  },
  {
    label: "Queries",
    icon: getFAIconFromType([{ "@id": IM.QUERY }]),
    command: () => directService.select(IM.MODULE_QUERIES, "Folder"),
    color: getColourFromType([{ "@id": IM.QUERY }]),
    size: 4
  },
  {
    label: "Creator",
    icon: "fa-duotone fa-circle-plus",
    command: () => directService.create(),
    color: "var(--orange-500)",
    size: 4
  },
  {
    label: "Code templates",
    icon: "fa-duotone fa-code",
    command: () => directService.codeGenerator(),
    color: "var(--teal-500)",
    size: 4
  },
  {
    label: "UPRN",
    icon: "fa-duotone fa-address-book",
    command: () => directService.uprn(),
    color: "var(--red-500)",
    size: 4
  },
  {
    label: "Wiki",
    icon: "/logos/ship-small.png",
    url: "https://wiki.endeavourhealth.org/index.php?title=Welcome_to_the_Endeavour_Health_knowledge_base",
    color: "var(--blue-500)",
    size: 4
  }
]);

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

#shortcuts-container {
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  flex: 0 1 auto;
  overflow: auto;
  padding: 1rem;
  gap: 1rem;
}

.shortcuts {
  display: flex;
  flex-flow: row wrap;
  padding: 0.5rem;
  gap: 2rem;
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
