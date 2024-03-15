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
      :updateSearch="updateSearch"
      :selected-filter-options="selectedFilterOptions"
      :rows="rows"
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
  searchTerm: string;
  updateSearch: boolean;
  selectedFilterOptions?: FilterOptions;
  rows?: number;
  showFilters?: boolean;
  osQuery?: SearchRequest;
  imQuery?: QueryRequest;
}
const props = withDefaults(defineProps<Props>(), {
  showFilters: true,
  rows: 25
});

const emit = defineEmits({
  selectedUpdated: (_payload: SearchResultSummary) => true,
  locateInTree: (_payload: string) => true,
  selectedFiltersUpdated: (_payload: FilterOptions) => true
});

const filterStore = useFilterStore();
const storeFilterOptions: ComputedRef<FilterOptions> = computed(() => filterStore.filterOptions);
const storeFilterDefaults: ComputedRef<FilterOptions> = computed(() => filterStore.defaultFilterOptions);
const selectedSchemes: Ref<TTIriRef[]> = ref([]);
const selectedStatus: Ref<TTIriRef[]> = ref([]);
const selectedTypes: Ref<TTIriRef[]> = ref([]);
const schemeOptions: Ref<TTIriRef[]> = ref([]);
const statusOptions: Ref<TTIriRef[]> = ref([]);
const typeOptions: Ref<TTIriRef[]> = ref([]);
const localSearchResults: Ref<SearchResponse | undefined> = ref();

onMounted(() => init());

function init() {
  if (isArrayHasLength(localSearchResults.value)) {
    setFiltersFromSearchResults();
  } else {
    setFiltersFromStore();
  }
}

function setFiltersFromStore() {
  schemeOptions.value = [...storeFilterOptions.value.schemes];
  typeOptions.value = [...storeFilterOptions.value.types];
  statusOptions.value = [...storeFilterOptions.value.status];
  if (props.selectedFilterOptions)
    if (props.selectedFilterOptions.schemes.length || props.selectedFilterOptions.status.length || props.selectedFilterOptions.types.length) {
      selectedSchemes.value = [...props.selectedFilterOptions.schemes];
      selectedStatus.value = [...props.selectedFilterOptions.status];
      selectedTypes.value = [...props.selectedFilterOptions.types];
    } else {
      selectedSchemes.value = storeFilterOptions.value.schemes.filter((option: any) => storeFilterDefaults.value.schemes.includes(option["@id"]));
      selectedStatus.value = storeFilterOptions.value.status.filter((option: any) => storeFilterDefaults.value.status.includes(option["@id"]));
      selectedTypes.value = storeFilterOptions.value.types.filter((option: any) => storeFilterDefaults.value.types.includes(option["@id"]));
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
        if (storeFilterDefaults.value.types.map(type => type["@id"]).includes(type["@id"])) types.push(type);
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
  const selectedFilters = {
    schemes: selectedSchemes.value,
    status: selectedStatus.value,
    types: selectedTypes.value
  } as FilterOptions;
  emit("selectedFiltersUpdated", selectedFilters);
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
