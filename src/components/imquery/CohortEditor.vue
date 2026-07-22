<template>
  <Dialog
    v-model:visible="showDialog"
    :contentStyle="{ display: 'flex', flexDirection: 'column', height: '100%' }"
    :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh' }"
    header="Search"
    maximizable
    modal
  >
    <div v-if="loading" class="flex w-full flex-auto flex-col flex-nowrap">
      <ProgressSpinner />
    </div>
    <div>
      <Button
        v-tooltip="notExistsLabel"
        :class="exclude ? 'text-red-500' : 'text-green-500'"
        :icon="exclude ? 'pi pi-times' : 'pi pi-check'"
        class="p-button-text p-button-rounded"
        @click="toggleNotExists"
      />
      <span>{{ notExistsLabel }}</span>
    </div>
    <div v-if="parentOperator && parentOperator === Bool.or">
      <span class="description">Optionally assign score if true</span>
    </div>

    <span v-if="match.is">Currently selected :{{ match.is.name }}</span>
    <div class="directory-search-dialog-content">
      <div class="search-bar">
        <SearchBar v-model:searchTerm="searchTerm" :imQuery="cohortQuery" :selected="selected" :show-filters="false" @to-search="onSearch" />
      </div>
      <Splitter class="splitter" layout="horizontal">
        <SplitterPanel :size="25" class="column-selector">
          <div style="height: 100%; display: flex; flex-direction: column">
            <div style="flex: 1; overflow-y: auto">
              <NavTree
                :childLength="20"
                :find-in-tree="findInDialogTree"
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
        <SplitterPanel :minSize="10" :size="50">
          <div style="height: 100%; display: flex; flex-direction: column">
            <div style="flex: 1; overflow-y: auto">
              <SearchResults
                v-if="activePage === 0"
                :im-query="cohortQuery"
                :search-term="searchTerm"
                :selected="selected"
                :selected-filter-options="cohortFilterOptions"
                :show-filters="false"
                :updateSearch="updateSearch"
                @searchResultsUpdated="updateSearchResults"
                @selectedUpdated="updateSelected"
              />
              <DirectoryDetails
                v-if="cohortIri"
                v-model:history="directoryHistory"
                :searchResults
                :selected-iri="cohortIri"
                :showSelectButton="true"
                @locateInTree="locateInTree"
                @navigateTo="navigateTo"
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
        <Button class="add-button" data-testid="cancel-edit-feature-button" label="Cancel" text @click="onCancel" />
        <Button
          v-if="cohortIri"
          class="add-button"
          data-testid="import-reference-button"
          label="Import query as reference"
          text
          type="button"
          @click="updateCohort"
        />
        <Button
          v-if="cohortIri && importClauses.size > 0"
          class="add-button"
          data-testid="import-definition-button"
          label="Import selected clause as clause"
          text
          type="button"
          @click="updateClauses"
        />
        <Button v-if="edited && !cohortIri" autofocus data-testid="save-feature-button" label="Save" @click="emit('updateCohort')" />
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { Ref, computed, onMounted, provide, ref, watch } from "vue";

import { Bool, IM, NAMESPACE } from "@endeavour/vue-library/enums";
import {
  type Match,
  type QueryRequest,
  SearchOptionsSchema,
  type SearchResponse,
  type SearchResultSummary,
  type TTIriRef
} from "@endeavour/vue-library/models";

import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import { v4 } from "uuid";

import DirectoryDetails from "@/components/directory/DirectoryDetails.vue";
import NavTree from "@/components/shared/NavTree.vue";
import SearchBar from "@/components/shared/SearchBar.vue";
import SearchResults from "@/components/shared/SearchResults.vue";
import { buildIMQueryFromFilters } from "@/helpers/buildQuery";
import { SearchOptions } from "@/interfaces";
import { EntityService } from "@/services";

interface Props {
  parentOperator?: Bool;
}

const props = defineProps<Props>();
const editMode = defineModel<boolean>("editMode");
const match = defineModel<Match>("match", { default: {} });
const exclude = defineModel<boolean>("exclude", { default: false });
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
const cohortFilterOptions: Ref<SearchOptions> = ref(
  SearchOptionsSchema.parse({
    types: [{ iri: IM.QUERY }],
    status: [{ iri: IM.ACTIVE }, { iri: IM.DRAFT }],
    schemes: []
  })
);
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
  (event: "updateMatch"): void;
  (event: "updateExists", exists: boolean): void;
}>();

const toggleNotExists = () => {
  exclude.value = !exclude.value;
  emit("updateExists", exclude.value);
  edited.value = true;
};

const notExistsLabel = computed(() => {
  if (!exclude.value) {
    return "Click to exclude if true";
  } else return "Click to include if true";
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
    cohort.value.iri = match.value.is.iri!;
    cohort.value.name = match.value.is.name;
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
      for (const value of importClauses.value.values()) {
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
    match.value.is = { iri: cohortIri.value } as TTIriRef;
  }
  editMode.value = false;
  emit("updateCohort");
}

async function updateSelectedFromIri(iri: string) {
  modelSelected.value = await EntityService.getEntitySummary(iri);
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
.directory-search-dialog-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border-bottom: 10px solid #ccc;
}

.description {
  padding-right: 1rem;
}
</style>
