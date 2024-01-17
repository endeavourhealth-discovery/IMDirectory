<template>
  <span v-if="refinementGroup">WHERE</span>
  <div style="padding-left: 1rem" v-for="(refinement, idx) of refinementGroup.refinements">
    <span v-if="refinement.bool">(<NLRefinementGroup :refinement-group="refinement" style="padding-left: 1rem"></NLRefinementGroup>)</span>
    <NLRefinement v-else :refinement="refinement"></NLRefinement>
    <span v-if="idx < refinementGroup.refinements.length - 1">&nbsp;{{ refinementGroup.bool }}</span>
  </div>
</template>

<script setup lang="ts">
import { RefinementGroup } from "@/components/nlEditor/ecl/NLClasses";
import NLRefinement from "@/components/nlEditor/ecl/NLRefinement.vue";

interface Props {
  refinementGroup: RefinementGroup;
}

const props = withDefaults(defineProps<Props>(), {});
</script>
