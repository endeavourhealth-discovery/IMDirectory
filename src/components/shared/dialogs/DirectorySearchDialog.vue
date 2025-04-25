<template>
  <Dialog
    v-model:visible="visible"
    modal
    maximizable
    header="Search"
    :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh' }"
    class="search-dialog"
    @keyup.enter="onEnter"
  >
    <div class="directory-search-dialog-content">
      <div class="search-bar">
        <SearchBar
          v-model:searchTerm="searchTerm"
          :selected="selected"
          :imQuery="imQuery"
          :show-filters="false"
          @to-ecl-search="showEclSearch"
          @to-query-search="showQuerySearch"
          @to-search="onSearch"
        />
      </div>
      <div class="vertical-divider">
        <div class="left-container">
          <NavTree
            :selectedIri="treeIri"
            :root-entities="rootEntities"
            :typeFilter="typeFilter"
            :find-in-tree="findInDialogTree"
            @found-in-tree="findInDialogTree = false"
            @row-selected="showDetails"
          />
        </div>
        <div class="right-container">
          <SearchResults
            v-if="activePage === 0"
            :selected="selected"
            :show-filters="showFilters"
            :show-quick-type-filters="isArrayHasLength(quickTypeFiltersAllowed)"
            :quick-type-filters-allowed="quickTypeFiltersAllowed"
            :selected-quick-type-filter="selectedQuickTypeFilter"
            :updateSearch="updateSearch"
            :search-term="searchTerm"
            :im-query="imQuery"
            :selected-filter-options="selectedFilterOptions"
            @selectedUpdated="updateSelected"
            @locate-in-tree="locateInTree"
            @selected-filters-updated="onSelectedFiltersUpdate"
            @searchResultsUpdated="updateSearchResults"
          />
          <DirectoryDetails
            v-if="activePage === 1"
            :selected-iri="detailsIri"
            @locateInTree="locateInTree"
            @navigateTo="navigateTo"
            :showSelectButton="true"
            v-model:history="directoryHistory"
            :searchResults
            @selected-updated="updateSelectedFromIri"
            @go-to-search-results="goToSearchResults"
          />
          <EclSearch v-if="activePage === 2" @locate-in-tree="locateInTree" @selected-updated="updateSelected" />
          <IMQuerySearch v-if="activePage === 3" @locate-in-tree="locateInTree" @selected-updated="updateSelected" />
        </div>
      </div>
    </div>
    <template #footer>
      <div class="im-dialog-footer" v-if="detailsIri">
        <div v-if="selectedName" v-tooltip.right="detailsIri">Item selected: {{ selectedName }}</div>
        <div class="button-footer">
          <Button label="Cancel" @click="visible = false" text />
          <Button
            :disabled="!isSelectableEntity"
            data-testid="search-dialog-select-button"
            label="Select"
            :loading="validationLoading"
            @click="updateSelectedFromIri(detailsIri)"
            autofocus
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, Ref, computed } from "vue";
import SearchBar from "@/components/shared/SearchBar.vue";
import SearchResults from "@/components/shared/SearchResults.vue";
import NavTree from "@/components/shared/NavTree.vue";
import DirectoryDetails from "@/components/directory/DirectoryDetails.vue";
import EclSearch from "@/components/directory/EclSearch.vue";
import IMQuerySearch from "@/components/directory/IMQuerySearch.vue";
import { cloneDeep } from "lodash-es";
import { EntityService, QueryService } from "@/services";
import { QueryRequest, SearchResultSummary, SearchResponse } from "@/interfaces/AutoGen";
import { RDFS } from "@/vocabulary";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { FilterOptions } from "@/interfaces";

interface Props {
  showDialog: boolean;
  imQuery?: QueryRequest;
  selected?: SearchResultSummary;
  rootEntities?: string[];
  searchTerm?: string;
  selectedFilterOptions?: FilterOptions;
  quickTypeFiltersAllowed?: string[];
  selectedQuickTypeFilter?: string;
  showFilters?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showFilters: false
});
watch(
  () => props.showDialog,
  newValue => {
    if (newValue === true) initSelection();
    visible.value = newValue;
  }
);

const emit = defineEmits<{
  "update:showDialog": [payload: boolean];
  "update:selected": [selected: SearchResultSummary];
  updateSelectedFilters: [filterOptions: FilterOptions];
}>();

