<template>
  <span :style="{ backgroundColor: selected || parentSelected ? '#e5e5e5' : '' }">
    <span style="padding-right: 0.5rem">...</span>
    <template v-if="parentOperator === Bool.rule">
      <span class="rule">Rule {{ clauseIndex }}</span>
    </template>
    <span v-else-if="parentOperator && clauseIndex > 0" :class="parentOperator">{{ parentOperator }}</span>
    <span v-if="match.notExists" class="not">Exclude if </span>
    <span v-if="boolGroup.length" :class="operator">
      {{ getBooleanLabel("match", operator as Bool, clauseIndex, !eclQuery, true) }}
    </span>
    <span v-if="importClauses" class="clause-checkbox">
      <Checkbox
        v-model="checked"
        v-tooltip="'Check will add to import list'"
        :inputId="'clause' + clauseIndex"
        binary
        data-testid="group-checkbox"
        name="Group"
        @update:modelValue="onClauseCheckChange"
      />
      <span class="clause-label">Check to add to import list</span>
    </span>
    <ValueSentenceDisplay v-if="match.having && havingSentence" :value-sentence="havingSentence" />
    <template v-for="(nestedQuery, index) in boolGroup" :key="`nestedQueryDisplay-${index}`">
      <RecursiveMatchDisplay
        :baseType="baseType"
        :clause-index="index"
        :depth="depth + 1"
        :eclQuery="eclQuery"
        :expanded="expanded"
        :match="nestedQuery"
        :parent-match="match"
        :parentOperator="operator as Bool"
        :parentSelected="selected"
      />
    </template>
    <template v-if="parentOperator === Bool.rule">
      <span class="tree-node-line" style="display: block; margin-left: 1.5rem">
        <span class="field">if true</span>
        <span :class="match.ifTrue">{{ match.ifTrue }},</span>
        <span class="field">if false</span>
        <span :class="match.ifFalse">{{ match.ifFalse }}<br /></span>
      </span>
    </template>
  </span>
</template>

<script lang="ts" setup>
import { computed, inject, ref } from "vue";

import { Bool } from "@endeavour/vue-library/enums";
import type { Query, Node } from "@endeavour/vue-library/models";

import ValueSentenceDisplay from "@/components/imquery/ValueSentenceDisplay.vue";
import RecursiveMatchDisplay from "@/components/query/viewer/RecursiveMatchDisplay.vue";
import { buildHavingSentence } from "@/helpers/QueryEditorMethods";
import { clauseCheck, getBooleanLabel } from "@/helpers/buildQuery";

interface Props {
  match: Query;
  parentMatch: Query;
  boolGroup: Query[];
  parentOperator?: Bool;
  operator: Bool;
  depth: number;
  clauseIndex: number;
  eclQuery?: boolean;
  baseType: Node;
  expanded?: boolean;
  parentSelected?: boolean;
}

const props = defineProps<Props>();
const importClauses: Map<string, Query> | undefined = inject("importClauses", undefined);
const checked = ref(false);
const selected = ref(props.parentSelected);
const havingSentence = computed(() => {
  return buildHavingSentence(props.match.having);
});
function onClauseCheckChange() {
  if (importClauses) clauseCheck(importClauses, props.match, checked.value);
  selected.value = checked.value;
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

.clause-checkbox {
  display: flex;
  justify-content: flex-end;
  padding-right: 10rem;
}

.not {
  color: var(--p-red-500) !important;
  padding-right: 0.2rem;
}
</style>
