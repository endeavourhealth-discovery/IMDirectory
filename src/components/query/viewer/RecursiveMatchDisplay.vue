<template>
  <component
    id="recursive-match-display"
    :is="parentOperator === Bool.step && clauseIndex === 0 ? 'span' : 'div'"
    :class="parentOperator != Bool.step ? 'tree-node-line' : ''"
    :style="indentStyle"
  >
    <span v-if="parentOperator === Bool.rule && clauseIndex > 0">
      <span class="rule">Rule {{ clauseIndex }}</span>
    </span>
    <span v-else-if="parentOperator && clauseIndex > 0 && parentOperator != Bool.union && parentOperator != Bool.step" :class="parentOperator">{{
      parentOperator
    }}</span>
    <template v-if="parentMatch?.union">
      <span class="number">{{ getSubrule(clauseIndex + 1) }}</span>
    </template>
    <Button
      v-if="hasExpandableGroups(match) && depth > 0"
      text
      :icon="!matchExpanded ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'"
      @click="matchExpanded = !matchExpanded"
    />
    <span v-if="match.notExists" class="not">Exclude if </span>
    <span v-if="subPredicate" class="field">{{ subPredicate }}</span>
    <span v-if="match.nodeRef">
      <span class="field">from</span>
      <span class="node-ref">{{ match.nodeRef }}</span>
    </span>
    <template v-if="match.is">
      <template v-for="(item, index) in match.is" :key="index" style="padding-left: 1.5rem">
        <Button v-if="!eclQuery" text :icon="!cohorts.has(index) ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" @click="expandCohort(index)" />
        <template v-if="cohorts.has(index) || item.match">
          <span v-if="item.descendantsOrSelfOf" class="field">subtypes of </span>
          <RecursiveMatchDisplay
            :match="cohorts.get(index) ? cohorts.get(index) : item.match"
            :clause-index="0"
            :property-index="0"
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
          <span v-else-if="item.nodeRef">{{ item.nodeRef }}</span>
          <RecursiveMatchDisplay
            v-if="cohorts.has(index)"
            :match="cohorts.get(index)"
            :clause-index="0"
            :property-index="0"
            :parent-operator="parentOperator"
            :depth="depth + 1"
            :parent-match="match"
            :eclQuery="eclQuery"
          />
        </template>
      </template>
    </template>
    <span v-if="!matchExpanded && match.description" class="match-description">{{ match.description }}</span>
    <template v-if="matchExpanded">
      <span v-if="match.orderBy" class="field">{{ match.orderBy.description }}</span>
      <span v-if="match.path" class="field">{{ getFormattedPath(match) }}</span>
      <template v-for="operator in operators" :key="operator">
        <template v-if="match[operator]">
          <div v-if="match[operator]!.length > 1" :class="operator">
            {{ getBooleanLabel("match", operator as Bool, clauseIndex, !eclQuery, true, parentOperator) }}
          </div>
          <div :class="match[operator].length > 1 ? 'tree-node-wrapper' : ''">
            <template v-for="(nestedQuery, index) in match[operator]" :key="`nestedQueryDisplay-${index}`">
              <RecursiveMatchDisplay
                :match="nestedQuery"
                :clause-index="index"
                :property-index="index"
                :parentOperator="operator as Bool"
                :depth="depth + 1"
                :parent-match="match"
                :bracketed="index === match[operator]!.length - 1"
                :edit-mode="editMode"
                :eclQuery="eclQuery"
                :singleMatch="match[operator]!.length === 1"
              />
            </template>
          </div>
        </template>
      </template>
      <template v-if="match.step">
        <template v-for="(nestedQuery, index) in match.step" :key="`nestedQueryDisplay-${index}`">
          <RecursiveMatchDisplay
            :match="nestedQuery"
            :clause-index="index"
            :property-index="index"
            :parentOperator="Bool.step"
            :depth="depth + 1"
            :parent-match="match"
            :edit-mode="editMode"
            :eclQuery="eclQuery"
            :step="true"
          />
        </template>
      </template>
      <template v-if="match.where">
        <span v-if="match.nodeRef && parentOperator === Bool.step">test that:</span>
        <span v-else class="where">where</span>
        <RecursiveWhereDisplay
          :where="match.where"
          :depth="depth + (match.nodeRef ? 1 : 0)"
          :key="0"
          :index="0"
          :root="true"
          :expandedSet="expandSet"
          :inline="true"
          :eclQuery="eclQuery"
          :editMode="editMode"
          :step="step"
        />
      </template>
      <span v-if="match.node" class="as"> as ({{ match.node }})</span>
      <div v-if="parentOperator === Bool.rule && clauseIndex > 0">
        <span class="field">if true</span>
        <span :class="match.ifTrue">{{ match.ifTrue }},</span>
        <span class="field">if false</span>
        <span :class="match.ifFalse">{{ match.ifFalse }}<br /></span>
      </div>
    </template>
  </component>
</template>

<script setup lang="ts">
import { Match, Bool, DisplayMode } from "@/interfaces/AutoGen";
import { Ref, ref, computed, inject } from "vue";
import RecursiveWhereDisplay from "./RecursiveWhereDisplay.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { QueryService } from "@/services";
import { getBooleanLabel, hasBoolGroups, hasExpandableGroups } from "@/helpers/buildQuery";
import MatchDescription from "@/components/query/viewer/MatchDescription.vue";

interface Props {
  isVariable?: boolean;
  depth: number;
  clauseIndex: number;
  expanded?: boolean;
  canExpand?: boolean;
  bracketed?: boolean;
  editMode?: boolean;
  subPredicate?: string;
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
const operators = ["rule", "and", "or", "union"] as const;
const cohorts: Ref<Map<number, Match>> = ref(new Map<number, Match>());
const queryIri: Ref<string | undefined> = ref(inject("queryIri"));
const matchExpanded: Ref<boolean> = ref(true);
const displayMode = inject<Ref<DisplayMode>>("displayMode");
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
      if (match.value.is![index]!.iri && match.value.is![index]!.cohort) {
        cohorts.value.set(index, await QueryService.expandCohort(queryIri.value, match.value.is![index]!.iri!, DisplayMode.ORIGINAL));
      }
    }
  }
}

// Watch for changes in the prop and update the local copy accordingly
</script>

<style scoped>
.numbered {
  list-style: none; /* Remove default numbering */
  margin-left: 2em; /* Creates space for manual numbering */
  text-indent: -2em; /* Pulls the number back to the left */
}
.number {
  font-weight: bold;
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

.tree-node-wrapper {
  left: 0;
  position: relative;
}

.tree-node-wrapper::before {
  content: "";
  position: absolute;
  top: 0rem;
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
  padding-right: 10rem;
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

#recursive-match-display:deep(.either) {
  color: var(--p-blue-500);
  padding-right: 0.3rem;
}

#recursive-match-display:deep(.and) {
  color: #707824;
  font-style: italic;
  padding-right: 0.3rem;
}
#recursive-match-display:deep(.not) {
  color: var(--p-red-500) !important;
  padding-right: 0.2rem;
}
#recursive-match-display:deep(.variable) {
  color: var(--p-orange-500) !important;
}

#recursive-match-display:deep(.SELECT) {
  color: var(--p-green-500);
  padding-right: 1.2rem;
}

#recursive-match-display:deep(.REJECT) {
  color: var(--p-red-500);
  padding-right: 1.2rem;
}

#recursive-match-display:deep(.NEXT) {
  color: var(--p-purple-500);
  padding-right: 1.2rem;
}
</style>
