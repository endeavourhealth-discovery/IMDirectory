<template>
  <span v-if="refinementGroup">WHERE</span>
  <div style="padding-left: 1rem" v-for="(refinement, idx) of refinementGroup.refinements">
    <span v-if="(refinement as any).bool"
      >(<NLRefinementGroupEdit :refinement-group="refinement as RefinementGroup" style="padding-left: 1rem"></NLRefinementGroupEdit>)</span
    >
    <NLRefinementEdit v-else :refinement="refinement as Refinement"></NLRefinementEdit>
    <span v-if="idx < refinementGroup.refinements.length - 1">&nbsp;{{ refinementGroup.bool }}</span>
  </div>
</template>

<script setup lang="ts">
import { Refinement, RefinementGroup } from "@/components/nlEditor/ecl/NLClasses";
import NLRefinementEdit from "@/components/nlEditor/ecl/NLRefinementEdit.vue";

interface Props {
  refinementGroup: RefinementGroup;
}

const props = withDefaults(defineProps<Props>(), {});
</script>
