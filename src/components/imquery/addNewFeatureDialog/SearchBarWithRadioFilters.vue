<template>
  <SearchBar v-model:searchTerm="searchTerm" :show-filters="false" @to-search="emit('onSearch', searchTerm)" />
  <div v-if="showAllTypeFilters" class="type-options flex flex-wrap gap-4">
    <div v-for="typeOption in typeOptions" :key="typeOption.name" class="flex items-center">
      <RadioButton v-model="selectedType" :disabled="typeOption.isLocked" :inputId="typeOption.name" name="dynamic" :value="typeOption" />
      <label :for="typeOption.name" class="gap-1">{{ typeOption.name }}</label>
    </div>
  </div>
  <div v-else class="type-options flex flex-wrap gap-4">
    <div
      v-for="typeOption in typeOptions.filter(typeOpt => typeOpt.typeIri === IM.CONCEPT_SET || typeOpt.typeIri === IM.CONCEPT)"
      :key="typeOption.name"
      class="flex items-center"
    >
      <RadioButton v-model="selectedType" :disabled="typeOption.isLocked" :inputId="typeOption.name" name="dynamic" :value="typeOption" />
      <label :for="typeOption.name" class="gap-1">{{ typeOption.name }}</label>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchBar from "@/components/shared/SearchBar.vue";
import { IM } from "@/vocabulary";
import { onMounted, ref, Ref, watch, computed, ComputedRef } from "vue";

export interface TypeOption {
  name: string;
  rootIri: string;
  typeIri: string;
  isLocked: boolean;
}

interface Props {
  showAllTypeFilters?: boolean;
  lockTypeFilters?: { all: boolean; concept: boolean; conceptSet: boolean; property: boolean; feature: boolean; cohort: boolean };
}

const props = withDefaults(defineProps<Props>(), {
  showTypeFilters: true,
  lockTypeFilters: () => {
    return { all: false, concept: false, conceptSet: false, property: false, feature: false, cohort: false };
  }
});

const emit = defineEmits<{
  onTypeSelect: [payload: TypeOption];
  onSearch: [payload: string];
}>();

const searchTerm: Ref<string> = ref("");
const typeOptions: ComputedRef<TypeOption[]> = computed(() => [
  { name: "All", rootIri: "", typeIri: "", isLocked: props.lockTypeFilters.all },
  { name: "Concept", rootIri: IM.ONTOLOGY_PARENT_FOLDER, typeIri: IM.CONCEPT, isLocked: props.lockTypeFilters.concept },
  { name: "Concept set", rootIri: IM.FOLDER_SETS, typeIri: IM.CONCEPT_SET, isLocked: props.lockTypeFilters.conceptSet },
  { name: "Property", rootIri: IM.PROPERTIES_FOLDER, typeIri: IM.DATAMODEL_PROPERTY, isLocked: props.lockTypeFilters.property },
  { name: "Feature", rootIri: IM.MODULE_FEATURES, typeIri: IM.MATCH_CLAUSE, isLocked: props.lockTypeFilters.feature },
  { name: "Cohort", rootIri: IM.MODULE_QUERIES, typeIri: IM.QUERY, isLocked: props.lockTypeFilters.cohort }
]);
const selectedType: Ref<TypeOption> = ref(typeOptions.value[2]);

watch(selectedType, newValue => {
  emit("onTypeSelect", newValue);
});

onMounted(() => {
  emit("onTypeSelect", selectedType.value);
});
</script>

<style scoped></style>
