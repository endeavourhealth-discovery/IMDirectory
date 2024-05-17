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
    <h2 class="heading">Quick type filters</h2>
    <div v-if="showQuickTypeFilters && quickTypeFiltersAllowed" class="quick-type-filters">
      <div class="radio-label-container">
        <RadioButton v-model="quickTypeFilter" inputId="allQuickFilter" name="quickTypeFilter" :value="undefined" variant="filled" />
        <label for="allQuickFilter">All</label>
      </div>
      <div v-for="typeOption in typeOptions.filter(t => quickTypeFiltersAllowed.includes(t['@id']))" class="radio-label-container">
        <RadioButton v-model="quickTypeFilter" :inputId="typeOption.name + 'QuickFilter'" name="quickTypeFilter" :value="typeOption" variant="filled" />
        <label :for="typeOption.name + 'QuickFilter'">{{ typeOption.name }}</label>
      </div>
    </div>
    <ResultsTable
      :search-term="searchTerm"
      :updateSearch="updateSearch"
      :selected-filter-options="selectedFilterOptions"
      :rows="rows"
      :im-query="imQuery"
      :os-query="osQuery"
      @rowSelected="updateSelected"
      @locateInTree="(iri: string) => $emit('locateInTree', iri)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, onMounted, ref, Ref, watch, PropType } from "vue";
import { FilterOptions } from "@im-library/interfaces";
import ResultsTable from "@/components/shared/ResultsTable.vue";
import { useFilterStore } from "@/stores/filterStore";
import _ from "lodash";
import { QueryRequest, SearchRequest, SearchResponse, SearchResultSummary, TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM } from "@im-library/vocabulary";

interface Props {
  searchTerm: string;
  updateSearch: boolean;
  selectedFilterOptions?: FilterOptions;
  rows?: number;
  showFilters?: boolean;
  showQuickTypeFilters?: boolean;
  quickTypeFiltersAllowed?: string[];
  selectedQuickTypeFilter?: string;
  osQuery?: SearchRequest;
  imQuery?: QueryRequest;
}
const props = withDefaults(defineProps<Props>(), {
  showFilters: true,
  showQuickTypeFilters: true,
  quickTypeFiltersAllowed: () => [IM.CONCEPT, IM.VALUESET],
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
const quickTypeFilter: Ref<TTIriRef | undefined> = ref();

watch(quickTypeFilter, newValue => {
  if (newValue) {
    selectedTypes.value = [newValue];
  } else selectedTypes.value = _.cloneDeep(storeFilterDefaults.value.types);
  filterResults();
});

onMounted(() => init());

function init() {
  setFiltersFromStore();
  if (props.showQuickTypeFilters && props.selectedQuickTypeFilter) {
    const found = typeOptions.value.find(typeOption => typeOption["@id"] === props.selectedQuickTypeFilter);
    if (found) quickTypeFilter.value = found;
  }
}

function setFiltersFromStore() {
  schemeOptions.value = _.cloneDeep(storeFilterOptions.value.schemes);
  typeOptions.value = _.cloneDeep(storeFilterOptions.value.types);
  statusOptions.value = _.cloneDeep(storeFilterOptions.value.status);
  if (
    props.selectedFilterOptions &&
    (props.selectedFilterOptions.schemes.length || props.selectedFilterOptions.status.length || props.selectedFilterOptions.types.length)
  ) {
    selectedSchemes.value = _.cloneDeep(props.selectedFilterOptions.schemes);
    selectedStatus.value = _.cloneDeep(props.selectedFilterOptions.status);
    selectedTypes.value = _.cloneDeep(props.selectedFilterOptions.types);
  } else {
    selectedSchemes.value = storeFilterOptions.value.schemes.filter(
      option => storeFilterDefaults.value.schemes.findIndex(s => s["@id"] === option["@id"]) != -1
    );
    selectedStatus.value = storeFilterOptions.value.status.filter(option => storeFilterDefaults.value.status.findIndex(s => s["@id"] === option["@id"]) != -1);
    selectedTypes.value = storeFilterOptions.value.types.filter(option => storeFilterDefaults.value.types.findIndex(t => t["@id"] === option["@id"]) != -1);
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
.quick-type-filters {
  display: flex;
  flex-flow: row wrap;
  gap: 0.5rem;
  padding: 0.5rem;
}
.radio-label-container {
  display: flex;
  flex-flow: row nowrap;
  /* flex: 0 0 calc(25% - 0.5rem); */
  gap: 0.25rem;
}

.radio-label-container label {
  text-transform: capitalize;
}

.heading {
  padding-left: 0.5rem;
  margin: 0;
}
</style>
