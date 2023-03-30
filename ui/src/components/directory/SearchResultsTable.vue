<template>
  <div id="search-results-main-container">
    <div v-if="showFilters" class="filters-container">
      <div class="p-inputgroup">
        <span class="p-float-label">
          <MultiSelect id="status" v-model="selectedStatus" @change="filterResults" :options="statusOptions" display="chip" />
          <label for="status">Select status:</label>
        </span>
      </div>
      <div class="p-inputgroup">
        <span class="p-float-label">
          <MultiSelect id="scheme" v-model="selectedSchemes" @change="filterResults" :options="schemeOptions" display="chip" />
          <label for="scheme">Select scheme:</label>
        </span>
      </div>
      <div class="p-inputgroup">
        <span class="p-float-label">
          <MultiSelect id="type" v-model="selectedTypes" @change="filterResults" :options="typeOptions" display="chip" />
          <label for="type">Select concept type:</label>
        </span>
      </div>
    </div>

    <DataTable
      :paginator="true"
      :rows="20"
      :value="localSearchResults"
      class="p-datatable-sm"
      v-model:selection="selected"
      selectionMode="single"
      @row-select="onRowSelect"
      contextMenu
      @rowContextmenu="onRowContextMenu"
      :scrollable="true"
      scrollHeight="flex"
      :loading="isLoading"
      ref="searchTable"
      dataKey="iri"
      :autoLayout="true"
    >
      <template #empty> None </template>
      <Column field="name" headerStyle="flex: 0 1 calc(100% - 19rem);" bodyStyle="flex: 0 1 calc(100% - 19rem);">
        <template #header>
          Results
          <Button
            :disabled="!searchResults?.length"
            class="p-button-rounded p-button-text p-button-lg p-button-icon-only"
            :icon="fontAwesomePro ? 'fa-duotone fa-fw fa-file-arrow-down' : 'fa-solid fa-fw fa-file-arrow-down'"
            @click="exportCSV()"
            v-tooltip.right="'Download results table'"
          />
        </template>
        <template #body="slotProps: any">
          <div class="datatable-flex-cell">
            <i v-if="slotProps.data.icon" :style="'color: ' + slotProps.data.colour" :class="slotProps.data.icon" class="recent-icon" aria-hidden="true" />
            <span class="break-word" @mouseover="showOverlay($event, slotProps.data)" @mouseleave="hideOverlay($event)">{{
              slotProps.data.code ? slotProps.data.match + " | " + slotProps.data.code : slotProps.data.match
            }}</span>
          </div>
        </template>
      </Column>
      <Column field="weighting" header="Usage">
        <template #body="slotProps: any">
          <span>{{ slotProps.data.weighting }}</span>
        </template>
      </Column>
      <Column :exportable="false" bodyStyle="text-align: center; overflow: visible; justify-content: flex-end; flex: 0 1 14rem;" headerStyle="flex: 0 1 14rem;">
        <template #body="slotProps: any">
          <div class="buttons-container">
            <ActionButtons :buttons="['findInTree', 'view', 'edit', 'favourite']" :iri="slotProps.data.iri" />
          </div>
        </template>
      </Column>
    </DataTable>
    <ContextMenu :model="rClickOptions" ref="contextMenu" />
    <OverlaySummary ref="OS" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref, watch } from "vue";
import { useStore } from "vuex";
import { ConceptSummary, FilterOptions } from "@im-library/interfaces";
import { DirectService } from "@/services";
import OverlaySummary from "@/components/directory/viewer/OverlaySummary.vue";
import rowClick from "@/composables/rowClick";
import ActionButtons from "@/components/shared/ActionButtons.vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getColourFromType, getFAIconFromType, getNamesAsStringFromTypes } from "@im-library/helpers/ConceptTypeMethods";
import setupDownloadFile from "@/composables/downloadFile";

const props = defineProps({
  showFilters: { type: Boolean, required: false, default: true }
});

const store = useStore();
const searchLoading = computed(() => store.state.searchLoading);
const filterOptions: Ref<FilterOptions> = computed(() => store.state.filterOptions);
const filterDefaults: Ref<FilterOptions> = computed(() => store.state.filterDefaults);
const searchResults = computed(() => store.state.searchResults);
const favourites = computed(() => store.state.favourites);
const fontAwesomePro = computed(() => store.state.fontAwesomePro);

const { downloadFile } = setupDownloadFile(window, document);

const directService = new DirectService();

const selectedSchemes: Ref<string[]> = ref([]);
const selectedStatus: Ref<string[]> = ref([]);
const selectedTypes: Ref<string[]> = ref([]);
const schemeOptions: Ref<string[]> = ref([]);
const statusOptions: Ref<string[]> = ref([]);
const typeOptions: Ref<string[]> = ref([]);
const localSearchResults: Ref<any[]> = ref([]);
const loading = ref(true);
const selected: Ref<any> = ref({});
const rClickOptions: Ref<any[]> = ref([
  {
    label: "Select",
    icon: "fa-solid fa-sitemap",
    command: () => directService.select((selected.value as any).iri, "Folder")
  },
  {
    label: "View in new tab",
    icon: "pi pi-fw pi-external-link",
    command: () => directService.view((selected.value as any).iri)
  },
  {
    separator: true
  },
  {
    label: "Favourite",
    icon: "pi pi-fw pi-star",
    command: () => updateFavourites()
  }
]);

