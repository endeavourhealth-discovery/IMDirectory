<template>
  <div id="recursive-match-display" class="tree-node-line">
    <span v-if="parentOperator === Bool.rule && clauseIndex > 0">
      <span class="rule">Rule {{ clauseIndex }}</span>
    </span>
    <span v-else-if="!hasBoolGroups(match) && parentOperator && clauseIndex > 0 && parentOperator != Bool.not" :class="parentOperator">{{
      parentOperator
    }}</span>
    <div v-if="match.description" class="match-description">{{ match.description }}</div>
    <span v-if="parentMatch?.union && !from">
      <span class="number">{{ getSubrule(clauseIndex + 1) }}</span>
      <span v-if="parentMatch?.or && parentMatch.or.length > 1" class="or">{{ clauseIndex > 0 ? "or" : "Either" }}</span>
    </span>
    <span v-if="from">
      <span class="field">and if the above</span>
      <span v-if="match.nodeRef">({{ match.nodeRef }})</span>
    </span>
    <span v-if="parentOperator === Bool.not" class="not">Exclude if </span>
    <span v-if="match.instanceOf">
      <span v-if="match.instanceOf[0].qualifier">{{ match.instanceOf[0].qualifier }}</span>
      <IMViewerLink
        v-if="match.instanceOf[0].iri"
        :iri="match.instanceOf[0].iri"
        :label="match.instanceOf[0].name"
        :action="editMode ? 'view' : 'select'"
        @navigateTo="(iri: string) => emit('navigateTo', iri)"
      />
      <span v-if="match.instanceOf.length > 1">
        <div>
          <span v-for="(item, index) in match.instanceOf" :key="index" style="padding-left: 1.5rem">
            <span v-if="index > 0">
              <ul>
                <li class="tight-spacing">
                  <span class="or">or</span>
                  <IMViewerLink
                    v-if="item.iri"
                    :iri="item.iri"
                    :action="editMode ? 'view' : 'select'"
                    :label="item.name"
                    @navigateTo="(iri: string) => emit('navigateTo', iri)"
                  />
                </li>
              </ul>
            </span>
          </span>
        </div>
      </span>
    </span>
    <span class="field">{{ getFormattedPath(match) }}</span>
    <span v-for="operator in operators" :key="operator">
      <span v-if="match[operator]">
        <span v-if="match[operator]!.length > 1 && operator != 'not'" :class="operator">
          <span>{{ getBooleanLabel("match", operator as Bool, clauseIndex, !eclQuery, true, match.union) }}</span>
        </span>
        <div class="tree-node-wrapper">
          <span v-for="(nestedQuery, index) in match[operator]" :key="index">
            <RecursiveMatchDisplay
              :match="nestedQuery"
              :key="`nestedQueryDisplay-${index}`"
              :clause-index="index"
              :property-index="index"
              :parentOperator="operator as Bool"
              :depth="depth + 1"
              :parent-match="match"
              :bracketed="index === match[operator]!.length - 1"
              :edit-mode="editMode"
              :eclQuery="eclQuery"
            />
          </span>
        </div>
      </span>
    </span>
    <span v-if="match.return && match.return.orderBy">{{ match.return.orderBy.description }}</span>
    <span v-if="match.where">
      <RecursiveWhereDisplay
        :where="match.where"
        :depth="depth + (match.nodeRef ? 1 : 0)"
        :property-index="0"
        :key="0"
        :index="0"
        :root="true"
        :expandedSet="expandSet"
        :inline="true"
        :then="then"
        :eclQuery="eclQuery"
        :editMode="editMode"
      />
    </span>

    <span v-if="match.return && match.then">
      <span class="field">(as</span>
      <span class="as">{{ match.return?.as }})</span>
    </span>
    <span v-if="match.then">
      <RecursiveMatchDisplay
        :match="match.then"
        :clause-index="0"
        :property-index="0"
        :parent-operator="Bool.and"
        :depth="depth + 1"
        :parent-match="match"
        :edit-mode="editMode"
        :from="match"
        :eclQuery="eclQuery"
      />
    </span>
    <span v-if="match.return && !match.then">
      <span class="field">(as</span>
      <span class="as">{{ match.return?.as }})</span>
    </span>
    <div v-if="parentOperator === Bool.rule && clauseIndex > 0">
      <span class="field">if true</span>
      <span :class="match.ifTrue">{{ match.ifTrue }},</span>
      <span class="field">if false</span>
      <span :class="match.ifFalse">{{ match.ifFalse }}<br /></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Match, Bool } from "@/interfaces/AutoGen";
import { Ref, ref, computed } from "vue";
import RecursiveWhereDisplay from "./RecursiveWhereDisplay.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { getBooleanLabel, hasBoolGroups } from "@/composables/buildQuery";

interface Props {
  isVariable?: boolean;
  depth: number;
  clauseIndex: number;
  expanded?: boolean;
  canExpand?: boolean;
  bracketed?: boolean;
  editMode?: boolean;
  from?: Match;
  eclQuery?: boolean;
  parentOperator?: Bool;
}

const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const parentMatch = defineModel<Match>("parentMatch", { default: {} });
const emit = defineEmits<{
  navigateTo: [payload: string];
}>();
const editMenu = (match.value.and || match.value.or) && !match.value.instanceOf ? "booleanEditor" : "matchEditor";
const expandSet: Ref<boolean> = ref(false);
const operators = ["and", "or", "not"] as const;
const then: Ref<boolean> = computed(() => {
  return !!props.from;
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

.then {
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
  /* no special styling needed */
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
