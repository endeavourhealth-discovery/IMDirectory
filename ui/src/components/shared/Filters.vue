<template>
  <div v-if="filterOptions" class="filters">
    <div class="quick-filters-container">
      <div class="quick-filter-container">
        <label>Include legacy:</label>
        <InputSwitch v-model="includeLegacy" />
      </div>
    </div>

    <div class="p-field">
      <div class="p-inputgroup">
        <span class="p-float-label">
          <MultiSelect id="status" v-model="selectedStatus" @change="checkForSearch" :options="filterOptions.status" optionLabel="name" display="chip" />
          <label for="status">Select status:</label>
          <Button icon="fa-solid fa-rotate-left" severity="secondary" @click="resetStatus" v-tooltip="'Reset status filters'" />
        </span>
      </div>
    </div>

    <div class="p-field">
      <div class="p-inputgroup">
        <span class="p-float-label">
          <MultiSelect id="scheme" v-model="selectedSchemes" @change="checkForSearch" :options="filterOptions.schemes" optionLabel="name" display="chip" />
          <label for="scheme">Select scheme:</label>
          <Button icon="fa-solid fa-rotate-left" severity="secondary" @click="resetSchemes" v-tooltip="'Reset scheme filters'" />
        </span>
      </div>
    </div>

    <div class="p-field">
      <div class="p-inputgroup">
        <span class="p-float-label">
          <MultiSelect id="conceptType" v-model="selectedTypes" @change="checkForSearch" :options="filterOptions.types" optionLabel="name" display="chip" />
          <label for="conceptType">Select concept type:</label>
          <Button icon="fa-solid fa-rotate-left" severity="secondary" @click="resetTypes" v-tooltip="'Reset type filters'" />
        </span>
      </div>
    </div>

    <div class="p-field">
      <div class="p-inputgroup">
        <span class="p-float-label">
          <Dropdown id="sortField" v-model="selectedSortField" @change="checkForSearch" :options="filterOptions.sortFields" optionLabel="name" />
          <label for="sortField">Select sort field:</label>
          <Button icon="fa-solid fa-rotate-left" severity="secondary" @click="resetSortField" v-tooltip="'Reset sort field filters'" />
        </span>
      </div>
    </div>

    <div class="p-field">
      <div class="p-inputgroup">
        <span class="p-float-label">
          <Dropdown id="sortDirection" v-model="selectedSortDirection" @change="checkForSearch" :options="filterOptions.sortDirections" optionLabel="name" />
          <label for="sortDirection">Select sort direction:</label>
          <Button icon="fa-solid fa-rotate-left" severity="secondary" @click="resetSortDirection" v-tooltip="'Reset sort direction filters'" />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, onMounted, ref, Ref, watch } from "vue";
import { FilterOptions } from "@im-library/interfaces";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM, GRAPH } from "@im-library/vocabulary";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { useFilterStore } from "@/stores/filterStore";
interface Props {
  search: Function;
  filterOptions?: FilterOptions;
  filterDefaults?: FilterOptions;
}
const props = defineProps<Props>();

const emit = defineEmits({
  selectedFiltersUpdated: (_payload: FilterOptions) => true
});

const filterStore = useFilterStore();
const filterStoreOptions: ComputedRef<FilterOptions> = computed(() => filterStore.filterOptions);
const filterStoreDefaults: ComputedRef<FilterOptions> = computed(() => filterStore.filterDefaults);
const selectedStoreFilters: ComputedRef<FilterOptions> = computed(() => filterStore.selectedFilters);
const quickFiltersStatus = computed(() => filterStore.quickFiltersStatus);

const selectedStatus: Ref<TTIriRef[]> = ref([]);
const selectedSchemes: Ref<TTIriRef[]> = ref([]);
const selectedTypes: Ref<TTIriRef[]> = ref([]);
const selectedSortField: Ref<TTIriRef> = ref({} as TTIriRef);
const selectedSortDirection: Ref<TTIriRef> = ref({} as TTIriRef);
const includeLegacy = ref(false);
const filterOptions: Ref<FilterOptions> = ref({ ...filterStoreOptions.value });
const filterDefaults: Ref<FilterOptions> = ref({ ...filterStoreDefaults.value });
const selectedFilters: Ref<FilterOptions> = ref({ ...selectedStoreFilters.value });
const loading = ref(false);

watch(includeLegacy, newValue => setLegacy(newValue));

watch([selectedStatus, selectedSchemes, selectedTypes, selectedSortField, selectedSortDirection], () => {
  if (!loading.value) updateStoreSelectedFilters();
});

