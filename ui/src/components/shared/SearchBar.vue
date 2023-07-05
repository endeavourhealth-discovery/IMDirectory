<template>
  <div class="search-container">
    <span class="p-input-icon-right search-group">
      <i v-if="speech" class="pi pi-microphone mic" :class="listening && 'listening'" @click="toggleListen"></i>
      <InputText id="autocomplete-search" v-model="searchText" :placeholder="searchPlaceholder" @keyup.enter="search" data-testid="search-input" />
    </span>
    <SplitButton class="search-button p-button-secondary" label="Search" :model="buttonActions">
      <Button @click="search" class="search-button p-button-secondary" label="Search" />
    </SplitButton>
    <Button
      v-tooltip.bottom="'Filters'"
      id="filter-button"
      :icon="fontAwesomePro ? 'fa-duotone fa-sliders' : 'pi pi-sliders-h'"
      class="p-button-rounded p-button-text p-button-plain p-button-lg"
      @click="openFiltersOverlay"
      data-testid="filters-open-button"
    />
    <OverlayPanel ref="filtersOP" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: '450px' }">
      <div class="p-fluid results-filter-container">
        <Filters :search="search" data-testid="filters" />
      </div>
    </OverlayPanel>
  </div>
</template>

<script setup lang="ts">
import Filters from "@/components/shared/Filters.vue";

import { computed, ComputedRef, onMounted, ref, Ref, watch } from "vue";
import { FilterOptions, ConceptSummary } from "@im-library/interfaces";
import { SearchRequest, TTIriRef, QueryRequest, Query } from "@im-library/interfaces/AutoGen";
import { SortDirection } from "@im-library/enums";
import { isArrayHasLength, isObjectHasKeys, isObject } from "@im-library/helpers/DataTypeCheckers";
import { IM, RDF, RDFS } from "@im-library/vocabulary";
import setupSpeechToText from "@/composables/setupSpeechToText";
import { useFilterStore } from "@/stores/filterStore";
import { useSharedStore } from "@/stores/sharedStore";
import EntityService from "@/services/EntityService";
import QueryService from "@/services/QueryService";
import _ from "lodash";

interface Props {
  searchResults: ConceptSummary[];
  searchLoading: boolean;
  searchByQuery?: QueryRequest;
  selected?: ConceptSummary;
}

const props = defineProps<Props>();

const emit = defineEmits({
  "update:searchResults": payload => _.isArray(payload),
  "update:searchLoading": payload => typeof payload === "boolean",
  toEclSearch: () => true,
  toQuerySearch: () => true
});

const filterStore = useFilterStore();
const sharedStore = useSharedStore();

const selectedFilters: ComputedRef<FilterOptions> = computed(() => filterStore.selectedFilters);
const fontAwesomePro = computed(() => sharedStore.fontAwesomePro);

const controller: Ref<AbortController> = ref({} as AbortController);
const searchText = ref("");
const searchPlaceholder = ref("Search");
const loading = ref(false);
const results: Ref<ConceptSummary[]> = ref([]);
const buttonActions = ref([
  { label: "ECL", command: () => emit("toEclSearch") },
  { label: "IMQuery", command: () => emit("toQuerySearch") }
]);

const { listening, speech, recog, toggleListen } = setupSpeechToText(searchText, searchPlaceholder);

watch(searchText, async () => await search());
watch(results, newValue => emit("update:searchResults", newValue));
watch(loading, newValue => emit("update:searchLoading", newValue));

const filtersOP = ref();

onMounted(() => {
  if (props.selected) {
    searchText.value = props.selected.name;
  }
});

function openFiltersOverlay(event: any) {
  filtersOP.value.toggle(event);
}

async function search(): Promise<void> {
  searchPlaceholder.value = "Search";
  if (searchText.value) {
    loading.value = true;
    const searchRequest = {} as SearchRequest;
    searchRequest.termFilter = searchText.value;
    searchRequest.sortField = "weighting";
    searchRequest.page = 1;
    searchRequest.size = 100;
    searchRequest.schemeFilter = selectedFilters.value.schemes.map(scheme => scheme["@id"]);

    searchRequest.statusFilter = [];
    selectedFilters.value.status.forEach((status: TTIriRef) => {
      searchRequest.statusFilter!.push(status["@id"]);
    });

    searchRequest.typeFilter = [];
    selectedFilters.value.types.forEach((type: TTIriRef) => {
      searchRequest.typeFilter!.push(type["@id"]);
    });

    if (isArrayHasLength(selectedFilters.value.sortFields) && isObjectHasKeys(selectedFilters.value.sortFields[0])) {
      const sortField = selectedFilters.value.sortFields[0];
      if (sortField["@id"] === IM.NAMESPACE + "Usage") searchRequest.sortField = "weighting";

      if (isArrayHasLength(selectedFilters.value.sortDirections) && isObjectHasKeys(selectedFilters.value.sortDirections[0])) {
        const sortDirection = selectedFilters.value.sortDirections[0];
        if (sortDirection["@id"] === IM.NAMESPACE + "Descending") searchRequest.sortDirection = SortDirection.DESC;
        if (sortDirection["@id"] === IM.NAMESPACE + "Ascending") searchRequest.sortDirection = SortDirection.ASC;
      }
    }

    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();
    let result;
    if (props.searchByQuery) {
      const queryRequest = _.cloneDeep(props.searchByQuery);
      queryRequest.textSearch = searchText.value;
      const queryResult = await QueryService.queryIM(queryRequest, controller.value);
      if (queryResult && queryResult.entities) result = await convertToConceptSummary(queryResult.entities);
    } else {
      result = await EntityService.advancedSearch(searchRequest, controller.value);
    }
    if (result) results.value = result;
    else results.value = [];
    loading.value = false;
  }
}

async function convertToConceptSummary(results: any[]) {
  if (results.every(result => isObjectHasKeys(result, ["@id", RDFS.LABEL, IM.CODE, RDF.TYPE, IM.SCHEME, IM.HAS_STATUS]))) {
    return results.map(result => {
      const conceptSummary = {} as ConceptSummary;
      conceptSummary.iri = result["@id"];
      conceptSummary.name = result[RDFS.LABEL];
      conceptSummary.code = result[IM.CODE];
      conceptSummary.entityType = result[RDF.TYPE];
      conceptSummary.scheme = result[IM.SCHEME];
      conceptSummary.status = result[IM.HAS_STATUS];
      return conceptSummary;
    });
  } else {
    const summaryResults = [];
    for (const result of results) {
      if (!isObjectHasKeys(result, ["@id"])) throw new Error("One or more items are missing required '@id' key");
      const summary = await EntityService.getEntitySummary(result["@id"]);
      if (summary) summaryResults.push(summary);
    }
    return summaryResults;
  }
}
</script>

<style scoped>
#filter-button {
  height: 2.25rem;
}

.search-container {
  flex: 1 0 auto;
  padding: 0 0.2rem;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 0.2rem;
  overflow: auto;
}

.search-group {
  width: 30%;
}

.mic {
  cursor: pointer;
}

.listening {
  color: red !important;
}

#autocomplete-search {
  font-size: 1rem;
  border: none;
  height: 2.25rem;
  flex: 1 1 auto;
  width: 100%;
}

.fa-icon {
  padding-right: 0.25rem;
}

.search-button {
  height: 2.25rem;
}
</style>
