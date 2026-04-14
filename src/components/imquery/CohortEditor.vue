<template>
  <Dialog
    v-model:visible="showDialog"
    modal
    maximizable
    header="Search"
    :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh' }"
    :contentStyle="{ display: 'flex', flexDirection: 'column', height: '100%' }"
  >
    <div v-if="loading" class="flex w-full flex-auto flex-col flex-nowrap">
      <ProgressSpinner />
    </div>
    <div>
      <Button
        :icon="match.notExists ? 'pi pi-times' : 'pi pi-check'"
        class="p-button-text p-button-rounded"
        :class="match.notExists ? 'text-red-500' : 'text-green-500'"
        v-tooltip="notExistsLabel"
        @click="toggleNotExists"
      />
      <span>{{ notExistsLabel }}</span>
    </div>

    <span v-if="match.is">Currently selected :{{ match.is[0].name }}</span>
    <div class="directory-search-dialog-content">
      <div class="search-bar">
        <SearchBar v-model:searchTerm="searchTerm" :selected="selected" :imQuery="cohortQuery" :show-filters="false" @to-search="onSearch" />
      </div>
      <Splitter class="splitter" layout="horizontal">
        <SplitterPanel :size="25" class="column-selector">
          <div style="height: 100%; display: flex; flex-direction: column">
            <div style="flex: 1; overflow-y: auto">
              <NavTree
                :selectedIri="treeIri"
                :root-entities="rootEntities"
                :typeFilter="typeFilter"
                :find-in-tree="findInDialogTree"
                :useEmits="true"
                :childLength="20"
                @found-in-tree="findInDialogTree = false"
                @row-clicked="showDetails"
              />
            </div>
          </div>
        </SplitterPanel>
        <SplitterPanel :size="50" :minSize="10">
          <div style="height: 100%; display: flex; flex-direction: column">
            <div style="flex: 1; overflow-y: auto">
              <SearchResults
                v-if="activePage === 0"
                :selected="selected"
                :show-filters="false"
                :updateSearch="updateSearch"
                :search-term="searchTerm"
                :im-query="cohortQuery"
                :selected-filter-options="cohortFilterOptions"
                @selectedUpdated="updateSelected"
                @searchResultsUpdated="updateSearchResults"
              />
              <DirectoryDetails
                v-if="cohortIri"
                :selected-iri="cohortIri"
                @locateInTree="locateInTree"
                @navigateTo="navigateTo"
                :showSelectButton="true"
                v-model:history="directoryHistory"
                :searchResults
                @selected-updated="updateSelectedFromIri"
                @go-to-search-results="goToSearchResults"
              />
            </div>
          </div>
        </SplitterPanel>
      </Splitter>
    </div>
    <template #footer>
      <div class="button-footer">
        <Button data-testid="cancel-edit-feature-button" label="Cancel" class="add-button" text @click="onCancel" />
        <Button
          v-if="cohortIri"
          type="button"
          data-testid="import-reference-button"
          class="add-button"
          label="Import query as reference"
          text
          @click="updateCohort"
        />
        <Button
          v-if="cohortIri && importClauses.size > 0"
          type="button"
          data-testid="import-definition-button"
          class="add-button"
          label="Import selected clause as clause"
          text
          @click="updateClauses"
        />
        <Button v-if="edited && !cohortIri" autofocus data-testid="save-feature-button" label="Save" @click="emit('updateCohort')" />
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, Ref, watch, provide } from "vue";
import { IM, NAMESPACE } from "vue-library/enums";
import type { Match, Node, QueryRequest, SearchResponse, SearchResultSummary, TTIriRef } from "vue-library/interfaces";
import { buildIMQueryFromFilters } from "@/helpers/buildQuery";
import { SearchOptions } from "@/interfaces";
import { EntityService } from "@/services";
import { v4 } from "uuid";
import SearchBar from "@/components/shared/SearchBar.vue";
import NavTree from "@/components/shared/NavTree.vue";
import SearchResults from "@/components/shared/SearchResults.vue";
import DirectoryDetails from "@/components/directory/DirectoryDetails.vue";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";