const updateSearch: Ref<boolean> = ref(false);
const validationLoading: Ref<boolean> = ref(false);
const isSelectableEntity: Ref<boolean> = ref(false);
const findInDialogTree = ref(false);
const visible = ref(false);
watch(visible, newValue => {
  if (!newValue) {
    emit("update:showDialog", newValue);
    resetDialog();
  }
});
const searchResults: Ref<SearchResponse | undefined> = ref();
const searchLoading = ref(false);
const treeIri = ref("");
const searchTerm = ref(props.searchTerm ?? "");
const typeFilter = computed(() => props.selectedFilterOptions?.types.map(item => item["@id"]));
watch(
  () => treeIri.value,
  () => {
    findInDialogTree.value = true;
  }
);
const detailsIri = ref("");

watch(
  () => detailsIri.value,
  async () => {
    if (detailsIri.value) {
      validationLoading.value = true;
      await setSelectedName();
      isSelectableEntity.value = await getIsSelectableEntity();
      validationLoading.value = false;
    }
  }
);

const directoryHistory: Ref<string[]> = ref([]);
const activePage = ref(0);
const selectedName = ref("");

watch(searchResults, () => {
  detailsIri.value = "";
  activePage.value = 0;
});

watch(
  () => cloneDeep(props.selected),
  () => initSelection()
);

onMounted(() => {
  visible.value = props.showDialog;
  searchTerm.value = props.searchTerm ?? "";
  initSelection();
});

function onSearch() {
  if (searchTerm.value) {
    activePage.value = 0;
    updateSearch.value = !updateSearch.value;
  }
}

async function setSelectedName() {
  if (detailsIri.value) {
    const entity = await EntityService.getPartialEntity(detailsIri.value, [RDFS.LABEL]);
    selectedName.value = entity[RDFS.LABEL];
  }
}

function initSelection() {
  if (props.selected && props.selected.iri) {
    navigateTo(props.selected.iri);
    locateInTree(props.selected.iri);
  }
}

function updateSelected(data: SearchResultSummary) {
  navigateTo(data.iri);
  locateInTree(data.iri);
}

async function updateSelectedFromIri(iri: string) {
  const entity = await EntityService.getEntitySummary(iri);
  emit("update:selected", entity);
  visible.value = false;
}

function locateInTree(iri: string) {
  treeIri.value = iri;
}

function showDetails(data: any) {
  detailsIri.value = data.key;
  activePage.value = 1;
}

function navigateTo(iri: string) {
  detailsIri.value = iri;
  activePage.value = 1;
}

function resetDialog() {
  searchResults.value = undefined;
  searchLoading.value = false;
  treeIri.value = "";
  detailsIri.value = "";
  directoryHistory.value = [];
  activePage.value = 0;
}

function showEclSearch() {
  activePage.value = 2;
}

function showQuerySearch() {
  activePage.value = 3;
}

async function getIsSelectableEntity(): Promise<boolean> {
  if (props.imQuery) {
    const imQuery = cloneDeep(props.imQuery);
    imQuery.askIri = detailsIri.value;
    return await QueryService.askQuery(imQuery);
  }
  return true;
}

function onEnter() {
  if (selectedName.value && isSelectableEntity.value) updateSelectedFromIri(detailsIri.value);
}

function onSelectedFiltersUpdate(selectedFilters: FilterOptions) {
  emit("updateSelectedFilters", selectedFilters);
  updateSearch.value = !updateSearch.value;
}

function updateSearchResults(newSearchResults: SearchResponse | undefined) {
  searchResults.value = newSearchResults;
}

function goToSearchResults() {
  activePage.value = 0;
}
</script>

<style scoped>
.directory-search-dialog-content {
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
}

.vertical-divider {
  width: 100%;
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: row nowrap;
}

.left-container {
  flex: 0 0 30%;
  overflow: auto;
}

.right-container {
  flex: 1 1 auto;
  overflow: auto;
}

.search-bar {
  min-height: 3.5rem;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: 0 0.5rem;
}

.im-dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
}

.button-footer {
  display: flex;
  flex: 1 0 auto;
  flex-wrap: nowrap;
  justify-content: flex-end;
}
</style>
