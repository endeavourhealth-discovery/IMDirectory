<template>
  <div id="search-results-main-container">
    <div class="filters-container">
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
      <Column field="name" header="Name" headerStyle="flex: 0 1 calc(100% - 19rem);" bodyStyle="flex: 0 1 calc(100% - 19rem);">
        <template #body="slotProps">
          <div class="ml-2">
            <span :style="'color: ' + slotProps.data.colour" class="p-mx-1">
              <i v-if="slotProps.data.icon" :class="slotProps.data.icon" aria-hidden="true" />
            </span>
            <span class="break-word">{{ slotProps.data.match }}</span>
          </div>
        </template>
      </Column>
      <Column field="weighting" header="Usage" headerStyle="flex: 0 0 5rem;" bodyStyle="flex: 0 0 5rem; text-align: center;">
        <template #body="slotProps">
          <span class="break-all">{{ slotProps.data.weighting }}</span>
        </template>
      </Column>
      <Column :exportable="false" bodyStyle="text-align: center; overflow: visible; justify-content: flex-end; flex: 0 1 14rem;" headerStyle="flex: 0 1 14rem;">
        <template #body="slotProps">
          <div class="buttons-container">
            <Button
              :icon="slotProps.data.hasChildren ? 'pi pi-folder-open' : 'fa-solid fa-sitemap'"
              class="p-button-rounded p-button-text p-button-plain row-button"
              @click="directService.select(slotProps.data.iri, 'Folder')"
              v-tooltip.top="slotProps.data.hasChildren ? 'Open' : 'Select'"
              data-testid="select-button"
            />
            <Button
              icon="pi pi-fw pi-external-link"
              class="p-button-rounded p-button-text p-button-plain row-button"
              @click="directService.view(slotProps.data.iri)"
              v-tooltip.top="'View in new tab'"
            />
            <Button
              icon="fa-solid fa-pen-to-square"
              class="p-button-rounded p-button-text p-button-plain row-button"
              @click="directService.edit(slotProps.data.iri)"
              v-tooltip.top="'Edit'"
              data-testid="edit-button"
            />
            <Button
              v-if="isFavourite(slotProps.data.iri)"
              style="color: #e39a36"
              icon="pi pi-fw pi-star-fill"
              class="p-button-rounded p-button-text row-button-fav"
              @click="updateFavourites(slotProps)"
              v-tooltip.left="'Unfavourite'"
              data-testid="unfavourite-button"
            />
            <Button
              v-else
              icon="pi pi-fw pi-star"
              class="p-button-rounded p-button-text p-button-plain row-button"
              @click="updateFavourites(slotProps)"
              v-tooltip.left="'Favourite'"
              data-testid="favourite-button"
            />
          </div>
        </template>
      </Column>
    </DataTable>
    <ContextMenu :model="rClickOptions" ref="contextMenu" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref, watch } from "vue";
import { useStore } from "vuex";
import _ from "lodash";
import { ConceptSummary } from "im-library/interfaces";
import { ConceptTypeMethods, DataTypeCheckers } from "im-library/helpers";
import { DirectService, Env } from "@/services";
import rowClick from "@/composables/rowClick";
const { getColourFromType, getFAIconFromType, isFolder, getNamesAsStringFromTypes } = ConceptTypeMethods;
const { isArrayHasLength, isObjectHasKeys } = DataTypeCheckers;

const store = useStore();
const searchLoading = computed(() => store.state.searchLoading);
const filterDefaults = computed(() => store.state.filterDefaults);
const filterOptions = computed(() => store.state.filterOptions);
const selectedFilters = computed(() => store.state.selectedFilters);
const searchResults = computed(() => store.state.searchResults);
const favourites = computed(() => store.state.favourites);

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
    .filter((option: any) => filterDefaults.value.schemeOptions.includes(option.iri))
    .map((scheme: any) => scheme.name);
  selectedStatus.value = filterOptions.value.status
    .filter((option: any) => filterDefaults.value.statusOptions.includes(option["@id"]))
    .map((status: any) => status.name);
  selectedTypes.value = filterOptions.value.types
    .filter((option: any) => filterDefaults.value.typeOptions.includes(option["@id"]))
    .map((type: any) => type.name);
}

function setFiltersFromSearchResults() {
  const schemes = [] as string[];
  const types = [] as string[];
  const status = [] as string[];
  (localSearchResults.value as ConceptSummary[]).forEach(searchResult => {
    schemes.push(searchResult.scheme?.name);
    searchResult.entityType.forEach((type: any) => {
      if (filterDefaults.value.typeOptions.includes(type["@id"])) types.push(type.name);
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
</script>

<style scoped>
label {
  font-size: 1rem !important;
}

#search-results-main-container {
  height: 100%;
  flex: 1 1 auto;
  overflow: auto;
  background-color: #ffffff;
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

.row-button:hover {
  background-color: #6c757d !important;
  color: #ffffff !important;
}

.row-button-fav:hover {
  background-color: #e39a36 !important;
  color: #ffffff !important;
}
</style>