const editMode = defineModel<boolean>("editMode");
const match = defineModel<Match>("match", { default: {} });
const modelSelected = defineModel<SearchResultSummary | undefined>("selected");
const importClauses: Ref<Map<string, Match>> = ref(new Map() as Map<string, Match>);
provide("importClauses", importClauses.value);
const rootEntities: Ref<string[]> = ref([]);
const cohort: Ref<SearchResultSummary> = ref({} as SearchResultSummary);
const showDialog = ref(true);
const selected: Ref<SearchResultSummary | undefined> = ref();
const searchTerm = ref("");
const activePage = ref(0);
const lastSearchTerm = ref(searchTerm.value);
const updateSearch: Ref<boolean> = ref(false);
const findInDialogTree = ref(false);
const searchResults: Ref<SearchResponse | undefined> = ref();
const edited: Ref<boolean> = ref(false);
const cohortFilterOptions: Ref<SearchOptions> = ref({
  types: [{ iri: IM.QUERY }],
  status: [{ iri: IM.ACTIVE }, { iri: IM.DRAFT }],
  schemes: []
});
const typeFilter: Ref<string[]> = ref([IM.QUERY]);
const loading = ref(false);
const cohortQuery: Ref<QueryRequest> = ref({} as QueryRequest);
const treeIri = ref("");
const cohortIri = ref("");
const directoryHistory: Ref<string[]> = ref([]);
const isSelectableEntity: Ref<boolean> = ref(false);
const emit = defineEmits<{
  (event: "updateCohort"): void;
  (event: "updateClauses", clause: Match): void;
  (event: "navigateTo", iri: string): void;
  (event: "cancel"): void;
}>();

const toggleNotExists = () => {
  if (match.value.notExists === undefined) {
    match.value.notExists = true;
  } else {
    delete match.value.notExists;
  }
  edited.value = true;
};

const notExistsLabel = computed(() => {
  if (match.value.notExists === undefined) {
    return "Click to exclude if true";
  }
  return match.value.notExists ? "Click to include if true" : "Click to exclude if true";
});

watch(
  cohort,
  (newValue, oldValue) => {
    if (newValue?.iri !== oldValue?.iri) {
      updateCohort();
    }
  },
  { deep: true }
);
watch(
  () => treeIri.value,
  () => {
    findInDialogTree.value = true;
  }
);

onMounted(async () => {
  await init();
});

async function init() {
  rootEntities.value = [NAMESPACE.IM + "Q_Queries"];
  cohortQuery.value = buildIMQueryFromFilters(cohortFilterOptions.value);
  if (match.value.is) {
    cohort.value.iri = match.value.is[0].iri!;
    cohort.value.name = match.value.is[0].name;
    findInDialogTree.value = true;
    treeIri.value = cohort.value.iri;
  }
}

function updateSearchResults(newSearchResults: SearchResponse | undefined) {
  searchResults.value = newSearchResults;
}

async function showDetails(data: any) {
  const entity = await EntityService.getEntitySummary(data);
  if (entity.type[0].iri === IM.QUERY) {
    isSelectableEntity.value = true;
    cohortIri.value = data;
    activePage.value = 1;
  } else {
    isSelectableEntity.value = false;
    cohortIri.value = "";
  }
}
function onSearch() {
  if (searchTerm.value && searchTerm.value !== lastSearchTerm.value) {
    lastSearchTerm.value = searchTerm.value;
    activePage.value = 0;
    updateSearch.value = !updateSearch.value;
  }
}

function goToSearchResults() {
  activePage.value = 0;
}
function onCancel() {
  editMode.value = false;
  emit("cancel");
}

function updateSelected(data: SearchResultSummary) {
  navigateTo(data.iri);
  locateInTree(data.iri);
}
function locateInTree(iri: string) {
  treeIri.value = iri;
}

function navigateTo(iri: string) {
  cohortIri.value = iri;
  activePage.value = 1;
}

function updateClauses() {
  if (importClauses.value.size > 0) {
    if (importClauses.value.size === 1) {
      const match = importClauses.value.values().next().value!;
      if (match.or || match.and) {
        delete match.typeOf;
      }
      emit("updateClauses", match);
    } else {
      const match = { uuid: v4() } as Match;
      match.and = [];
      for (const [key, value] of importClauses.value) {
        if (value.or || value.and) {
          delete value.typeOf;
        }
        match.and.push(value);
      }
      emit("updateClauses", match);
    }
  }
}

function updateCohort() {
  if (cohortIri.value) {
    match.value.is = [{ iri: cohortIri.value } as TTIriRef];
  }
  editMode.value = false;
  emit("updateCohort");
}

async function updateSelectedFromIri(iri: string) {
  const entity = await EntityService.getEntitySummary(iri);
  modelSelected.value = entity;
}
</script>

<style scoped>
.splitter {
  height: 100%;
  flex: 1 1 auto;
}
.add-button {
  color: #444444; /* text */
  background-color: #f0f0f0; /* greyish default */
  border: 1px solid #ccc;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.add-button:hover,
.add-button:focus {
  background-color: #a5d6a7;
}
.column-selector {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
}
.nav-tree {
  max-height: 70vh;
}
.directory-search-dialog-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border-bottom: 10px solid #ccc;
}
</style>
