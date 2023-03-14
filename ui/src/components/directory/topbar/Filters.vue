<template>
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
        <Button icon="pi pi-undo" class="p-button-secondary" @click="resetStatus" v-tooltip="'Reset status filters'" />
      </span>
    </div>
  </div>

  <div class="p-field">
    <div class="p-inputgroup">
      <span class="p-float-label">
        <MultiSelect id="scheme" v-model="selectedSchemes" @change="checkForSearch" :options="filterOptions.schemes" optionLabel="name" display="chip" />
        <label for="scheme">Select scheme:</label>
        <Button icon="pi pi-undo" class="p-button-secondary" @click="resetSchemes" v-tooltip="'Reset scheme filters'" />
      </span>
    </div>
  </div>

  <div class="p-field">
    <div class="p-inputgroup">
      <span class="p-float-label">
        <MultiSelect id="conceptType" v-model="selectedTypes" @change="checkForSearch" :options="filterOptions.types" optionLabel="name" display="chip" />
        <label for="conceptType">Select concept type:</label>
        <Button icon="pi pi-undo" class="p-button-secondary" @click="resetTypes" v-tooltip="'Reset type filters'" />
      </span>
    </div>
  </div>

  <div class="p-field">
    <div class="p-inputgroup">
      <span class="p-float-label">
        <Dropdown id="sortField" v-model="selectedSortField" @change="checkForSearch" :options="filterOptions.sortFields" optionLabel="name" />
        <label for="sortField">Select sort field:</label>
        <Button icon="pi pi-undo" class="p-button-secondary" @click="resetSortField" v-tooltip="'Reset sort field filters'" />
      </span>
    </div>
  </div>

  <div class="p-field">
    <div class="p-inputgroup">
      <span class="p-float-label">
        <Dropdown id="sortDirection" v-model="selectedSortDirection" @change="checkForSearch" :options="filterOptions.sortDirections" optionLabel="name" />
        <label for="sortDirection">Select sort direction:</label>
        <Button icon="pi pi-undo" class="p-button-secondary" @click="resetSortDirection" v-tooltip="'Reset sort direction filters'" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, onMounted, ref, Ref, watch } from "vue";
import { useStore } from "vuex";
import { EntityReferenceNode, FilterOptions } from "@im-library/interfaces";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM } from "@im-library/vocabulary";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";

const props = defineProps({
  search: { type: Function, required: true }
});

const store = useStore();
const filterOptions: Ref<FilterOptions> = computed(() => store.state.filterOptions);
const filterDefaults: Ref<FilterOptions> = computed(() => store.state.filterDefaults);
const selectedFilters: ComputedRef<FilterOptions> = computed(() => store.state.selectedFilters);
const quickFiltersStatus = computed(() => store.state.quickFiltersStatus);

const selectedStatus: Ref<TTIriRef[]> = ref([]);
const selectedSchemes: Ref<TTIriRef[]> = ref([]);
const selectedTypes: Ref<TTIriRef[]> = ref([]);
const selectedSortField: Ref<TTIriRef> = ref({} as TTIriRef);
const selectedSortDirection: Ref<TTIriRef> = ref({} as TTIriRef);
const includeLegacy = ref(false);

watch(includeLegacy, newValue => setLegacy(newValue));

watch([selectedStatus, selectedSchemes, selectedTypes, selectedSortField, selectedSortDirection], () => updateStoreSelectedFilters());

onMounted(() => init());

function init() {
  setDefaults();
}

function resetSortField() {
  selectedSortField.value = filterDefaults.value.sortFields?.[0];
  selectedSortDirection.value = filterDefaults.value.sortDirections?.[0];
}

function resetSortDirection() {
  selectedSortDirection.value = filterDefaults.value.sortDirections?.[0];
}

function resetStatus() {
  selectedStatus.value = filterOptions.value.status.filter(item =>
    filterDefaults.value.status.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
  );
  checkForSearch();
}

function resetSchemes() {
  selectedSchemes.value = filterOptions.value.schemes.filter(item =>
    filterDefaults.value.schemes.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
  );
  checkForSearch();
}

function resetTypes() {
  selectedTypes.value = filterOptions.value.types.filter(item => filterDefaults.value.types.map(defaultOption => defaultOption["@id"]).includes(item["@id"]));
  checkForSearch();
}

function checkForSearch(): void {
  updateStoreSelectedFilters();
  props.search();
}

function updateStoreSelectedFilters(): void {
  store.commit("updateSelectedFilters", {
    status: selectedStatus.value,
    schemes: selectedSchemes.value,
    types: selectedTypes.value,
    sortFields: [selectedSortField.value],
    sortDirections: [selectedSortDirection.value]
  } as FilterOptions);
}

function setDefaults(): void {
  if (!isArrayHasLength(selectedFilters.value.status) && !isArrayHasLength(selectedFilters.value.schemes) && !isArrayHasLength(selectedFilters.value.types)) {
    selectedStatus.value = filterOptions.value.status.filter(item =>
      filterDefaults.value.status.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
    );

    selectedSchemes.value = filterOptions.value.schemes.filter(item =>
      filterDefaults.value.schemes.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
    );

    selectedTypes.value = filterOptions.value.types.filter(item => filterDefaults.value.types.map(defaultOption => defaultOption["@id"]).includes(item["@id"]));

    selectedSortField.value = filterDefaults.value.sortFields?.[0];
    selectedSortDirection.value = filterDefaults.value.sortDirections?.[0];
    updateStoreSelectedFilters();
  } else {
    selectedStatus.value = selectedFilters.value.status;
    selectedSchemes.value = selectedFilters.value.schemes;
    selectedTypes.value = selectedFilters.value.types;
    selectedSortField.value =
      filterOptions.value.sortFields.find(item => filterDefaults.value.sortFields.map(defaultOption => defaultOption["@id"]).includes(item["@id"])) ||
      ({} as TTIriRef);
    selectedSortDirection.value =
      filterOptions.value.sortDirections.find(item => filterDefaults.value.sortDirections.map(defaultOption => defaultOption["@id"]).includes(item["@id"])) ||
      ({} as TTIriRef);
  }

  if (quickFiltersStatus.value.includeLegacy) {
    includeLegacy.value = quickFiltersStatus.value.includeLegacy;
  }
}

function setLegacy(include: boolean): void {
  const emisScheme = selectedSchemes.value.findIndex(scheme => scheme["@id"] === IM.GRAPH_EMIS);
  if (include) {
    if (emisScheme === -1) {
      const found = filterOptions.value.schemes.find(scheme => scheme["@id"] === IM.GRAPH_EMIS);
      if (found) selectedSchemes.value.push(found);
    }
  } else {
    if (emisScheme > -1) {
      selectedSchemes.value.splice(emisScheme, 1);
    }
  }
  store.commit("updateQuickFiltersStatus", {
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
