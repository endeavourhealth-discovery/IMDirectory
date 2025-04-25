<template>
  <div v-if="storeFilterOptions" class="filters">
    <div class="quick-filters-container">
      <div class="quick-filter-container">
        <label>Include legacy:</label>
        <ToggleSwitch v-model="includeLegacy" @change="emitFilterUpdate()" />
      </div>
    </div>

    <div class="p-field">
      <div class="p-inputgroup">
        <FloatLabel>
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
        </FloatLabel>
      </div>
    </div>

    <div class="p-field">
      <div class="p-inputgroup">
        <FloatLabel>
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
        </FloatLabel>
      </div>
    </div>

    <div class="p-field">
      <div class="p-inputgroup">
        <FloatLabel>
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
        </FloatLabel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, onMounted, ref, Ref, watch } from "vue";
import { FilterOptions } from "@/interfaces";
import { TTIriRef } from "@/interfaces/AutoGen";
import { GRAPH } from "@/vocabulary";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { useFilterStore } from "@/stores/filterStore";
interface Props {
  selectedFilterOptions?: FilterOptions;
}
const props = defineProps<Props>();

const emit = defineEmits<{
  selectedFiltersUpdated: [payload: FilterOptions];
}>();
const filterStore = useFilterStore();
const storeDefaultFilterOptions: ComputedRef<FilterOptions> = computed(() => filterStore.defaultFilterOptions);
const storeFilterOptions: ComputedRef<FilterOptions> = computed(() => filterStore.filterOptions);
const storeSelectedFilters: ComputedRef<FilterOptions> = computed(() => filterStore.selectedFilterOptions);

const includeLegacy = ref(false);
const selectedStatus: Ref<TTIriRef[]> = ref([]);
const selectedSchemes: Ref<TTIriRef[]> = ref([]);
const selectedTypes: Ref<TTIriRef[]> = ref([]);

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
  emit("selectedFiltersUpdated", filterOptions);
}

function resetStatus() {
  if (storeFilterOptions.value && storeDefaultFilterOptions.value) {
    selectedStatus.value = storeFilterOptions.value.status.filter(item =>
      storeDefaultFilterOptions.value?.status.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
    );
  }
  emitFilterUpdate();
}

function resetSchemes() {
  if (storeFilterOptions.value && storeDefaultFilterOptions.value) {
    selectedSchemes.value = storeFilterOptions.value.schemes.filter(item =>
      storeDefaultFilterOptions.value?.schemes.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
    );
  }
  emitFilterUpdate();
}

function resetTypes() {
  if (storeFilterOptions.value && storeDefaultFilterOptions.value) {
    selectedTypes.value = storeFilterOptions.value.types.filter(item =>
      storeDefaultFilterOptions.value?.types.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
    );
  }
  emitFilterUpdate();
}

function setSelectedOptions(): void {
  if (props.selectedFilterOptions) {
    if (isArrayHasLength(props.selectedFilterOptions.status)) selectedStatus.value = props.selectedFilterOptions.status;
    if (isArrayHasLength(props.selectedFilterOptions.schemes)) selectedSchemes.value = props.selectedFilterOptions.schemes;
    if (isArrayHasLength(props.selectedFilterOptions.types)) selectedTypes.value = props.selectedFilterOptions.types;
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
}

function setDefaults() {
  if (isArrayHasLength(storeDefaultFilterOptions.value.status)) selectedStatus.value = [...storeDefaultFilterOptions.value.status];

  if (isArrayHasLength(storeFilterOptions.value.schemes)) selectedSchemes.value = [...storeDefaultFilterOptions.value.schemes];

  if (isArrayHasLength(storeFilterOptions.value.types)) selectedTypes.value = [...storeDefaultFilterOptions.value.types];
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
