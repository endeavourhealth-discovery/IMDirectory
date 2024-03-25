<template>
  <div v-if="storeFilterOptions" class="filters">
    <div class="quick-filters-container">
      <div class="quick-filter-container">
        <label>Include legacy:</label>
        <InputSwitch v-model="includeLegacy" @change="emitFilterUpdate()" />
      </div>
    </div>

    <div class="p-field">
      <div class="p-inputgroup">
        <span class="p-float-label">
          <MultiSelect
            id="status"
            optionLabel="name"
            display="chip"
            v-model="selectedStatus"
            :options="storeFilterOptions.status"
            @change="emitFilterUpdate()"
          />
          <label for="status">Select status:</label>
          <Button icon="fa-solid fa-rotate-left" severity="secondary" @click="resetStatus" v-tooltip="'Reset status filters'" />
        </span>
      </div>
    </div>

    <div class="p-field">
      <div class="p-inputgroup">
        <span class="p-float-label">
          <MultiSelect
            id="scheme"
            optionLabel="name"
            display="chip"
            v-model="selectedSchemes"
            :options="storeFilterOptions.schemes"
            @change="emitFilterUpdate()"
          />
          <label for="scheme">Select scheme:</label>
          <Button icon="fa-solid fa-rotate-left" severity="secondary" @click="resetSchemes" v-tooltip="'Reset scheme filters'" />
        </span>
      </div>
    </div>

    <div class="p-field">
      <div class="p-inputgroup">
        <span class="p-float-label">
          <MultiSelect
            id="conceptType"
            optionLabel="name"
            display="chip"
            v-model="selectedTypes"
            :options="storeFilterOptions.types"
            @change="emitFilterUpdate()"
          />
          <label for="conceptType">Select concept type:</label>
          <Button icon="fa-solid fa-rotate-left" severity="secondary" @click="resetTypes" v-tooltip="'Reset type filters'" />
        </span>
      </div>
    </div>

    <div class="p-field">
      <div class="p-inputgroup">
        <span class="p-float-label">
          <Dropdown id="sortField" optionLabel="name" v-model="selectedSortField" :options="storeFilterOptions.sortFields" @change="emitFilterUpdate()" />
          <label for="sortField">Select sort field:</label>
          <Button icon="fa-solid fa-rotate-left" severity="secondary" @click="resetSortField" v-tooltip="'Reset sort field filters'" />
        </span>
      </div>
    </div>

    <div class="p-field">
      <div class="p-inputgroup">
        <span class="p-float-label">
          <Dropdown
            id="sortDirection"
            optionLabel="name"
            v-model="selectedSortDirection"
            :options="storeFilterOptions.sortDirections"
            @change="emitFilterUpdate()"
          />
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
import { GRAPH } from "@im-library/vocabulary";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { useFilterStore } from "@/stores/filterStore";
interface Props {
  selectedFilterOptions?: FilterOptions;
}
const props = defineProps<Props>();

const emit = defineEmits({
  selectedFiltersUpdated: (_payload: FilterOptions) => true
});
const filterStore = useFilterStore();
const storeDefaultFilterOptions: ComputedRef<FilterOptions> = computed(() => filterStore.defaultFilterOptions);
const storeFilterOptions: ComputedRef<FilterOptions> = computed(() => filterStore.filterOptions);
const storeSelectedFilters: ComputedRef<FilterOptions> = computed(() => filterStore.selectedFilterOptions);

const includeLegacy = ref(false);
const selectedStatus: Ref<TTIriRef[]> = ref([]);
const selectedSchemes: Ref<TTIriRef[]> = ref([]);
const selectedTypes: Ref<TTIriRef[]> = ref([]);
const selectedSortField: Ref<TTIriRef | undefined> = ref({} as TTIriRef);
const selectedSortDirection: Ref<TTIriRef | undefined> = ref({} as TTIriRef);

watch(
  () => includeLegacy.value,
  newValue => setLegacy(newValue)
);

onMounted(() => init());

function init() {
  if (storeFilterOptions.value) setSelectedOptions();
}

function emitFilterUpdate() {
  const filterOptions = { schemes: selectedSchemes.value, status: selectedStatus.value, types: selectedTypes.value } as FilterOptions;
  if (selectedSortDirection.value) filterOptions.sortDirections = [selectedSortDirection.value];
  if (selectedSortField.value) filterOptions.sortFields = [selectedSortField.value];
  emit("selectedFiltersUpdated", filterOptions);
}

