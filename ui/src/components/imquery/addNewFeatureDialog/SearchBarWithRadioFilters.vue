<template>
  <!--TODO: Move the following div to a subcomponent -->
  <div class="flex justify-content-center align-items-center">
    <SearchBar v-model:searchTerm="searchTerm" :show-filters="false" @to-search="emit('onSearch', searchTerm)" />
    <div class="type-options flex flex-wrap gap-3">
      <div v-for="typeOption in typeOptions" :key="typeOption.name" class="flex align-items-center">
        <RadioButton
          v-model="selectedType"
          :inputId="typeOption.name"
          name="dynamic"
          :value="typeOption"
          @change="
            {
              if (selectedType) emit('onTypeSelect', selectedType);
            }
          "
        />
        <label :for="typeOption.name" class="gap-1">{{ typeOption.name }}</label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchBar from "@/components/shared/SearchBar.vue";
import { IM, SHACL } from "@im-library/vocabulary";
import { ref } from "vue";
import { Ref } from "vue";
import { onMounted, watch } from "vue";

export interface TypeOption {
  name: string;
  rootIri: string;
  typeIri: string;
}

const emit = defineEmits({ onTypeSelect: (payload: TypeOption) => payload, onSearch: (payload: string) => payload });

const searchTerm: Ref<string> = ref("");
const selectedType: Ref<TypeOption | undefined> = ref();
const typeOptions: Ref<TypeOption[]> = ref([
  { name: "All", rootIri: "", typeIri: "" },
  { name: "Concept", rootIri: "http://endhealth.info/im#HealthModelOntology", typeIri: IM.CONCEPT },
  { name: "Concept set", rootIri: IM.FOLDER_SETS, typeIri: IM.CONCEPT_SET },
  { name: "Property", rootIri: "http://endhealth.info/im#Properties", typeIri: IM.DATAMODEL_PROPERTY },
  { name: "Data model", rootIri: "http://endhealth.info/im#DataModels", typeIri: SHACL.NODESHAPE }
]);

onMounted(async () => {});
</script>

<style scoped></style>
