<template>
  <div
    :style="{
      marginLeft: `${depth * 10}px`,
      backgroundColor: selected || parentSelected ? '#e5e5e5' : ''
    }"
  >
    <template v-if="boolGroup && operator">
      <BooleanMatchDisplay
        :baseType="baseType"
        :boolGroup="boolGroup as Match[]"
        :clauseIndex="clauseIndex"
        :depth="depth"
        :expanded="matchExpanded"
        :match="match"
        :operator="operator"
        :parentMatch="parentMatch"
        :parentOperator="parentOperator"
        :parentSelected="parentSelected"
      />
    </template>
    <template v-else>
      <span v-if="parentOperator === Bool.rule && clauseIndex > 0">
        <span class="rule">Rule {{ clauseIndex }}</span>
      </span>
      <span v-else-if="parentOperator && clauseIndex > 0" :class="parentOperator">{{ parentOperator }}</span>

      <span v-if="match.notExists">
        <span class="not">Exclude if </span>
        <span v-if="parentMatch && parentMatch.notExists">(double negative)</span>
      </span>

      <span v-if="match.description">
        <Button
          v-if="!eclQuery"
          :icon="!matchExpanded ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'"
          class="tight-spacing"
          text
          @click="matchExpanded = !matchExpanded"
        />
        <span class="match-description"> {{ match.description }}</span>
      </span>

      <template v-if="match.is">
        <Button v-if="!eclQuery" :icon="!cohort ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" text @click="expandCohort" />
        <template v-if="cohort">
          <span v-if="match.is.descendantsOrSelfOf" class="field">subtypes of </span>
          <RecursiveMatchDisplay
            :baseType="baseType"
            :clause-index="0"
            :depth="depth + 1"
            :eclQuery="eclQuery"
            :match="cohort"
            :parent-match="match"
            :parent-operator="parentOperator"
          />
        </template>
        <template v-else>
          <span class="field">in</span>
          <IMViewerLink
            v-if="match.is.iri"
            :action="editMode ? 'view' : 'select'"
            :iri="match.is.iri"
            :label="match.is.name"
            @navigateTo="(iri: string) => emit('navigateTo', iri)"
          />
        </template>
      </template>
      <template v-if="matchExpanded || !match.description">
        <component :is="match.description ? 'div' : 'span'">
          <span v-if="match.orderBy" class="field">{{ match.orderBy.description }}</span>
          <span v-if="match.typeOf && match.typeOf.iri != baseType.iri" class="field">{{ match.typeOf.name }}</span>
          <template v-if="match.where">
            <span class="where">where</span>
            <RecursiveWhereDisplay
              :key="0"
              :depth="depth + 1"
              :eclQuery="eclQuery"
              :editMode="editMode"
              :expandedSet="expandSet"
              :index="0"
              :inline="!match.where.and && !match.where.or"
              :root="true"
              :where="match.where"
            />
          </template>
          <div v-if="match.then && match.then.where">
            <span class="node-ref">then with the {{ testFields }} of the above</span>
            <RecursiveWhereDisplay
              :key="0"
              :depth="depth + 1"
              :eclQuery="eclQuery"
              :editMode="editMode"
              :expandedSet="expandSet"
              :index="0"
              :inline="false"
              :root="true"
              :where="match.then.where"
            />
          </div>
          <span v-if="match.node">
            <span class="as">save</span>
            <span class="node-ref">as {{ match.node }}</span>
          </span>
        </component>
      </template>
      <div v-if="parentOperator === Bool.rule && clauseIndex > 0" class="tree-node-line" style="margin-left: 1.5rem">
        <span class="field">if true</span>
        <span :class="match.ifTrue">{{ match.ifTrue }},</span>
        <span class="field">if false</span>
        <span :class="match.ifFalse">{{ match.ifFalse }}<br /></span>
      </div>
      <div v-if="importClauses" class="clause-checkbox">
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
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { Ref, computed, inject, ref } from "vue";

import { Bool, DisplayMode } from "@endeavour/vue-library/enums";
import type { Match, Node } from "@endeavour/vue-library/models";

import BooleanMatchDisplay from "@/components/query/viewer/BooleanMatchDisplay.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { clauseCheck, getBoolGroup, getBooleanOperator, getDisplayOperator, getTestFields } from "@/helpers/buildQuery";
import { QueryService } from "@/services";

import RecursiveWhereDisplay from "./RecursiveWhereDisplay.vue";

interface Props {
  isVariable?: boolean;
  depth: number;
  clauseIndex: number;
  canExpand?: boolean;
  editMode?: boolean;
  eclQuery?: boolean;
  parentOperator?: Bool;
  step?: boolean;
  baseType: Node;
  expanded?: boolean;
  parentSelected?: boolean;
}

const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const parentMatch = defineModel<Match>("parentMatch", { default: {} });
const emit = defineEmits<{
  navigateTo: [payload: string];
}>();
const expandSet: Ref<boolean> = ref(false);
const cohort: Ref<Match | undefined> = ref();
const queryIri: Ref<string | undefined> = ref(inject("queryIri", undefined));
const matchExpanded: Ref<boolean | undefined> = ref(props.expanded);
const operator = computed(() => {
  return getBooleanOperator("Match", match.value);
});
const boolGroup = computed(() => {
  return getBoolGroup("Match", match.value);
});
const displayOperator = computed(() => {
  return getDisplayOperator(props.parentOperator, props.clauseIndex);
});

const testFields = computed(() => {
  if (match.value.then && match.value.then.where) return getTestFields(match.value.then.where);
});
const importClauses: Map<string, Match> | undefined = inject("importClauses", undefined);
const checked = ref(false);
const selected = ref(props.parentSelected);
function getFormattedPath(path: any): string {
  let result = "";
  if (path.path) {
    for (let i = 0; i < path.path.length; i++) {
      if (result != "") result = result + " ->";
      result = result + path.path[i].name;
    }
  }
  return result;
}
function getSubrule(index: number): string {
  return index + String.fromCharCode(96 + index);
}

function onClauseCheckChange() {
  if (importClauses) clauseCheck(importClauses, match.value, checked.value);
  selected.value = checked.value;
}

async function expandCohort() {
  if (cohort.value) {
    cohort.value = undefined;
  } else {
    if (queryIri.value && match.value.is) {
      if ((match.value.is.iri && match.value.is.cohort) || match.value.is.resultSet) {
        cohort.value = await QueryService.expandCohort(match.value.is.iri!, DisplayMode.ORIGINAL);
      }
    }
  }
}

// Watch for changes in the prop and update the local copy accordingly
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

.as {
  padding-left: 20rem;
  color: var(--p-amber-700) !important;
  padding-right: 0.2rem;
}

.tree-node-wrapper {
  left: 0;
  position: relative;
}

.tree-node-wrapper::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 0.1rem;
  height: 100%;
  border-left: 0.1rem dotted #999;
}
.tree-node {
  position: relative;
}
.tree-node-line {
  position: relative;
  text-indent: -1rem;
}

.tree-node-line::before {
  content: "";
  position: absolute;
  top: 1.1rem;
  left: 0;
  width: 1rem;
  border-top: 0.1rem dotted #999;
}
.match-description {
  color: var(--p-blue-700);
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
  justify-content: flex-end; /* pushes content to the right */
}
.clause-label {
  padding-left: 1rem;
}
.score {
  padding-left: 2rem;
}
</style>
