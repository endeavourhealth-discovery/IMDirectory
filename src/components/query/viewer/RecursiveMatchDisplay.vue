<template>
  <template v-if="boolGroup && operator">
    <BooleanMatchDisplay
      :match="match"
      :parentMatch="parentMatch"
      :boolGroup="boolGroup"
      :operator="operator"
      :parentOperator="parentOperator"
      :depth="depth"
      :clauseIndex="clauseIndex"
    />
  </template>
  <template v-else>
    <span v-if="parentOperator === Bool.rule && clauseIndex > 0">
      <span class="rule">Rule {{ clauseIndex }}</span>
    </span>
    <span v-else-if="parentOperator && clauseIndex > 0 && parentOperator != Bool.union && parentOperator != Bool.step" :class="parentOperator">{{
      parentOperator
    }}</span>
    <template v-if="parentMatch?.union">
      <span class="number">{{ getSubrule(clauseIndex + 1) }}</span>
    </template>

    <span v-if="match.notExists" class="not">Exclude if </span>
    <template v-if="match.nodeRef">
      <span class="node-ref">then with the {{ keepFields }} of the above</span>
    </template>
    <template v-else-if="parentMatch && parentMatch.step && clauseIndex > 0">
      <span class="node-ref">then check:</span>
    </template>
    <template v-if="match.is">
      <template v-for="(item, index) in match.is" :key="index" style="padding-left: 1.5rem">
        <Button v-if="!eclQuery" text :icon="!cohorts.has(index) ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" @click="expandCohort(index)" />
        <template v-if="cohorts.has(index) || item.match">
          <span v-if="item.descendantsOrSelfOf" class="field">subtypes of </span>
          <RecursiveMatchDisplay
            :match="cohorts.get(index) ? cohorts.get(index) : item.match"
            :clause-index="0"
            :parent-operator="parentOperator"
            :depth="depth + 1"
            :parent-match="match"
            :eclQuery="eclQuery"
          />
        </template>
        <template v-else>
          <span v-if="index > 0" class="or">or</span>
          <span v-else class="field">in</span>
          <IMViewerLink
            v-if="item.iri"
            :iri="item.iri"
            :action="editMode ? 'view' : 'select'"
            :label="item.name"
            @navigateTo="(iri: string) => emit('navigateTo', iri)"
          />
        </template>
      </template>
    </template>
    <span v-if="!matchExpanded && match.description" class="match-description">{{ match.description }}</span>
    <template v-if="matchExpanded">
      <span v-if="match.orderBy" class="field">{{ match.orderBy.description }}</span>
      <span v-if="match.path" class="field">{{ getFormattedPath(match) }}</span>
      <template v-if="match.where">
        <span class="where">where</span>
        <RecursiveWhereDisplay
          :where="match.where"
          :depth="depth + 1"
          :key="0"
          :index="0"
          :root="true"
          :expandedSet="expandSet"
          :inline="!match.where.and && !match.where.or"
          :eclQuery="eclQuery"
          :editMode="editMode"
          :step="step"
        />
      </template>
      <span v-if="match.linkedTarget">
        <span class="as">save</span>
        <span class="node-ref">as {{ match.node }}</span>
      </span>
      <div v-if="parentOperator === Bool.rule && clauseIndex > 0" class="tree-node-line" style="margin-left: 1.5rem">
        <span class="field">if true</span>
        <span :class="match.ifTrue">{{ match.ifTrue }},</span>
        <span class="field">if false</span>
        <span :class="match.ifFalse">{{ match.ifFalse }}<br /></span>
      </div>
    </template>
  </template>
</template>

<script setup lang="ts">
import { Match, Bool, DisplayMode } from "@/interfaces/AutoGen";
import { Ref, ref, computed, inject } from "vue";
import RecursiveWhereDisplay from "./RecursiveWhereDisplay.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { QueryService } from "@/services";
import { getBooleanOperator, getDisplayOperator, getBoolGroup, getResults } from "@/helpers/buildQuery";
import BooleanMatchDisplay from "@/components/query/viewer/BooleanMatchDisplay.vue";

interface Props {
  isVariable?: boolean;
  depth: number;
  clauseIndex: number;
  expanded?: boolean;
  canExpand?: boolean;
  editMode?: boolean;
  eclQuery?: boolean;
  parentOperator?: Bool;
  step?: boolean;
}

const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const parentMatch = defineModel<Match>("parentMatch", { default: {} });
const emit = defineEmits<{
  navigateTo: [payload: string];
}>();
const expandSet: Ref<boolean> = ref(false);
const cohorts: Ref<Map<number, Match>> = ref(new Map<number, Match>());
const queryIri: Ref<string | undefined> = ref(inject("queryIri"));
const matchExpanded: Ref<boolean> = ref(true);
const displayMode = inject<Ref<DisplayMode>>("displayMode");
const operator = computed(() => {
  return getBooleanOperator("Match", match.value);
});
const boolGroup = computed(() => {
  return getBoolGroup("Match", match.value);
});
const displayOperator = computed(() => {
  return getDisplayOperator(props.parentOperator, props.clauseIndex);
});
const indentStyle = computed(() => {
  if (props.parentOperator === Bool.step && props.clauseIndex === 0) {
    return {
      paddingLeft: "1rem"
    };
  }

  return {
    paddingLeft: "2.5rem"
  };
});
const keepFields = computed(() => {
  if (match.value.nodeRef) return getResults(match.value.nodeRef, parentMatch.value);
});
const step2 = computed(() => {
  if (props.parentOperator === Bool.step && props.clauseIndex > 0) {
    return true;
  }
  return false;
});

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

async function expandCohort(index: number) {
  if (cohorts.value.has(index)) {
    cohorts.value.delete(index);
  } else {
    if (queryIri.value) {
      if ((match.value.is![index]!.iri && match.value.is![index]!.cohort) || match.value.is![index].resultSet) {
        cohorts.value.set(index, await QueryService.expandCohort(queryIri.value, match.value.is![index]!.iri!, DisplayMode.ORIGINAL));
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
.linked-match {
  color: var(--p-amber-700) !important;
  padding-left: 0.5rem;
  padding-right: 0.2rem;
  cursor: pointer !important;
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
</style>
