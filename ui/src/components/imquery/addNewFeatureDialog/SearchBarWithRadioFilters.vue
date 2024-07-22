<template>
  <SearchBar v-model:searchTerm="searchTerm" :show-filters="false" @to-search="emit('onSearch', searchTerm)" />
  <div v-if="showTypeFilters" class="type-options flex flex-wrap gap-3">
    <div v-for="typeOption in typeOptions" :key="typeOption.name" class="flex align-items-center">
      <RadioButton
        v-model="selectedType"
        :inputId="typeOption.name"
        name="dynamic"
        :value="typeOption"
        @change="
          () => {
            if (selectedType) emit('onTypeSelect', selectedType);
          }
        "
      />
      <label :for="typeOption.name" class="gap-1">{{ typeOption.name }}</label>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchBar from "@/components/shared/SearchBar.vue";
import { IM } from "@im-library/vocabulary";
import { ref, Ref } from "vue";

export interface TypeOption {
  name: string;
  rootIri: string;
  typeIri: string;
}

interface Props {
  showTypeFilters?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showTypeFilters: true
});

const emit = defineEmits({ onTypeSelect: (payload: TypeOption) => payload, onSearch: (payload: string) => payload });

const searchTerm: Ref<string> = ref("");
const selectedType: Ref<TypeOption | undefined> = ref();
const typeOptions: Ref<TypeOption[]> = ref([
  { name: "All", rootIri: "", typeIri: "" },
  { name: "Concept", rootIri: IM.ONTOLOGY_PARENT_FOLDER, typeIri: IM.CONCEPT },
  { name: "Concept set", rootIri: IM.FOLDER_SETS, typeIri: IM.CONCEPT_SET },
  { name: "Property", rootIri: IM.PROPERTIES_FOLDER, typeIri: IM.DATAMODEL_PROPERTY },
  { name: "Feature", rootIri: IM.MODULE_FEATURES, typeIri: IM.MATCH_CLAUSE },
  { name: "Cohort", rootIri: IM.MODULE_QUERIES, typeIri: IM.COHORT_QUERY }
]);
</script>

<style scoped></style>
