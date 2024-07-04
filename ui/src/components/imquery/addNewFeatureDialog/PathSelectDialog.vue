<template>
  <!-- TODO: Convert following to dialog that prompts the user to select a path if options contain more than one option -->
  <!-- <Listbox v-if="selectedGeneralConcept" v-model="selectedPath" :options="pathSuggestions" class="w-full" listStyle="max-height:250px">
        <template #option="{ option }">
          <div class="flex align-items-center" id="query-path-options">
            <div v-if="isSelectedConceptValue">
              {{ option.path?.[0].name ?? getNameFromIri(dataModelIri) }} -> {{ option.typeOf?.name ?? getNameFromIri(dataModelIri) }}.{{
                option.where?.[0]?.name
              }}
              =
              {{ selectedGeneralConcept?.name }}
            </div>
            <div v-else-if="isSelectedConceptDatamodel">{{ option.path?.[0]?.name }} -> {{ option.typeOf?.name }}</div>
            <div v-else-if="isSelectedConceptProperty">
              {{ option.path?.[0].name ?? getNameFromIri(dataModelIri) }} -> {{ option.typeOf?.name ?? getNameFromIri(dataModelIri) }}.{{
                option.where?.[0]?.name
              }}
            </div>
          </div>
        </template>
      </Listbox> -->
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
interface Props {
  msg?: string;
}
const props = withDefaults(defineProps<Props>(), {
  msg: "hello"
});

onMounted(async () => {});
</script>

<style scoped></style>
