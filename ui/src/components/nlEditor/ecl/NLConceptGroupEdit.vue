<template>
  <div v-if="conceptGroup && conceptGroup.concepts">
    <div v-for="(concept, idx) of conceptGroup.concepts">
      <span v-if="(concept as any).bool">(<NLConceptGroupEdit :concept-group="concept as ConceptGroup" style="padding-left: 1rem"></NLConceptGroupEdit>)</span>
      <NLRefinedConceptEdit v-else :concept="concept"></NLRefinedConceptEdit>
      <span v-if="idx < conceptGroup.concepts.length - 1">&nbsp;{{ conceptGroup.bool }}</span>
    </div>
  </div>
  <div>[Editor to add]</div>
</template>

<script setup lang="ts">
import { ConceptGroup } from "@/components/nlEditor/ecl/NLClasses";
import NLRefinedConceptEdit from "@/components/nlEditor/ecl/NLRefinedConceptEdit.vue";

interface Props {
  conceptGroup: ConceptGroup;
}

const props = withDefaults(defineProps<Props>(), {});
</script>
