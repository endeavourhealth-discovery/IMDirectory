<template>
  <Dialog
    v-model:visible="modelShowDialog"
    :contentStyle="{ display: 'flex', flexDirection: 'column', height: '100%' }"
    :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh' }"
    header="Search"
    maximizable
    modal
    @keyup.enter="onEnter"
  >
    <div class="directory-search-dialog-content">
      <div class="search-bar">
        <SearchBar
          v-model:searchTerm="searchTerm"
          :imQuery="imQuery"
          :selected="selected"
          :show-filters="false"
          @to-ecl-search="showEclSearch"
          @to-query-search="showQuerySearch"
          @to-search="onSearch"
        />
      </div>
      <Splitter stateKey="directorySearchSplitterHorizontal" stateStorage="local" style="height: 100%; flex: 1 1 auto" @resizeend="updateSplitter">
        <SplitterPanel :minSize="10" :size="30">
          <div style="height: 100%; display: flex; flex-direction: column">
            <div style="flex: 1; overflow-y: auto">
              <div v-if="directoryLoading" class="loading-container flex flex-row items-center justify-center">
                <ProgressSpinner />
              </div>

              <NavTree
                :childLength="20"
                :root-entities="rootEntities"
                :selectedIri="treeIri"
                :typeFilter="typeFilter"
                :useEmits="true"
                @found-in-tree="findInDialogTree = false"
                @row-clicked="showDetails"
              />
            </div>
          </div>
        </SplitterPanel>
        <SplitterPanel :minSize="10" :size="70">
          <div style="height: 100%; display: flex; flex-direction: column">
            <div style="flex: 1; overflow-y: auto">
              <SearchResults
                v-if="activePage === 0"
                :im-query="imQuery"
                :quick-type-filters-allowed="quickTypeFiltersAllowed"
                :search-term="searchTerm"
                :selected="selected"
                :selected-filter-options="selectedFilterOptions"
                :selected-quick-type-filter="selectedQuickTypeFilter"
                :show-filters="showFilters"
                :show-quick-type-filters="isArrayHasLength(quickTypeFiltersAllowed)"
                :updateSearch="updateSearch"
                @searchResultsUpdated="updateSearchResults"
                @selectedUpdated="updateSelected"
                @locate-in-tree="locateInTree"
                @selected-filters-updated="onSelectedFiltersUpdate"
              />
              <DirectoryDetails
                v-if="activePage === 1"
                v-model:history="directoryHistory"
                :searchResults
                :selected-iri="detailsIri"
                :showSelectButton="true"
                @locateInTree="locateInTree"
                @navigateTo="navigateTo"
                @selected-updated="updateSelectedFromIri"
                @go-to-search-results="goToSearchResults"
              />
              <span>Show the ecl search</span>
              <EclSearch v-if="activePage === 2" @locate-in-tree="locateInTree" @selected-updated="updateSelected" />
              <IMQuerySearch v-if="activePage === 3" @locate-in-tree="locateInTree" @selected-updated="updateSelected" />
            </div>
          </div>
        </SplitterPanel>
      </Splitter>
    </div>
    <template #footer>
      <div class="im-dialog-footer">
        <div v-if="selectedName" v-tooltip.right="detailsIri">Item selected: {{ selectedName }}</div>
        <div class="button-footer">
          <Button label="Cancel" text @click="onCancel" />
          <Button
            v-if="selectedName && isSelectableEntity"
            :disabled="!isSelectableEntity"
            :loading="validationLoading"
            autofocus
            data-testid="search-dialog-select-button"
            label="Select"
            @click="updateSelectedFromIri(detailsIri)"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { Ref, computed, onMounted, ref, watch } from "vue";

import { Argument } from "@endeavour/vue-library";
import { RDFS } from "@endeavour/vue-library/enums";
import { isArrayHasLength } from "@endeavour/vue-library/helpers";
import { ArgumentSchema, type FilterOptions, type QueryRequest, type SearchResponse, type SearchResultSummary } from "@endeavour/vue-library/models";

import { cloneDeep, isString } from "lodash-es";
import { SplitterResizeEndEvent } from "primevue/splitter";

import EclSearch from "@/components/directory/EclSearch.vue";
import IMQuerySearch from "@/components/directory/IMQuerySearch.vue";
import NavTree from "@/components/shared/NavTree.vue";
import SearchBar from "@/components/shared/SearchBar.vue";
import SearchResults from "@/components/shared/SearchResults.vue";
import { EntityService, QueryService } from "@/services";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useLoadingStore } from "@/stores/loadingStore";

