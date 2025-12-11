<template>
  <div id="recursive-match-display" :class="'tree-node-line'">
    <span v-if="parentOperator === Bool.rule">
      <span class="rule">Rule {{ clauseIndex + 1 }}</span>
    </span>
    <span v-else-if="!hasBoolGroups(match) && parentOperator && clauseIndex > 0 && parentOperator != Bool.not" :class="parentOperator">{{
      parentOperator
    }}</span>
    <span v-if="parentOperator === Bool.not" class="not">Exclude if </span>
    <span v-if="subPredicate" class="field">{{ subPredicate }}</span>
    <span v-if="match.nodeRef">test:</span>
    <span v-else-if="match.return && match.keepAs">from</span>

    <span v-if="match.description">
      <Button text :icon="!matchExpanded ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" @click="matchExpanded = !matchExpanded"></Button>
      <span class="match-description">{{ match.description }}</span>
    </span>
    <template v-if="matchExpanded">
      <component :is="match.description ? 'div' : 'span'">
        <template v-if="match.is">
          <template v-for="(item, index) in match.is" :key="index" style="padding-left: 1.5rem">
            <span v-if="index > 0" class="or">or</span>
            <span v-else class="field">in</span>
            <Button text :icon="!cohorts.has(index) ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" @click="expandCohort(index)"></Button>
            <IMViewerLink
              v-if="item.iri"
              :iri="item.iri"
              :action="editMode ? 'view' : 'select'"
              :label="item.name"
              @navigateTo="(iri: string) => emit('navigateTo', iri)"
            />
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
        <template v-if="parentMatch?.union">
          <span class="number">{{ getSubrule(clauseIndex + 1) }}</span>
          <span v-if="parentMatch?.or && parentMatch.or.length > 1" class="or">{{ clauseIndex > 0 ? "or" : "Either" }}</span>
        </template>
        <div v-if="match.orderBy" class="field">
          {{ match.orderBy.description }}>
          <span class="field">{{ getFormattedPath(match) }}</span>
        </div>
        <template v-for="operator in operators" :key="operator">
          <template v-if="match[operator]">
            <template v-if="match[operator]!.length > 1 && operator != 'not'" :class="operator">
              <span>
                {{ getBooleanLabel("match", operator as Bool, parentOperator === Bool.rule ? 0 : clauseIndex, !eclQuery, true, match.union, parentOperator) }}
              </span>
            </template>
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
        <div v-if="match.where">
          <span class="field">where</span>
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
          />
        </div>
      </component>
    </template>
    <span v-if="match.keepAs">
      <span class="as"> (as {{ match.keepAs }})</span>
    </span>

    <div v-if="parentOperator === Bool.rule">
      <span class="field">if true</span>
      <span :class="match.ifTrue">{{ match.ifTrue }},</span>
      <span class="field">if false</span>
      <span :class="match.ifFalse">{{ match.ifFalse }}<br /></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Match, Bool, DisplayMode } from "@/interfaces/AutoGen";
import { Ref, ref, computed, inject } from "vue";
import RecursiveWhereDisplay from "./RecursiveWhereDisplay.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { QueryService } from "@/services";
import { getBooleanLabel, hasBoolGroups } from "@/helpers/buildQuery";
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
}

const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const parentMatch = defineModel<Match>("parentMatch", { default: {} });
const emit = defineEmits<{
  navigateTo: [payload: string];
}>();
const expandSet: Ref<boolean> = ref(false);
const operators = ["rule", "and", "or", "not"] as const;
const cohorts: Ref<Map<number, Match>> = ref(new Map<number, Match>());
const matchExpanded: Ref<boolean> = ref(!match.value.description);
const queryIri: Ref<string | undefined> = ref(inject("queryIri"));
const displayMode = inject<Ref<DisplayMode>>("displayMode");
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
  if (queryIri.value) {
    const newMap = new Map(cohorts.value);
    if (newMap.has(index)) newMap.delete(index);
    else newMap.set(index, await QueryService.expandCohort(queryIri.value, match.value.is![index]!.iri!, DisplayMode.ORIGINAL));
    cohorts.value = newMap;
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

.from {
  padding-right: 0.2rem;
}
.field {
  padding-right: 0.2rem;
}
.rule {
  font-weight: bold;
  padding-right: 1rem;
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
  padding-left: 2.5rem;
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
