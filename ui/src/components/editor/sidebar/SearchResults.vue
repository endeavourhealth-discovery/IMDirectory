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
      <template #empty><div style="flex: 0 1 14rem">None</div></template>
      <Column field="name" header="Name" headerStyle="flex: 0 1 calc(100% - 19rem);" bodyStyle="flex: 0 1 calc(100% - 19rem);">
        <template #body="{ data }: any">
          <div class="ml-2">
            <IMFontAwesomeIcon v-if="data.icon" :icon="data.icon" :style="'color: ' + data.colour" class="p-mx-1" />
            <span class="break-word" @mouseover="showOverlay($event, data)" @mouseleave="hideOverlay($event)">{{ data.match }}</span>
          </div>
        </template>
      </Column>
      <Column field="weighting" header="Usage" headerStyle="flex: 0 0 5rem;" bodyStyle="flex: 0 0 5rem; text-align: center;">
        <template #body="{ data }: any">
          <span class="break-all">{{ data.weighting }}</span>
        </template>
      </Column>
      <Column :exportable="false" bodyStyle="text-align: center; overflow: visible; justify-content: flex-end; flex: 0 1 14rem;" headerStyle="flex: 0 1 14rem;">
        <template #body="{ data }: any">
          <div class="buttons-container">
            <Button
              :icon="'fa-solid fa-sitemap'"
              class="p-button-rounded p-button-text p-button-plain row-button"
              @click="locateInTree($event, data.iri)"
              v-tooltip.top="'Find in tree'"
              data-testid="select-button"
            />
            <Button
              icon="pi pi-fw pi-external-link"
              class="p-button-rounded p-button-text p-button-plain row-button"
              @click="directService.view(data.iri)"
              v-tooltip.top="'View in new tab'"
            />
            <Button
              icon="fa-solid fa-pen-to-square"
              class="p-button-rounded p-button-text p-button-plain row-button"
              @click="directService.edit(data.iri)"
              v-tooltip.top="'Edit'"
              data-testid="edit-button"
            />
            <Button
              v-if="isFavourite(data.iri)"
              style="color: var(--yellow-500)"
              icon="pi pi-fw pi-star-fill"
              class="p-button-rounded p-button-text row-button-fav"
              @click="updateFavourites(data)"
              v-tooltip.left="'Unfavourite'"
              data-testid="unfavourite-button"
            />
            <Button
              v-else
              icon="pi pi-fw pi-star"
              class="p-button-rounded p-button-text p-button-plain row-button"
              @click="updateFavourites(data)"
              v-tooltip.left="'Favourite'"
              data-testid="favourite-button"
            />
            <Button
              class="p-button-rounded p-button-text p-button-plain row-button drag-icon grabbable"
              icon="fa-solid fa-grip-vertical"
              draggable="true"
              @dragstart="dragStart($event, data.iri)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
    <ContextMenu :model="rClickOptions" ref="contextMenu" />
    <OverlaySummary ref="OS" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref, watch, PropType, ComputedRef } from "vue";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { ConceptSummary, FilterOptions } from "@im-library/interfaces";
import { DirectService } from "@/services";
import OverlaySummary from "@/components/directory/viewer/OverlaySummary.vue";
import rowClick from "@/composables/rowClick";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getColourFromType, getFAIconFromType, getNamesAsStringFromTypes } from "@im-library/helpers/ConceptTypeMethods";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useEditorStore } from "@/stores/editorStore";
import { useFilterStore } from "@/stores/filterStore";
import { useUserStore } from "@/stores/userStore";

interface Props {
  searchResults: any[];
  searchLoading: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits({
  openTreePanel: () => true
});

const directoryStore = useDirectoryStore();
const editorStore = useEditorStore();
const filterStore = useFilterStore();
const userStore = useUserStore();
const searchLoading = computed(() => directoryStore.searchLoading);
const filterOptions: ComputedRef<FilterOptions> = computed(() => filterStore.filterOptions);
const filterDefaults: ComputedRef<FilterOptions> = computed(() => filterStore.filterDefaults);
const favourites = computed(() => userStore.favourites);

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
  () => props.searchResults,
  () => init()
);

onMounted(() => init());

const isLoading = computed(() => loading.value || searchLoading.value);

function updateFavourites(data?: any) {
  if (data) selected.value = data;
  userStore.updateFavourites(selected.value.iri);
}

function isFavourite(iri: string) {
  if (!favourites.value.length) return false;
  return favourites.value.includes(iri);
}

function init() {
  loading.value = true;
  if (props.searchResults) {
    localSearchResults.value = [...props.searchResults];
  }
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
    .filter((option: any) => filterDefaults.value.schemes.includes(option.iri))
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
    if (isObjectHasKeys(searchResult.scheme, ["name"])) schemes.push(searchResult.scheme.name!);
    searchResult.entityType.forEach((type: any) => {
      if (filterDefaults.value.types.map(type => type["@id"]).includes(type["@id"])) types.push(type.name);
    });
    if (isObjectHasKeys(searchResult.status, ["name"])) status.push(searchResult.status.name!);
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
  (props.searchResults as ConceptSummary[]).forEach(searchResult => {
    let isSelectedType = false;
    searchResult.entityType.forEach((type: any) => {
      if (selectedTypes.value.indexOf(type.name) != -1) {
        isSelectedType = true;
      }
    });

    if (selectedSchemes.value.indexOf(searchResult.scheme.name!) != -1 && isSelectedType && selectedStatus.value.indexOf(searchResult.status.name!) != -1) {
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

function locateInTree(event: any, iri: string) {
  editorStore.updateFindInEditorTreeIri(iri);
  emit("openTreePanel");
}

function dragStart(event: any, data: any) {
  event.dataTransfer.setData("conceptIri", JSON.stringify(data));
  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.dropEffect = "copy";
}
</script>

<style scoped>
label {
  font-size: 1rem !important;
}

#search-results-main-container {
  height: 100%;
  width: 100%;
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
  background-color: var(--surface-a) !important;
  color: var(--text-color) !important;
}

.row-button-fav:hover {
  background-color: var(--yellow-500) !important;
  color: var(--text-color) !important;
}
</style>
