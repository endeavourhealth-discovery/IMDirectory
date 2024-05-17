<template>
  <Dialog
    v-model:visible="visible"
    modal
    maximizable
    header="Search"
    :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh', backgroundColor: 'var(--surface-section)' }"
    class="search-dialog"
    @keyup.enter="onEnter"
  >
    <div class="directory-search-dialog-content">
      <div class="search-bar">
        <SearchBar
          v-model:searchTerm="searchTerm"
          :selected="selected"
          :imQuery="imQuery"
          :osQuery="osQuery"
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
            :show-quick-type-filters="showQuickTypeFilters"
            :quick-type-filters-allowed="quickTypeFiltersAllowed"
            :default-quick-type-filter="defaultQuickTypeFilter"
            :updateSearch="updateSearch"
            :search-term="searchTerm"
            :im-query="imQuery"
            :os-query="osQuery"
            :selected-filter-options="selectedFilterOptions"
            @selectedUpdated="updateSelected"
            @locate-in-tree="locateInTree"
            @selected-filters-updated="onSelectedFiltersUpdate"
          />
          <DirectoryDetails
            v-if="activePage === 1"
            :selected-iri="detailsIri"
            @locateInTree="locateInTree"
            @navigateTo="navigateTo"
            :showSelectButton="true"
            v-model:history="history"
            @selected-updated="updateSelectedFromIri"
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
          <Button :disabled="!isSelectableEntity" label="Select" :loading="validationLoading" @click="updateSelectedFromIri(detailsIri)" autofocus />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, Ref } from "vue";
import SearchBar from "@/components/shared/SearchBar.vue";
import SearchResults from "@/components/shared/SearchResults.vue";
import NavTree from "@/components/shared/NavTree.vue";
import DirectoryDetails from "@/components/directory/DirectoryDetails.vue";
import EclSearch from "@/components/directory/EclSearch.vue";
import IMQuerySearch from "@/components/directory/IMQuerySearch.vue";
import _, { cloneDeep } from "lodash";
import { EntityService, QueryService } from "@/services";
import { QueryRequest, SearchResultSummary, SearchResponse, SearchRequest } from "@im-library/interfaces/AutoGen";
import { IM, RDF, RDFS } from "@im-library/vocabulary";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { isQuery, isValueSet } from "@im-library/helpers/ConceptTypeMethods";
import { FilterOptions } from "@im-library/interfaces";

interface Props {
  showDialog: boolean;
  imQuery?: QueryRequest;
  osQuery?: SearchRequest;
  selected?: SearchResultSummary;
  rootEntities?: string[];
  searchTerm?: string;
  selectedFilterOptions?: FilterOptions;
  showQuickTypeFilters?: boolean;
  quickTypeFiltersAllowed?: string[];
  defaultQuickTypeFilter?: string;
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

const emit = defineEmits({
  "update:showDialog": payload => typeof payload === "boolean",
  "update:selected": payload => true,
  updateSelectedFilters: (payload: FilterOptions) => true
});

const updateSearch: Ref<boolean> = ref(false);
const hasQueryDefinition: Ref<boolean> = ref(false);
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
const searchTerm = ref("");

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
      hasQueryDefinition.value = await getHasQueryDefinition();
      isSelectableEntity.value = await getIsSelectableEntity();
      validationLoading.value = false;
    }
  }
);

const history: Ref<string[]> = ref([]);
const activePage = ref(0);
const selectedName = ref("");

watch(searchResults, newValue => {
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
  history.value = [];
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
    const imQuery = _.cloneDeep(props.imQuery);
    imQuery.textSearch = selectedName.value;
    const imQueryResponse = await QueryService.queryIM(imQuery);
    if (!isObjectHasKeys(imQueryResponse, ["entities"]) || !isArrayHasLength(imQueryResponse.entities)) return false;
    return imQueryResponse.entities.some(item => item["@id"] === detailsIri.value);
  } else if (props.osQuery) {
    const osQuery = _.cloneDeep(props.osQuery);
    osQuery.termFilter = selectedName.value;
    const osQueryResposne = await EntityService.advancedSearch(osQuery);
    if (!isObjectHasKeys(osQueryResposne, ["entities"]) || !isArrayHasLength(osQueryResposne.entities)) return false;
    return osQueryResposne.entities!.some(item => item.iri === detailsIri.value);
  }
  return true;
}

async function getHasQueryDefinition() {
  if (!detailsIri.value) return false;
  const entity = await EntityService.getPartialEntity(detailsIri.value, [RDF.TYPE, IM.DEFINITION]);
  const hasDefinition = isObjectHasKeys(entity, [RDF.TYPE, IM.DEFINITION]);
  const isQueryOrSet = isQuery(entity[RDF.TYPE]) || isValueSet(entity[RDF.TYPE]);
  return hasDefinition && isQueryOrSet;
}

function onEnter() {
  if (selectedName.value && isSelectableEntity.value) updateSelectedFromIri(detailsIri.value);
}

function onSelectedFiltersUpdate(selectedFilters: FilterOptions) {
  if (props.osQuery) {
    for (const key of Object.keys(selectedFilters)) {
      (props.osQuery as any)[key] = (selectedFilters as any)[key];
    }
  } else if (props.imQuery) {
    if (!props.imQuery.query.match) props.imQuery.query.match = [];
    if (isArrayHasLength(selectedFilters.types)) props.imQuery.query.match.push({ where: [{ "@id": IM.TYPE, is: selectedFilters.types }] });
    if (isArrayHasLength(selectedFilters.schemes)) props.imQuery.query.match.push({ where: [{ "@id": IM.HAS_SCHEME, is: selectedFilters.schemes }] });
    if (isArrayHasLength(selectedFilters.status)) props.imQuery.query.match.push({ where: [{ "@id": IM.HAS_STATUS, is: selectedFilters.status }] });
  } else {
    emit("updateSelectedFilters", selectedFilters);
  }
  updateSearch.value = !updateSearch.value;
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
  background-color: var(--surface-100);
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

<style>
.p-dialog-content {
  flex: 1 1 auto;
  display: flex;
}
</style>
