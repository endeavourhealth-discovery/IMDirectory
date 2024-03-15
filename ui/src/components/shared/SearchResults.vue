<template>
  <div id="search-results-main-container">
    <div v-if="showFilters" class="filters-container">
      <div class="p-inputgroup">
        <span class="p-float-label">
          <MultiSelect id="status" v-model="selectedStatus" @change="filterResults" :options="statusOptions" optionLabel="name" display="chip" />
          <label for="status">Select status:</label>
        </span>
      </div>
      <div class="p-inputgroup">
        <span class="p-float-label">
          <MultiSelect id="scheme" v-model="selectedSchemes" @change="filterResults" :options="schemeOptions" optionLabel="name" display="chip" />
          <label for="scheme">Select scheme:</label>
        </span>
      </div>
      <div class="p-inputgroup">
        <span class="p-float-label">
          <MultiSelect id="type" v-model="selectedTypes" @change="filterResults" :options="typeOptions" optionLabel="name" display="chip" />
          <label for="type">Select concept type:</label>
        </span>
      </div>
    </div>
    <ResultsTable
      :search-term="searchTerm"
      :selected-filters="selectedFilters"
      :searchResults="localSearchResults"
      :rows="rows"
      :updateSearch="updateSearch"
      @rowSelected="updateSelected"
      @locateInTree="(iri: string) => $emit('locateInTree', iri)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, onMounted, ref, Ref, watch } from "vue";
import { FilterOptions } from "@im-library/interfaces";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import ResultsTable from "@/components/shared/ResultsTable.vue";
import { useFilterStore } from "@/stores/filterStore";
import _ from "lodash";
import { QueryRequest, SearchRequest, SearchResponse, SearchResultSummary, TTIriRef } from "@im-library/interfaces/AutoGen";

interface Props {
  searchResults: SearchResponse | undefined;
  searchTerm: string;
  selectedFilters: FilterOptions;
  updateSearch: boolean;

  osQuery?: SearchRequest;
  imQuery?: QueryRequest;
  rows?: number;
  showFilters?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  showFilters: true,
  rows: 25
});

watch(
  () => props.updateSearch,
  () => console.log("SearchResults caught search event")
);

const emit = defineEmits({
  selectedUpdated: (_payload: SearchResultSummary) => true,
  locateInTree: (_payload: string) => true
});

const filterStore = useFilterStore();
const filterOptions: ComputedRef<FilterOptions> = computed(() => filterStore.filterOptions);
const filterDefaults: ComputedRef<FilterOptions> = computed(() => filterStore.filterDefaults);
const selectedStoreFilters: ComputedRef<FilterOptions> = computed(() => filterStore.selectedFilters);
const selectedSchemes: Ref<TTIriRef[]> = ref([]);
const selectedStatus: Ref<TTIriRef[]> = ref([]);
const selectedTypes: Ref<TTIriRef[]> = ref([]);
const schemeOptions: Ref<TTIriRef[]> = ref([]);
const statusOptions: Ref<TTIriRef[]> = ref([]);
const typeOptions: Ref<TTIriRef[]> = ref([]);
const localSearchResults: Ref<SearchResponse | undefined> = ref();
const loading = ref(true);

watch(
  () => _.cloneDeep(props.searchResults),
  () => init()
);

onMounted(() => init());

function init() {
  if (isArrayHasLength(localSearchResults.value)) {
    setFiltersFromSearchResults();
  } else {
    setFiltersFromStore();
  }
}

function setFiltersFromStore() {
  schemeOptions.value = [...filterOptions.value.schemes];
  typeOptions.value = [...filterOptions.value.types];
  statusOptions.value = [...filterOptions.value.status];
  if (selectedStoreFilters.value.schemes.length || selectedStoreFilters.value.status.length || selectedStoreFilters.value.types.length) {
    selectedSchemes.value = [...selectedStoreFilters.value.schemes];
    selectedStatus.value = [...selectedStoreFilters.value.status];
    selectedTypes.value = [...selectedStoreFilters.value.types];
  } else {
    selectedSchemes.value = filterOptions.value.schemes.filter((option: any) => filterDefaults.value.schemes.includes(option["@id"]));
    selectedStatus.value = filterOptions.value.status.filter((option: any) => filterDefaults.value.status.includes(option["@id"]));
    selectedTypes.value = filterOptions.value.types.filter((option: any) => filterDefaults.value.types.includes(option["@id"]));
  }
}

function setFiltersFromSearchResults() {
  const schemes = [] as TTIriRef[];
  const types = [] as TTIriRef[];
  const status = [] as TTIriRef[];
  if (localSearchResults.value?.entities) {
    localSearchResults.value.entities.forEach(searchResult => {
      if (isObjectHasKeys(searchResult.scheme, ["name"])) schemes.push(searchResult.scheme);
      searchResult.entityType.forEach(type => {
        if (filterDefaults.value.types.map(type => type["@id"]).includes(type["@id"])) types.push(type);
      });
      if (isObjectHasKeys(searchResult.status, ["name"])) status.push(searchResult.status);
    });
    schemeOptions.value = [...new Set(schemes)];
    typeOptions.value = [...new Set(types)];
    statusOptions.value = [...new Set(status)];

    selectedSchemes.value = [...new Set(schemes)];
    selectedTypes.value = [...new Set(types)];
    selectedStatus.value = [...new Set(status)];
  }
}

function filterResults() {
  filterStore.updateSelectedFilters({
    schemes: selectedSchemes,
    status: selectedStatus,
    types: selectedTypes,
    sortDirections: selectedStoreFilters.value.sortDirections,
    sortFields: selectedStoreFilters.value.sortFields
  });
}

function updateSelected(selected: SearchResultSummary) {
  emit("selectedUpdated", selected);
}
</script>

<style scoped>
label {
  font-size: 1rem !important;
}

#search-results-main-container {
  flex: 1 1 auto;
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
</style>
