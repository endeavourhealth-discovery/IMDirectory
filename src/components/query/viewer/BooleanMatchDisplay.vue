<template>
  <span :style="{ backgroundColor: selected || parentSelected ? '#e5e5e5' : '' }">
    <span style="padding-right: 0.5rem">...</span>
    <template v-if="parentOperator === Bool.rule">
      <span class="rule">Rule {{ clauseIndex }}</span>
    </template>
    <span v-else-if="parentOperator && clauseIndex > 0" :class="parentOperator">{{ parentOperator }}</span>
    <span v-if="boolGroup.length > 1" :class="operator">
      {{ getBooleanLabel("match", operator as Bool, clauseIndex, !eclQuery, true) }}
    </span>
    <span v-if="importClauses" class="clause-checkbox">
      <Checkbox
        :inputId="'clause' + clauseIndex"
        name="Group"
        binary
        v-model="checked"
        data-testid="group-checkbox"
        @update:modelValue="onClauseCheckChange"
        v-tooltip="'Check will add to import list'"
      />
      <span class="clause-label">Check to add to import list</span>
    </span>
    <ValueSentenceDisplay v-if="match.having &&havingSentence" :value-sentence="havingSentence" />
    <template v-for="(nestedQuery, index) in boolGroup" :key="`nestedQueryDisplay-${index}`">
      <RecursiveMatchDisplay
        :match="nestedQuery"
        :clause-index="index"
        :expanded="expanded"
        :parentOperator="operator as Bool"
        :depth="depth + 1"
        :parent-match="match"
        :eclQuery="eclQuery"
        :baseType="baseType"
        :parentSelected="selected"
      />
    </template>
    <div v-if="parentOperator === Bool.rule" class="tree-node-line" style="margin-left: 1.5rem">
      <span class="field">if true</span>
      <span :class="match.ifTrue">{{ match.ifTrue }},</span>
      <span class="field">if false</span>
      <span :class="match.ifFalse">{{ match.ifFalse }}<br /></span>
    </div>
  </span>
</template>

<script setup lang="ts">
import { Ref, computed, inject, ref } from "vue";

import { Bool } from "vue-library/enums";
import type { Match, Node } from "vue-library/interfaces";

import ValueSentenceDisplay from "@/components/imquery/ValueSentenceDisplay.vue";
import RecursiveMatchDisplay from "@/components/query/viewer/RecursiveMatchDisplay.vue";
import { buildHavingSentence } from "@/helpers/QueryEditorMethods";
import { clauseCheck, getBooleanLabel } from "@/helpers/buildQuery";

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
  expanded?: boolean;
  parentSelected?: boolean;
}

const props = defineProps<Props>();
const importClauses: Map<string, Match> | undefined = inject("importClauses", undefined);
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
</style>
