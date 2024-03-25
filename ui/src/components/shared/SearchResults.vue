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
      :searchResults="localSearchResults"
      :loading="isLoading"
      :lazyLoading="lazyLoading"
      :rows="rows"
      @rowSelected="updateSelected"
      @locateInTree="(iri: string) => $emit('locateInTree', iri)"
      @lazyLoadRequested="(data: any) => $emit('lazyLoadRequested', data)"
      @downloadRequested="(data: any) => $emit('downloadRequested', data)"
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
import { SearchResponse, SearchResultSummary, TTIriRef } from "@im-library/interfaces/AutoGen";

interface Props {
  showFilters?: boolean;
  searchResults: SearchResponse | undefined;
  searchLoading?: boolean;
  rows?: number;
  lazyLoading?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  showFilters: true,
  searchLoading: false,
  lazyLoading: false,
  rows: 25
});

const emit = defineEmits({
  selectedUpdated: (_payload: SearchResultSummary) => true,
  locateInTree: (_payload: string) => true,
  lazyLoadRequested: (_payload: any) => true,
  downloadRequested: (_payload: { term: string; count: number }) => true
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

onMounted(() => init());

const isLoading = computed(() => loading.value || props.searchLoading);

function init() {
  setFiltersFromStore();
}

function setFiltersFromStore() {
  schemeOptions.value = [...storeFilterOptions.value.schemes];
  typeOptions.value = [...storeFilterOptions.value.types];
  statusOptions.value = [...storeFilterOptions.value.status];
  if (
    props.selectedFilterOptions &&
    (props.selectedFilterOptions.schemes.length || props.selectedFilterOptions.status.length || props.selectedFilterOptions.types.length)
  ) {
    selectedSchemes.value = [...props.selectedFilterOptions.schemes];
    selectedStatus.value = [...props.selectedFilterOptions.status];
    selectedTypes.value = [...props.selectedFilterOptions.types];
  } else {
    selectedSchemes.value = storeFilterOptions.value.schemes.filter(
      option => storeFilterDefaults.value.schemes.findIndex(s => s["@id"] === option["@id"]) != -1
    );
    selectedStatus.value = storeFilterOptions.value.status.filter(option => storeFilterDefaults.value.status.findIndex(s => s["@id"] === option["@id"]) != -1);
    selectedTypes.value = storeFilterOptions.value.types.filter(option => storeFilterDefaults.value.types.findIndex(t => t["@id"] === option["@id"]) != -1);
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
