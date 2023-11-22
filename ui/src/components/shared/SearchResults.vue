<template>
  <div id="search-results-main-container">
    <div v-if="showFilters" class="filters-container">
      <div class="p-inputgroup">
        <span class="p-float-label">
          <MultiSelect id="status" v-model="selectedStatus" @change="filterResults" :options="statusOptions" display="chip" />
          <label for="status">Select status:</label>
        </span>
      </div>
      <div class="p-inputgroup">
        <span class="p-float-label">
          <MultiSelect id="scheme" v-model="selectedSchemes" @change="filterResults" :options="schemeOptions" display="chip" />
          <label for="scheme">Select scheme:</label>
        </span>
      </div>
      <div class="p-inputgroup">
        <span class="p-float-label">
          <MultiSelect id="type" v-model="selectedTypes" @change="filterResults" :options="typeOptions" display="chip" />
          <label for="type">Select concept type:</label>
        </span>
      </div>
    </div>
    <ResultsTable
      :searchResults="localSearchResults"
      :loading="isLoading"
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
import { SearchResultSummary } from "@im-library/interfaces/AutoGen";

interface Props {
  showFilters?: boolean;
  searchResults: SearchResultSummary[];
  searchLoading?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  showFilters: true,
  searchLoading: false
});

const emit = defineEmits({ selectedUpdated: (_payload: SearchResultSummary) => true, locateInTree: (_payload: string) => true });

const filterStore = useFilterStore();
const filterOptions: ComputedRef<FilterOptions> = computed(() => filterStore.filterOptions);
const filterDefaults: ComputedRef<FilterOptions> = computed(() => filterStore.filterDefaults);

const selectedSchemes: Ref<string[]> = ref([]);
const selectedStatus: Ref<string[]> = ref([]);
const selectedTypes: Ref<string[]> = ref([]);
const schemeOptions: Ref<string[]> = ref([]);
const statusOptions: Ref<string[]> = ref([]);
const typeOptions: Ref<string[]> = ref([]);
const localSearchResults: Ref<any[]> = ref([]);
const loading = ref(true);

watch(
  () => _.cloneDeep(props.searchResults),
  () => init()
);

onMounted(() => init());

const isLoading = computed(() => loading.value || props.searchLoading);

function init() {
  loading.value = true;
  localSearchResults.value = _.cloneDeep(props.searchResults);

  if (isArrayHasLength(localSearchResults.value)) {
    setFiltersFromSearchResults();
  } else {
    setFilterDefaults();
  }
  loading.value = false;
}

function setFilterDefaults() {
  schemeOptions.value = filterOptions.value.schemes.map((scheme: any) => scheme.name);
  typeOptions.value = filterOptions.value.types.map((type: any) => type.name);
  statusOptions.value = filterOptions.value.status.map((item: any) => item.name);
  selectedSchemes.value = filterOptions.value.schemes
    .filter((option: any) => filterDefaults.value.schemes.includes(option["@id"]))
    .map((scheme: any) => scheme.name);
  selectedStatus.value = filterOptions.value.status
    .filter((option: any) => filterDefaults.value.status.includes(option["@id"]))
    .map((status: any) => status.name);
  selectedTypes.value = filterOptions.value.types.filter((option: any) => filterDefaults.value.types.includes(option["@id"])).map((type: any) => type.name);
}

function setFiltersFromSearchResults() {
  const schemes = [] as string[];
  const types = [] as string[];
  const status = [] as string[];
  (localSearchResults.value as SearchResultSummary[]).forEach(searchResult => {
    if (isObjectHasKeys(searchResult.scheme, ["name"])) schemes.push(searchResult.scheme.name!);
    searchResult.entityType.forEach((type: any) => {
      if (filterDefaults.value.types.map(type => type["@id"]).includes(type["@id"])) types.push(type.name);
    });
    if (isObjectHasKeys(searchResult.status, ["name"])) status.push(searchResult.status.name!);
  });
  schemeOptions.value = [...new Set(schemes)];
  typeOptions.value = [...new Set(types)];
  statusOptions.value = [...new Set(status)];

  selectedSchemes.value = [...new Set(schemes)];
  selectedTypes.value = [...new Set(types)];
  selectedStatus.value = [...new Set(status)];
}

function filterResults() {
  const filteredSearchResults = [] as SearchResultSummary[];
  localSearchResults.value.forEach(searchResult => {
    let isSelectedType = false;
    searchResult.entityType.forEach((type: any) => {
      if (selectedTypes.value.indexOf(type.name) != -1) {
        isSelectedType = true;
      }
    });

    if (selectedSchemes.value.indexOf(searchResult.scheme.name!) != -1 && isSelectedType && selectedStatus.value.indexOf(searchResult.status.name!) != -1) {
      filteredSearchResults.push(searchResult);
    }
  });
  localSearchResults.value = [...filteredSearchResults];
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
