<template>
  <span style="padding-right: 0.5rem">...</span>
  <template v-if="parentOperator === Bool.rule">
    <span class="rule">Rule {{ clauseIndex }}</span>
  </template>
  <span v-else-if="parentOperator && clauseIndex > 0" :class="parentOperator">{{ parentOperator }}</span>
  <span v-if="boolGroup.length > 1" :class="operator">
    {{ getBooleanLabel("match", operator as Bool, clauseIndex, !eclQuery, true) }}
  </span>
  <template v-for="(nestedQuery, index) in boolGroup" :key="`nestedQueryDisplay-${index}`">
    <div :style="{ marginLeft: `${getMarginDepth(index) * 30}px` }">
      <RecursiveMatchDisplay
        :match="nestedQuery"
        :clause-index="index"
        :parentOperator="operator as Bool"
        :depth="depth + 1"
        :parent-match="match"
        :eclQuery="eclQuery"
        :baseType="baseType"
      />
    </div>
  </template>
  <div v-if="parentOperator === Bool.rule" class="tree-node-line" style="margin-left: 1.5rem">
    <span class="field">if true</span>
    <span :class="match.ifTrue">{{ match.ifTrue }},</span>
    <span class="field">if false</span>
    <span :class="match.ifFalse">{{ match.ifFalse }}<br /></span>
  </div>
</template>

<script setup lang="ts">
import type { Match, Node } from "vue-library/interfaces";
import { Bool } from "vue-library/enums";
import { Ref, ref, inject, computed } from "vue";
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
  baseType: Node;
}

const props = defineProps<Props>();

function getMarginDepth(index: number) {
  return props.depth;
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