onMounted(() => init());

function init() {
  loading.value = true;
  setDefaults();
  loading.value = false;
}

function resetSortField() {
  if (filterDefaults.value) {
    selectedSortField.value = filterDefaults.value.sortFields?.[0];
    selectedSortDirection.value = filterDefaults.value.sortDirections?.[0];
  }
}

function resetSortDirection() {
  if (filterDefaults.value) selectedSortDirection.value = filterDefaults.value.sortDirections?.[0];
}

function resetStatus() {
  if (filterOptions.value && filterDefaults.value) {
    selectedStatus.value = filterOptions.value.status.filter(
      item => filterDefaults.value?.status.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
    );
  }
  checkForSearch();
}

function resetSchemes() {
  if (filterOptions.value && filterDefaults.value) {
    selectedSchemes.value = filterOptions.value.schemes.filter(
      item => filterDefaults.value?.schemes.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
    );
  }
  checkForSearch();
}

function resetTypes() {
  if (filterOptions.value && filterDefaults.value) {
    selectedTypes.value = filterOptions.value.types.filter(
      item => filterDefaults.value?.types.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
    );
  }
  checkForSearch();
}

function checkForSearch(): void {
  if (!loading.value) {
    updateStoreSelectedFilters();
    props.search();
  }
}

function updateStoreSelectedFilters(): void {
  const selected: FilterOptions = {
    status: selectedStatus.value,
    schemes: selectedSchemes.value,
    types: selectedTypes.value,
    sortFields: [selectedSortField.value],
    sortDirections: [selectedSortDirection.value]
  };
  if (!props.filterDefaults && !props.filterOptions) {
    filterStore.updateSelectedFilters(selected);
  } else emit("selectedFiltersUpdated", selected);
}

function setDefaults(): void {
  if (props.filterOptions) {
    filterOptions.value = props.filterOptions;
    filterDefaults.value = { schemes: [], status: [], types: [], sortDirections: [], sortFields: [] };
    selectedFilters.value = { schemes: [], status: [], types: [], sortDirections: [], sortFields: [] };
  }
  if (props.filterDefaults) {
    filterDefaults.value = props.filterDefaults;
  }
  if (!isArrayHasLength(selectedFilters.value.status) && !isArrayHasLength(selectedFilters.value.schemes) && !isArrayHasLength(selectedFilters.value.types)) {
    selectedStatus.value = filterOptions.value.status.filter(
      item => filterDefaults.value?.status.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
    );

    selectedSchemes.value = filterOptions.value.schemes.filter(
      item => filterDefaults.value?.schemes.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
    );

    selectedTypes.value = filterOptions.value.types.filter(
      item => filterDefaults.value?.types.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
    );

    selectedSortField.value = filterDefaults.value.sortFields?.[0];
    selectedSortDirection.value = filterDefaults.value.sortDirections?.[0];
    updateStoreSelectedFilters();
  } else {
    selectedStatus.value = selectedFilters.value.status;
    selectedSchemes.value = selectedFilters.value.schemes;
    selectedTypes.value = selectedFilters.value.types;
    selectedSortField.value =
      filterOptions.value.sortFields.find(item => filterDefaults.value?.sortFields.map(defaultOption => defaultOption["@id"]).includes(item["@id"])) ||
      ({} as TTIriRef);
    selectedSortDirection.value =
      filterOptions.value.sortDirections.find(item => filterDefaults.value?.sortDirections.map(defaultOption => defaultOption["@id"]).includes(item["@id"])) ||
      ({} as TTIriRef);
  }

  if (quickFiltersStatus.value.includeLegacy) {
    includeLegacy.value = quickFiltersStatus.value.includeLegacy;
  }
}

function setLegacy(include: boolean): void {
  const emisScheme = selectedSchemes.value.findIndex(scheme => scheme["@id"] === GRAPH.EMIS);
  if (include) {
    if (emisScheme === -1) {
      const found = filterOptions.value?.schemes.find(scheme => scheme["@id"] === GRAPH.EMIS);
      if (found) selectedSchemes.value.push(found);
    }
  } else {
    if (emisScheme > -1) {
      selectedSchemes.value.splice(emisScheme, 1);
    }
  }
  filterStore.updateQuickFiltersStatus({
    key: "includeLegacy",
    value: include
  });
}
</script>

<style scoped>
label {
  font-size: 1rem !important;
}

.p-field {
  margin-top: 2rem;
}

.quick-filters-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 1rem;
}

.quick-filter-container {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;
}
</style>
