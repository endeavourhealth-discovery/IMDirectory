<template>
  <div class="flex flex-row justify-content-center align-items-center loading-container" v-if="loading">
    <ProgressSpinner />
  </div>
  <div v-else class="favourites-container">
    <span class="title"> Favourites </span>
    <div class="datatable-container">
      <DataTable
        :value="favourites"
        v-model:selection="selected"
        selectionMode="single"
        @rowSelect="onRowSelect"
        dataKey="dateTime"
        :scrollable="true"
        scrollHeight="flex"
        class="p-datatable-sm favourites-datatable"
      >
        <template #empty>{{ !currentUser ? "Login to add favourites" : "No favourites" }}</template>
        <Column field="name" header="Name">
          <template #body="{ data }: any">
            <div class="favourite-name-icon-container">
              <IMFontAwesomeIcon v-if="data.icon" :icon="data.icon" class="recent-icon" :style="data.color" />
              <span class="favourite-name" @mouseover="showOverlay($event, data.iri)" @mouseleave="hideOverlay($event)">{{ data.name }}</span>
            </div>
          </template>
        </Column>
        <Column field="type" header="Type">
          <template #body="{ data }: any">
            <div class="favourite-type-container">
              <span class="favourite-type" @mouseover="showOverlay($event, data.iri)" @mouseleave="hideOverlay($event)">{{ data.entityType }}</span>
            </div>
          </template>
        </Column>
        <Column :exportable="false">
          <template #body="{ data }: any">
            <div class="action-buttons-container">
              <ActionButtons :buttons="['findInTree', 'view', 'edit', 'favourite']" :iri="data.iri" @locate-in-tree="locateInTree" />
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
import { RecentActivityItem, ExtendedSearchResultSummary } from "@im-library/interfaces";
import ActionButtons from "@/components/shared/ActionButtons.vue";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { getDisplayFromDate } from "@im-library/helpers/UtilityMethods";

import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { byOrder } from "@im-library/helpers/Sorters";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import _, { isArray } from "lodash-es";
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
const userFavourites = computed(() => userStore.favourites);
const currentUser = computed(() => userStore.currentUser);
const selected: Ref<any> = ref({});
const favourites: Ref<ExtendedSearchResultSummary[]> = ref([]);
const loading: Ref<boolean> = ref(false);

watch(
  () => _.cloneDeep(userFavourites.value),
  async () => await getFavouritesDetails()
);

onMounted(async () => init());

async function init(): Promise<void> {
  loading.value = true;
  await getFavouritesDetails();
  loading.value = false;
}

function onRowSelect(event: any) {
  directService.select(event.data.iri, "Folder");
}

function locateInTree(iri: string) {
  directoryStore.updateFindInTreeIri(iri);
}

async function getFavouritesDetails() {
  const results = await EntityService.getPartialEntities(userFavourites.value, [RDFS.LABEL, RDF.TYPE]);
  if (!results.length) {
    favourites.value = [];
    return;
  }
  const temp: any[] = [];
  for (const result of results) {
    let clone: ExtendedSearchResultSummary = {} as ExtendedSearchResultSummary;
    if (result && isObjectHasKeys(result, [RDF.TYPE, RDFS.LABEL, "@id"])) {
      clone.iri = result["@id"];
      clone.name = result[RDFS.LABEL];
      clone.entityType = result[RDF.TYPE].map((type: TTIriRef) => type.name).join(", ");
      clone.icon = getFAIconFromType(result[RDF.TYPE]);
      clone.color = "color:" + getColourFromType(result[RDF.TYPE]);
    }
    temp.push(clone);
  }
  favourites.value = temp;
}
</script>

<style scoped>
.loading-container {
  width: 100%;
}

.favourites-datatable {
  width: 100%;
}

.favourites-container {
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

.favourite-name-icon-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  overflow: auto;
  gap: 0.25rem;
}

.favourite-name {
  flex: 0 1 auto;
}
</style>
