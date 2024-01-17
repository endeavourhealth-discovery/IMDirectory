<template>
  <NLRefinedConcept :concept="refinement.property"></NLRefinedConcept>
  {{ refinement.operator }}
  <NLRefinedConcept :concept="refinement.value"></NLRefinedConcept>
</template>

<script setup lang="ts">
import { Refinement } from "@/components/nlEditor/ecl/NLClasses";
import NLRefinedConcept from "@/components/nlEditor/ecl/NLRefinedConcept.vue";

interface Props {
  refinement: Refinement;
}

const props = withDefaults(defineProps<Props>(), {});
</script>