interface Props {
  imQuery?: QueryRequest;
  rootEntities?: string[];
  searchTerm?: string;
  selectedFilterOptions?: FilterOptions;
  quickTypeFiltersAllowed?: string[];
  selectedQuickTypeFilter?: string;
  showFilters?: boolean;
  validEntityQuery?: QueryRequest;
}

const props = withDefaults(defineProps<Props>(), {
  showFilters: false
});

const emit = defineEmits<{
  updateSelectedFilters: [payload: FilterOptions];
  cancel: [];
}>();

const modelShowDialog = defineModel<boolean>("showDialog", { required: true });
const modelSelected = defineModel<SearchResultSummary | undefined>("selected");
const loadingStore = useLoadingStore();
const directoryStore = useDirectoryStore();
const directoryLoading = computed(() => loadingStore.directoryLoading);
const updateSearch: Ref<boolean> = ref(false);
const validationLoading: Ref<boolean> = ref(false);
const isSelectableEntity: Ref<boolean> = ref(false);
const findInDialogTree = ref(false);
const searchResults: Ref<SearchResponse | undefined> = ref();
const loading = ref(true);
const searchLoading = ref(false);
const treeIri = ref("");
const searchTerm = ref(props.searchTerm ?? "");
const lastSearchTerm = ref(searchTerm.value);
const typeFilter = computed(() => props.selectedFilterOptions?.types.map(item => item.iri));

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
  () => cloneDeep(modelSelected.value),
  () => initSelection()
);

onMounted(() => {
  searchTerm.value = props.searchTerm ?? "";
  initSelection();
});
function onCancel() {
  modelShowDialog.value = false;
  emit("cancel");
}

function updateSplitter(event: SplitterResizeEndEvent) {
  directoryStore.updateSplitterRightSize(event.sizes[1]);
}
function onSearch() {
  if (searchTerm.value && searchTerm.value !== lastSearchTerm.value) {
    lastSearchTerm.value = searchTerm.value;
    activePage.value = 0;
    updateSearch.value = !updateSearch.value;
  }
}

async function setSelectedName() {
  if (detailsIri.value) {
    const entity = await EntityService.getPartialEntity(detailsIri.value, [RDFS.LABEL]);
    if (isString(entity[RDFS.LABEL])) {
      selectedName.value = entity[RDFS.LABEL];
    }
  }
}

function initSelection() {
  if (modelSelected.value && modelSelected.value.iri) {
    navigateTo(modelSelected.value.iri);
    locateInTree(modelSelected.value.iri);
  }
}

function updateSelected(data: SearchResultSummary) {
  navigateTo(data.iri);
  locateInTree(data.iri);
}

async function updateSelectedFromIri(iri: string) {
  const entity = await EntityService.getEntitySummary(iri);
  modelSelected.value = entity;
  modelShowDialog.value = false;
}

function locateInTree(iri: string) {
  treeIri.value = iri;
}

async function showDetails(data: any) {
  const entity = await EntityService.getEntitySummary(data);
  detailsIri.value = data;
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
  if (props.validEntityQuery) {
    const existing = props.validEntityQuery.argument!.find(a => a.parameter === "entity");
    if (existing) {
      existing.valueIri = { iri: detailsIri.value };
    } else props.validEntityQuery.argument!.push({ parameter: "entity", valueIri: { iri: detailsIri.value } } as Argument);
    return await QueryService.askQuery(props.validEntityQuery);
  }
  return true;
}

async function onEnter() {
  if (selectedName.value && isSelectableEntity.value) await updateSelectedFromIri(detailsIri.value);
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
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border-bottom: 10px solid #ccc;
}

.search-bar {
  height: 3.5rem;
  flex-shrink: 0;
  flex-flow: row nowrap;
  align-items: center;
  padding: 0 0.5rem;
}

.im-dialog-footer {
  border-top: 1px solid #ccc;
  padding: 1rem;
}
.dialog-body-wrapper {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
}
.flex-spacer {
  flex: 1;
}

.button-footer {
  display: flex;
  flex: 1 0 auto;
  flex-wrap: nowrap;
  justify-content: flex-end;
}
</style>
