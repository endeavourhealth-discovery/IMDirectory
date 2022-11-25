<template>
  <div class="quick-filters-container">
    <div class="quick-filter-container">
      <label>Include legacy:</label>
      <InputSwitch v-model="includeLegacy" />
    </div>
  </div>

  <div class="field">
    <div class="p-inputgroup">
      <span class="p-float-label">
        <MultiSelect id="status" v-model="selectedStatus" @change="checkForSearch" :options="filterOptions.status" optionLabel="name" display="chip" />
        <label for="status">Select status:</label>
        <Button icon="pi pi-undo" class="p-button-secondary" @click="resetStatus" v-tooltip="'Reset status filters'" />
      </span>
    </div>
  </div>

  <div class="field">
    <div class="p-inputgroup">
      <span class="p-float-label">
        <MultiSelect id="scheme" v-model="selectedSchemes" @change="checkForSearch" :options="filterOptions.schemes" optionLabel="name" display="chip" />
        <label for="scheme">Select scheme:</label>
        <Button icon="pi pi-undo" class="p-button-secondary" @click="resetSchemes" v-tooltip="'Reset scheme filters'" />
      </span>
    </div>
  </div>

  <div class="field">
    <div class="p-inputgroup">
      <span class="p-float-label">
        <MultiSelect id="conceptType" v-model="selectedTypes" @change="checkForSearch" :options="filterOptions.types" optionLabel="name" display="chip" />
        <label for="scheme">Select concept type:</label>
        <Button icon="pi pi-undo" class="p-button-secondary" @click="resetTypes" v-tooltip="'Reset type filters'" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref, watch } from "vue";
import { useStore } from "vuex";
import { isArrayHasLength } from "@/im_library/helpers/modules/DataTypeCheckers";
import { NAMESPACES } from "@/im_library/vocabulary";
import { Namespace, EntityReferenceNode } from "@/im_library/interfaces";

const props = defineProps({ search: { type: Function, required: true } });

const store = useStore();

const filterOptions = computed(() => store.state.filterOptions);
const selectedFilters = computed(() => store.state.selectedFilters);
const quickFiltersStatus = computed(() => store.state.quickFiltersStatus);
const filterDefaults = computed(() => store.state.filterDefaults);

const selectedStatus: Ref<EntityReferenceNode[]> = ref([]);
const selectedSchemes: Ref<Namespace[]> = ref([]);
const selectedTypes: Ref<EntityReferenceNode[]> = ref([]);
const includeLegacy = ref(false);

watch(includeLegacy, newValue => setLegacy(newValue));
watch(selectedStatus, () => updateStoreSelectedFilters());
watch(selectedSchemes, () => updateStoreSelectedFilters());
watch(selectedTypes, () => updateStoreSelectedFilters());

onMounted(() => init());

function init() {
  setDefaults();
}

function resetStatus() {
  selectedStatus.value = filterOptions.value.status.filter((item: EntityReferenceNode) => filterDefaults.value.statusOptions.includes(item["@id"]));
  checkForSearch();
}

function resetSchemes() {
  selectedSchemes.value = filterOptions.value.schemes.filter((item: Namespace) => filterDefaults.value.schemeOptions.includes(item.iri));
  checkForSearch();
}

function resetTypes() {
  selectedTypes.value = filterOptions.value.types.filter((item: EntityReferenceNode) => filterDefaults.value.typeOptions.includes(item["@id"]));
  checkForSearch();
}

function checkForSearch(): void {
  updateStoreSelectedFilters();
  props.search();
}

function setDefaults(): void {
  if (!isArrayHasLength(selectedFilters.value.status) && !isArrayHasLength(selectedFilters.value.schemes) && !isArrayHasLength(selectedFilters.value.types)) {
    selectedStatus.value = filterOptions.value.status.filter((item: EntityReferenceNode) => filterDefaults.value.statusOptions.includes(item["@id"]));
    selectedSchemes.value = filterOptions.value.schemes.filter((item: Namespace) => filterDefaults.value.schemeOptions.includes(item.iri));
    selectedTypes.value = filterOptions.value.types.filter((item: EntityReferenceNode) => filterDefaults.value.typeOptions.includes(item["@id"]));
    updateStoreSelectedFilters();
  } else {
    selectedStatus.value = selectedFilters.value.status;
    selectedSchemes.value = selectedFilters.value.schemes;
    selectedTypes.value = selectedFilters.value.types;
  }
  if (quickFiltersStatus.value.includeLegacy) {
    includeLegacy.value = quickFiltersStatus.value.includeLegacy;
  }
}

function updateStoreSelectedFilters(): void {
  store.commit("updateSelectedFilters", {
    status: selectedStatus.value,
    schemes: selectedSchemes.value,
    types: selectedTypes.value
  });
}

function setLegacy(include: boolean): void {
  const emisScheme = selectedSchemes.value.findIndex(scheme => scheme.iri === NAMESPACES.EMIS);
  if (include) {
    if (emisScheme === -1) {
      const found = filterOptions.value.schemes.find((scheme: Namespace) => scheme.iri === NAMESPACES.EMIS);
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
.field {
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
