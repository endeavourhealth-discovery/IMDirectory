<template>
  <AutoComplete
    v-if="concept.concept"
    v-model="concept.concept.entailment"
    :suggestions="entailments"
    @complete="searchEntailments"
    emptySearchMessage="Invalid entailment"
  ></AutoComplete>
  {{ concept.concept?.term }}
  <NLRefinementGroupEdit v-if="concept.refinement" :refinement-group="concept.refinement">REFINED</NLRefinementGroupEdit>
</template>

<script setup lang="ts">
import { RefinedConcept } from "@/components/nlEditor/ecl/NLClasses";
import NLRefinementGroupEdit from "@/components/nlEditor/ecl/NLRefinementGroupEdit.vue";
import { ref, Ref } from "vue";
import { AutoCompleteCompleteEvent } from "primevue/autocomplete";

interface Props {
  concept: RefinedConcept;
}

const props = withDefaults(defineProps<Props>(), {});

const entailments: Ref<string[]> = ref([]);

function searchEntailments(event: AutoCompleteCompleteEvent) {
  if (event.query?.length > 0) {
    entailments.value = ["<<", "<", ">", ">>"].filter(e => e.startsWith(event.query));
  } else {
    entailments.value = [];
  }
}
</script>
