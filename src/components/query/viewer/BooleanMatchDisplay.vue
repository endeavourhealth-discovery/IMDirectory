<template>
  <span v-if="parentOperator != Bool.step" style="padding-right: 0.5rem">...</span>
  <span v-else style="padding-right: 6rem"></span>
  <template v-if="parentOperator === Bool.rule">
    <span class="rule">Rule {{ clauseIndex }}</span>
  </template>
  <span v-else-if="parentOperator && clauseIndex > 0 && parentOperator != Bool.union && parentOperator != Bool.step" :class="parentOperator">{{
    parentOperator
  }}</span>
  <template v-if="parentMatch?.union">
    <span class="number">{{ getSubrule(clauseIndex + 1) }}</span>
  </template>
  <span v-if="boolGroup.length > 1" :class="operator">
    {{ getBooleanLabel("match", operator as Bool, clauseIndex, !eclQuery, true, parentOperator) }}
  </span>
  <div :style="{ marginLeft: `${depth}rem` }">
    <div v-for="(nestedQuery, index) in boolGroup" :key="`nestedQueryDisplay-${index}`">
      <RecursiveMatchDisplay
        :match="nestedQuery"
        :clause-index="index"
        :parentOperator="operator as Bool"
        :depth="depth + 1"
        :parent-match="match"
        :eclQuery="eclQuery"
      />
    </div>
    <div v-if="parentOperator === Bool.rule" class="tree-node-line" style="margin-left: 1.5rem">
      <span class="field">if true</span>
      <span :class="match.ifTrue">{{ match.ifTrue }},</span>
      <span class="field">if false</span>
      <span :class="match.ifFalse">{{ match.ifFalse }}<br /></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Match, Bool } from "@/interfaces/AutoGen";
import { Ref, ref, inject } from "vue";
import { getBooleanLabel } from "@/helpers/buildQuery";
import RecursiveMatchDisplay from "@/components/query/viewer/RecursiveMatchDisplay.vue";

interface Props {
  match: Match;
  parentMatch: Match;
  boolGroup: Match[];
  parentOperator?: Bool;
  operator: Bool;
  depth: number;
  clauseIndex: number;
  eclQuery?: boolean;
}

const props = defineProps<Props>();

function getSubrule(index: number): string {
  return index + String.fromCharCode(96 + index);
}
</script>

<style scoped>
.number {
  font-weight: bold;
  padding-right: 0.5rem;
}
.text {
  display: inline;
}
.tight-spacing {
  margin-top: -1rem;
  margin-bottom: 0.5rem;
}
.indent {
  padding-right: 2rem;
}

.node-ref {
  padding-right: 0.2rem;
  font-style: italic;
}
.field {
  padding-right: 0.2rem;
}
.rule {
  font-weight: bold;
  padding-right: 1rem;
}
.where {
  padding-left: 0.2rem;
  padding-right: 0.2rem;
}

#recursive-match-display:deep(.or) {
  color: var(--p-blue-500);
  font-style: italic;
  padding-right: 1.2rem;
}

.as {
  padding-left: 0.5rem;
  color: var(--p-amber-700) !important;
}
.linked-match {
  color: var(--p-amber-700) !important;
  padding-left: 0.5rem;
  padding-right: 0.2rem;
  cursor: pointer !important;
}

.either {
  color: var(--p-blue-500);
  padding-right: 0.3rem;
}

.or {
  color: var(--p-blue-500);
  font-style: italic;
  padding-right: 1.2rem;
}

.and {
  color: #707824;
  font-style: italic;
  padding-right: 0.3rem;
}
.not {
  color: var(--p-red-500) !important;
  padding-right: 0.2rem;
}

.SELECT {
  color: var(--p-green-500);
  padding-right: 1.2rem;
}

.REJECT {
  color: var(--p-red-500);
  padding-right: 1.2rem;
}

.NEXT {
  color: var(--p-purple-500);
  padding-right: 1.2rem;
}
</style>
