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
      @rowUnselect="onRowUnselect"
      @rowSelect="onRowSelect"
      @rowContextmenu="onRowContextMenu"
      @contextmenu="onRightClick"
      @row-dblclick="onRowDblClick"
      :scrollable="true"
      scrollHeight="flex"
      :loading="isLoading"
      v-model:contextMenuSelection="selected"
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
      <!-- <Column field="entityType" header="Types">
        <template #body="slotProps">
          <span class="break-all">{{ slotProps.data.typeNames }}</span>
        </template>
      </Column>
      <Column field="status" header="Status">
        <template #body="slotProps">
          <span>{{ slotProps.data.status?.name }}</span>
        </template>
      </Column>
      <Column field="code" header="Code">
        <template #body="slotProps">
          <span class="break-all">{{ slotProps.data.code }}</span>
        </template>
      </Column> -->
      <Column field="weighting" header="Usage" headerStyle="flex: 0 0 5rem;" bodyStyle="flex: 0 0 5rem; text-align: center;">
        <template #body="slotProps">
          <span class="break-all">{{ slotProps.data.weighting }}</span>
        </template>
      </Column>
      <Column :exportable="false" bodyStyle="text-align: center; overflow: visible; justify-content: flex-end; flex: 0 1 14rem;" headerStyle="flex: 0 1 14rem;">
        <template #body="slotProps">
          <div class="buttons-container">
            <Button icon="fa-solid fa-sitemap" class="p-button-rounded p-button-text p-button-plain row-button" @click="locate(slotProps)" v-tooltip.top="" />
            <Button
              v-if="slotProps.data.hasChildren"
              @click="open"
              aria-haspopup="true"
              aria-controls="overlay_menu"
              type="button"
              class="p-button-rounded p-button-text p-button-plain row-button"
              icon="pi pi-folder-open"
              v-tooltip.top="'Open'"
            />
            <Button icon="pi pi-fw pi-eye" class="p-button-rounded p-button-text p-button-plain row-button" @click="view(slotProps)" v-tooltip.top="'View'" />
            <Button
              icon="pi pi-fw pi-info-circle"
              class="p-button-rounded p-button-text p-button-plain row-button"
              @click="showInfo(slotProps)"
              v-tooltip.top="'Info'"
            />
            <Button
              icon="fa-solid fa-pen-to-square"
              class="p-button-rounded p-button-text p-button-plain row-button"
              @click="edit(slotProps)"
              v-tooltip.top="'Edit'"
            />
            <Button
              v-if="isFavourite(slotProps.data.iri)"
              style="color: #e39a36"
              icon="pi pi-fw pi-star-fill"
              class="p-button-rounded p-button-text row-button-fav"
              @click="updateFavourites(slotProps)"
              v-tooltip.left="'Unfavourite'"
            />

            <Button
              v-else
              icon="pi pi-fw pi-star"
              class="p-button-rounded p-button-text p-button-plain row-button"
              @click="updateFavourites(slotProps)"
              v-tooltip.left="'Favourite'"
            />
          </div>
        </template>
      </Column>
    </DataTable>
    <ContextMenu :model="rClickOptions" ref="contextMenu" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, onMounted, ref, Ref, watch } from "vue";
import { mapState, useStore } from "vuex";
import _ from "lodash";
import { Helpers, Models, Services } from "im-library";
import { ConceptSummary } from "im-library/dist/types/interfaces/Interfaces";
import Chips from "primevue/chips";
import axios from "axios";
import { useRouter } from "vue-router";
const {
  ConceptTypeMethods: { getColourFromType, getFAIconFromType, isFolder, getNamesAsStringFromTypes },
  DataTypeCheckers: { isArrayHasLength, isObjectHasKeys }
} = Helpers;
const { DirectService, Env } = Services;

const emit = defineEmits({
  openBar: () => true
});

const router = useRouter();
const store = useStore();
const searchLoading = computed(() => store.state.searchLoading);
const filterDefaults = computed(() => store.state.filterDefaults);
const filterOptions = computed(() => store.state.filterOptions);
const selectedFilters = computed(() => store.state.selectedFilters);
const searchResults = computed(() => store.state.searchResults);
const favourites = computed(() => store.state.favourites);

const directService = new DirectService(axios);

let selectedSchemes: Ref<string[]> = ref([]);
let selectedStatus: Ref<string[]> = ref([]);
let selectedTypes: Ref<string[]> = ref([]);
let schemeOptions: Ref<string[]> = ref([]);
let statusOptions: Ref<string[]> = ref([]);
let typeOptions: Ref<string[]> = ref([]);
let localSearchResults: Ref<any[]> = ref([]);
let loading = ref(true);
let selected: Ref<any> = ref({});
let rClickOptions: Ref<any[]> = ref([
  {
    label: "Open",
    icon: "pi pi-fw pi-folder-open",
    command: () => open()
  },
  {
    label: "View",
    icon: "pi pi-fw pi-eye",
    command: () => view()
  },
  {
    label: "Info",
    icon: "pi pi-fw pi-info-circle",
    command: () => showInfo()
  },
  // {
  //   label: "Edit",
  //   icon: "pi pi-fw pi-pencil",
  //   command: () => this.navigateToEditor()
  // },
  // {
  //   label: "Move to",
  //   icon: "pi pi-fw pi-arrow-circle-right",
  //   command: () => this.showInfo()
  // },
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

watch(
  () => _.cloneDeep(searchResults.value),
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

function showInfo(row?: any) {
  if (row) selected.value = row.data;

  store.commit("updateSelectedConceptIri", selected.value.iri);
  emit("openBar");
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

function onRowSelect(row: any) {
  store.commit("updateSelectedConceptIri", row.data.iri);
}

function updateRClickOptions() {
  rClickOptions.value[rClickOptions.value.length - 1].label = isFavourite(selected.value.iri) ? "Unfavourite" : "Favourite";
}

function onRowContextMenu(event: any) {
  updateRClickOptions();
  contextMenu.value.show(event.originalEvent);
}

function onRowUnselect() {
  selected.value = {} as ConceptSummary;
}

function navigateToEditor(): void {
  directService.directTo(Env.EDITOR_URL, selected.value.iri, "editor");
}

function onRightClick(event: any) {
  updateRClickOptions();
  contextMenu.value.show(event);
}

function onRowDblClick(event: any) {
  selected.value = event.data;
  if (isFolder(selected.value.entityType)) open();
  else view();
}

function open() {
  router.push({
    name: "Folder",
    params: { selectedIri: selected.value.iri }
  });
}

function view(row?: any) {
  if (row) selected.value = row.data;
  directService.directTo(Env.VIEWER_URL, selected.value.iri, "concept");
}

function edit(row?: any) {
  if (row) selected.value = row.data;
  directService.directTo(Env.EDITOR_URL, selected.value.iri, "editor");
}

function locate(row: any) {
  if (row) {
    router.push({
      name: "Folder",
      params: { selectedIri: row.data.iri }
    });
    store.commit("updateLocateOnNavTreeIri", row.data.iri);
  }
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
