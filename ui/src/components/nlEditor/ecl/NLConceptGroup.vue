<template>
  <div v-if="conceptGroup">
    <div v-for="(concept, idx) of conceptGroup.concepts">
      <span v-if="concept.bool">(<NLConceptGroup :concept-group="concept" style="padding-left: 1rem"></NLConceptGroup>)</span>
      <NLRefinedConcept v-else :concept="concept"></NLRefinedConcept>
      <span v-if="idx < conceptGroup.concepts.length - 1">&nbsp;{{ conceptGroup.bool }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ConceptGroup } from "@/components/nlEditor/ecl/NLClasses";
import NLRefinedConcept from "@/components/nlEditor/ecl/NLRefinedConcept.vue";

interface Props {
  conceptGroup: ConceptGroup;
}

const props = withDefaults(defineProps<Props>(), {});
</script>
