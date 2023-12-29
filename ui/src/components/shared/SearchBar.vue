<template>
  <div class="search-container">
    <span class="p-input-icon-right search-group">
      <i v-if="searchLoading" class="pi pi-spin pi-spinner"></i>
      <i v-else-if="speech" class="pi pi-microphone mic" :class="listening && 'listening'" @click="toggleListen"></i>
      <InputText
        id="autocomplete-search"
        v-model="searchText"
        :placeholder="searchPlaceholder"
        @complete="debounceForSearch"
        data-testid="search-input"
        autofocus
      />
    </span>
    <SplitButton class="search-button p-button-secondary" @click="search" label="Search" :model="buttonActions" :loading="searchLoading" />
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
        <Filters
          :search="search"
          data-testid="filters"
          :filterOptions="filterOptions"
          :filterDefaults="filterDefaults"
          @selectedFiltersUpdated="handleSelectedFiltersUpdated"
        />
      </div>
    </OverlayPanel>
  </div>
</template>

<script setup lang="ts">
import Filters from "@/components/shared/Filters.vue";

import { computed, ComputedRef, ref, Ref, watch } from "vue";
import { FilterOptions, ConceptSummary } from "@im-library/interfaces";
import { SearchRequest, TTIriRef, QueryRequest, SearchResultSummary, Match } from "@im-library/interfaces/AutoGen";
import { SortDirection } from "@im-library/enums";
import { isArrayHasLength, isObjectHasKeys, isObject } from "@im-library/helpers/DataTypeCheckers";
import { IM } from "@im-library/vocabulary";
import setupSpeechToText from "@/composables/setupSpeechToText";
import { useFilterStore } from "@/stores/filterStore";
import { useSharedStore } from "@/stores/sharedStore";
import EntityService from "@/services/EntityService";
import QueryService from "@/services/QueryService";
import _ from "lodash";

interface Props {
  searchResults: ConceptSummary[];
  searchLoading: boolean;
  selected?: ConceptSummary;
  filterOptions?: FilterOptions;
  filterDefaults?: FilterOptions;
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

const storeSelectedFilters: ComputedRef<FilterOptions> = computed(() => filterStore.selectedFilters);
const fontAwesomePro = computed(() => sharedStore.fontAwesomePro);

watch(storeSelectedFilters, newValue => {
  if (!props.filterDefaults && !props.filterOptions) selectedFilters.value = newValue;
});

const controller: Ref<AbortController> = ref({} as AbortController);
const searchText = ref("");
const searchPlaceholder = ref("Search");
const loading = ref(false);
const results: Ref<SearchResultSummary[]> = ref([]);
const buttonActions = ref([
  { label: "ECL", command: () => emit("toEclSearch") },
  { label: "IMQuery", command: () => emit("toQuerySearch") }
]);
const selectedFilters: Ref<FilterOptions> = ref({ ...storeSelectedFilters.value });

const { listening, speech, recog, toggleListen } = setupSpeechToText(searchText, searchPlaceholder);

watch(searchText, async () => debounceForSearch());
watch(results, newValue => emit("update:searchResults", newValue));
watch(loading, newValue => emit("update:searchLoading", newValue));

const filtersOP = ref();

function handleSelectedFiltersUpdated(updatedSelectedFilters: FilterOptions) {
  selectedFilters.value = updatedSelectedFilters;
}

function openFiltersOverlay(event: any) {
  filtersOP.value.toggle(event);
}

const debounce = ref(0);

function debounceForSearch(): void {
  clearTimeout(debounce.value);
  debounce.value = window.setTimeout(() => {
    search();
  }, 600);
}

async function search(): Promise<void> {
  searchPlaceholder.value = "Search";
  if (searchText.value && searchText.value.length > 2) {
    loading.value = true;
    const searchRequest = {} as SearchRequest;
    searchRequest.termFilter = searchText.value;
    searchRequest.sortField = "weighting";
    searchRequest.page = 1;
    searchRequest.size = 100;

    searchRequest.schemeFilter = [];
    const schemes =
      isObjectHasKeys(props.filterOptions, ["schemes"]) && isArrayHasLength(props.filterOptions!.schemes)
        ? props.filterOptions!.schemes
        : selectedFilters.value.schemes;
    for (const scheme of schemes) {
      searchRequest.schemeFilter!.push(scheme["@id"]);
    }

    searchRequest.statusFilter = [];
    const statusList =
      isObjectHasKeys(props.filterOptions, ["status"]) && isArrayHasLength(props.filterOptions!.status)
        ? props.filterOptions!.status
        : selectedFilters.value.status;
    for (const status of statusList) {
      searchRequest.statusFilter!.push(status["@id"]);
    }

    searchRequest.typeFilter = [];
    const types =
      isObjectHasKeys(props.filterOptions, ["types"]) && isArrayHasLength(props.filterOptions!.types)
        ? props.filterOptions!.types
        : selectedFilters.value.types;
    for (const type of types) {
      searchRequest.typeFilter!.push(type["@id"]);
    }

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
    const result = await EntityService.advancedSearch(searchRequest, controller.value);
    if (result) results.value = result;
    else results.value = [];
    loading.value = false;
  }
}

async function prepareQueryRequest(queryRequest: QueryRequest) {
  queryRequest.textSearch = searchText.value;

  if (isObjectHasKeys(queryRequest.query, ["@id"]) && !isObjectHasKeys(queryRequest.query, ["match"])) {
    const partialEntity = await EntityService.getPartialEntity(queryRequest.query["@id"]!, [IM.DEFINITION]);
    if (partialEntity[IM.DEFINITION]) {
      queryRequest.query = JSON.parse(partialEntity[IM.DEFINITION]);
      if (!isArrayHasLength(queryRequest.query.match)) queryRequest.query.match = [];
      queryRequest.query.match!.push(getMatchFromTypeFilters(), getMatchFromStatusFilters(), getMatchFromSchemeFilters());
    }
  }

  return queryRequest;
}

function getMatchFromTypeFilters(): Match {
  const typeMatch = { bool: "or", match: [] } as Match;
  selectedFilters.value.types.forEach((type: TTIriRef) => {
    typeMatch.match!.push({ typeOf: type } as Match);
  });
  return typeMatch;
}

function getMatchFromStatusFilters(): Match {
  return {
    property: [
      {
        "@id": IM.HAS_STATUS,
        is: selectedFilters.value.status
      }
    ]
  };
}

function getMatchFromSchemeFilters(): Match {
  return {
    property: [
      {
        "@id": IM.HAS_SCHEME,
        is: selectedFilters.value.schemes
      }
    ]
  };
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