const OS: Ref<any> = ref();
const contextMenu = ref();
const menu = ref();
const { onRowClick }: { onRowClick: Function } = rowClick();

watch(
  () => searchResults.value,
  () => init()
);

onMounted(() => init());

const isLoading = computed(() => loading.value || searchLoading.value);

function updateFavourites(row?: any) {
  if (row) selected.value = row.data;
  store.commit("updateFavourites", selected.value.iri);
}

function isFavourite(iri: string) {
  if (!favourites.value.length) return false;
  return favourites.value.includes(iri);
}

function init() {
  loading.value = true;
  localSearchResults.value = [...searchResults.value];
  processSearchResults();
  if (isArrayHasLength(localSearchResults.value)) {
    setFiltersFromSearchResults();
  } else {
    setFilterDefaults();
  }
  loading.value = false;
}

function processSearchResults() {
  for (const result of localSearchResults.value) {
    if (isObjectHasKeys(result, ["entityType"])) {
      result.icon = getFAIconFromType(result.entityType);
      result.colour = getColourFromType(result.entityType);
      result.typeNames = getNamesAsStringFromTypes(result.entityType);
      result.favourite = isFavourite(result.iri);
    }
  }
}

function setFilterDefaults() {
  schemeOptions.value = filterOptions.value.schemes.map((scheme: any) => scheme.name);
  typeOptions.value = filterOptions.value.types.map((type: any) => type.name);
  statusOptions.value = filterOptions.value.status.map((item: any) => item.name);
  selectedSchemes.value = filterOptions.value.schemes
    .filter((option: any) => filterDefaults.value.schemes.includes(option["@id"]))
    .map((scheme: any) => scheme.name);
  selectedStatus.value = filterOptions.value.status
    .filter((option: any) => filterDefaults.value.status.includes(option["@id"]))
    .map((status: any) => status.name);
  selectedTypes.value = filterOptions.value.types.filter((option: any) => filterDefaults.value.types.includes(option["@id"])).map((type: any) => type.name);
}

function setFiltersFromSearchResults() {
  const schemes = [] as string[];
  const types = [] as string[];
  const status = [] as string[];
  (localSearchResults.value as ConceptSummary[]).forEach(searchResult => {
    schemes.push(searchResult.scheme?.name);
    searchResult.entityType.forEach((type: any) => {
      if (filterDefaults.value.types.map(type => type["@id"]).includes(type["@id"])) types.push(type.name);
    });
    status.push(searchResult.status?.name);
  });
  schemeOptions.value = [...new Set(schemes)];
  typeOptions.value = [...new Set(types)];
  statusOptions.value = [...new Set(status)];

  selectedSchemes.value = [...new Set(schemes)];
  selectedTypes.value = [...new Set(types)];
  selectedStatus.value = [...new Set(status)];
}

function filterResults() {
  const filteredSearchResults = [] as ConceptSummary[];
  (searchResults.value as ConceptSummary[]).forEach(searchResult => {
    let isSelectedType = false;
    searchResult.entityType.forEach((type: any) => {
      if (selectedTypes.value.indexOf(type.name) != -1) {
        isSelectedType = true;
      }
    });

    if (selectedSchemes.value.indexOf(searchResult.scheme.name) != -1 && isSelectedType && selectedStatus.value.indexOf(searchResult.status.name) != -1) {
      filteredSearchResults.push(searchResult);
    }
  });
  localSearchResults.value = [...filteredSearchResults];
  processSearchResults();
}

function updateRClickOptions() {
  rClickOptions.value[rClickOptions.value.length - 1].label = isFavourite(selected.value.iri) ? "Unfavourite" : "Favourite";
}

function onRowContextMenu(event: any) {
  selected.value = event.data;
  updateRClickOptions();
  contextMenu.value.show(event.originalEvent);
}

function onRowSelect(event: any) {
  onRowClick(event.data.iri);
}

async function showOverlay(event: any, data: any): Promise<void> {
  await OS.value.showOverlay(event, data.iri);
}

function hideOverlay(event: any): void {
  OS.value.hideOverlay(event);
}

function exportCSV(): void {
  const heading = ["name", "iri", "code"].join(",");
  const body = localSearchResults.value.map((row: any) => '"' + [row.name, row.iri, row.code].join('","') + '"').join("\n");
  const csv = [heading, body].join("\n");
  downloadFile(csv, "results.csv");
}
</script>

<style scoped>
label {
  font-size: 1rem !important;
}

#search-results-main-container {
  height: 100%;
  flex: 1 1 auto;
  overflow: auto;
  background-color: var(--surface-a);
  display: flex;
  flex-flow: column nowrap;
}

.filters-container {
  width: 100%;
  padding-top: 1rem;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
}

.p-inputgroup {
  width: 33.3%;
  padding: 0.5rem;
}

.p-datatable {
  flex: 1 1 auto;
  overflow: auto;
}

#search-results-main-container:deep(.p-datatable-thead) {
  z-index: 0 !important;
}

.buttons-container {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
  row-gap: 0.5rem;
}

.break-all {
  word-break: break-all;
}

.break-word {
  word-break: normal;
}

.recent-icon {
  width: 1.25rem;
  height: 1.25rem;
  font-size: 1.25rem;
  padding: 5px;
}

.datatable-flex-cell {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-flex: 1;
  -ms-flex: 1 1 0;
  flex: 1 1 0;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}
</style>
