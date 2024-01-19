<template>
  <NLRefinedConceptEdit v-if="refinement.property" :concept="refinement.property"></NLRefinedConceptEdit>
  {{ refinement.operator }}
  <NLRefinedConceptEdit v-if="refinement.value" :concept="refinement.value"></NLRefinedConceptEdit>
</template>

<script setup lang="ts">
import { Refinement } from "@/components/nlEditor/ecl/NLClasses";
import NLRefinedConceptEdit from "@/components/nlEditor/ecl/NLRefinedConceptEdit.vue";

interface Props {
  refinement: Refinement;
}

const props = withDefaults(defineProps<Props>(), {});
</script>