function resetSortField() {
  if (storeDefaultFilterOptions.value) {
    selectedSortField.value = storeDefaultFilterOptions.value.sortFields?.[0];
    selectedSortDirection.value = storeDefaultFilterOptions.value.sortDirections?.[0];
  }
  emitFilterUpdate();
}

function resetSortDirection() {
  if (storeDefaultFilterOptions.value) selectedSortDirection.value = storeDefaultFilterOptions.value.sortDirections?.[0];
  emitFilterUpdate();
}

function resetStatus() {
  if (storeFilterOptions.value && storeDefaultFilterOptions.value) {
    selectedStatus.value = storeFilterOptions.value.status.filter(
      item => storeDefaultFilterOptions.value?.status.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
    );
  }
  emitFilterUpdate();
}

function resetSchemes() {
  if (storeFilterOptions.value && storeDefaultFilterOptions.value) {
    selectedSchemes.value = storeFilterOptions.value.schemes.filter(
      item => storeDefaultFilterOptions.value?.schemes.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
    );
  }
  emitFilterUpdate();
}

function resetTypes() {
  if (storeFilterOptions.value && storeDefaultFilterOptions.value) {
    selectedTypes.value = storeFilterOptions.value.types.filter(
      item => storeDefaultFilterOptions.value?.types.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
    );
  }
  emitFilterUpdate();
}

function setSelectedOptions(): void {
  if (props.selectedFilterOptions) {
    if (isArrayHasLength(props.selectedFilterOptions.status)) selectedStatus.value = props.selectedFilterOptions.status;
    if (isArrayHasLength(props.selectedFilterOptions.schemes)) selectedSchemes.value = props.selectedFilterOptions.schemes;
    if (isArrayHasLength(props.selectedFilterOptions.types)) selectedTypes.value = props.selectedFilterOptions.types;
    if (isArrayHasLength(props.selectedFilterOptions.sortFields))
      selectedSortField.value = storeFilterOptions.value.sortFields.find(
        item => props.selectedFilterOptions?.sortFields.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
      );

    if (isArrayHasLength(props.selectedFilterOptions.sortDirections))
      selectedSortDirection.value = storeFilterOptions.value.sortDirections.find(
        item => props.selectedFilterOptions?.sortDirections.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
      );
  } else if (
    isArrayHasLength(storeSelectedFilters.value.schemes) ||
    isArrayHasLength(storeSelectedFilters.value.status) ||
    isArrayHasLength(storeSelectedFilters.value.types)
  ) {
    setSelectedFromStore();
  } else {
    setDefaults();
  }
}

function setSelectedFromStore() {
  if (isArrayHasLength(storeSelectedFilters.value.status)) selectedStatus.value = [...storeSelectedFilters.value.status];

  if (isArrayHasLength(storeSelectedFilters.value.schemes)) selectedSchemes.value = [...storeSelectedFilters.value.schemes];

  if (isArrayHasLength(storeSelectedFilters.value.types)) selectedTypes.value = [...storeSelectedFilters.value.types];

  if (isArrayHasLength(storeSelectedFilters.value.sortFields)) selectedSortField.value = storeSelectedFilters.value.sortFields?.[0];
  if (isArrayHasLength(storeSelectedFilters.value.sortDirections)) selectedSortDirection.value = storeSelectedFilters.value.sortDirections?.[0];
}

function setDefaults() {
  if (isArrayHasLength(storeDefaultFilterOptions.value.status)) selectedStatus.value = [...storeDefaultFilterOptions.value.status];

  if (isArrayHasLength(storeFilterOptions.value.schemes)) selectedSchemes.value = [...storeDefaultFilterOptions.value.schemes];

  if (isArrayHasLength(storeFilterOptions.value.types)) selectedTypes.value = [...storeDefaultFilterOptions.value.types];

  if (isArrayHasLength(storeFilterOptions.value.sortFields)) selectedSortField.value = storeDefaultFilterOptions.value.sortFields?.[0];
  if (isArrayHasLength(storeFilterOptions.value.sortDirections)) selectedSortDirection.value = storeDefaultFilterOptions.value.sortDirections?.[0];
}

function setLegacy(include: boolean): void {
  const emisScheme = selectedSchemes.value.findIndex(scheme => scheme["@id"] === GRAPH.EMIS);
  if (include) {
    if (emisScheme === -1) {
      const found = storeFilterOptions.value?.schemes.find(scheme => scheme["@id"] === GRAPH.EMIS);
      if (found) selectedSchemes.value.push(found);
    }
  } else {
    if (emisScheme > -1) {
      selectedSchemes.value.splice(emisScheme, 1);
    }
  }
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
