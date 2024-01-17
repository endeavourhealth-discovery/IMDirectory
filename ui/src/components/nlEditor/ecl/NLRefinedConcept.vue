<template>
  {{ concept.concept?.entailment }} {{ concept.concept?.term }}
  <NLRefinementGroup v-if="concept.refinement" :refinement-group="concept.refinement">REFINED</NLRefinementGroup>
</template>

<script setup lang="ts">
import { RefinedConcept } from "@/components/nlEditor/ecl/NLClasses";
import NLRefinementGroup from "@/components/nlEditor/ecl/NLRefinementGroup.vue";

interface Props {
  concept: RefinedConcept;
}

const props = withDefaults(defineProps<Props>(), {});
</script>
