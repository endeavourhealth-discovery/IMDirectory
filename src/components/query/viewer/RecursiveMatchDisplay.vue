<template>
  <div id="recursive-match-display">
    <div class="tree-node-line">
      <span v-if="match.match"></span>
      <span v-if="match.rule">
        <span class="rule">Rule {{ clauseIndex }}</span>
      </span>

      <span v-if="parentMatch?.union" class="number">{{ clauseIndex + 1 }}</span>
      <ClauseEditorMenus v-if="editMode" :editor="editMenu" v-model:match="match" v-model:parentMatch="parentMatch" />
      <span v-if="from">
        <span class="field">Then include if</span>
      </span>

      <span v-if="match.exclude">
        <span v-if="parentMatch.bool && parentMatch.bool === 'and'">
          <span class="not">(exclude if) </span>
        </span>
        <span v-else class="not">or exclude if </span>
      </span>

      <span v-if="match.instanceOf">
        <span v-if="match.instanceOf[0].qualifier">{{ match.instanceOf[0].qualifier }}</span>
        <IMViewerLink
          v-if="match.instanceOf[0]['@id']"
          :iri="match.instanceOf[0]['@id']"
          :label="match.instanceOf[0].name"
          @navigateTo="(iri: string) => emit('navigateTo', iri)"
        />
        <span v-if="match.instanceOf.length > 1">
          <div>
            <span v-for="(item, index) in match.instanceOf" :key="index" style="padding-left: 1.5rem">
              <span v-if="index > 0">
                <ul>
                  <li class="tight-spacing">
                    <span class="or">or</span>
                    <IMViewerLink v-if="item['@id']" :iri="item['@id']" :label="item.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
                  </li>
                </ul>
              </span>
            </span>
          </div>
        </span>
      </span>
      <span v-if="isArrayHasLength(match.match)">
        <span :class="match.bool">{{ getOperatorText(match?.bool) }}</span>
        <span v-if="clauseIndex > -1">(</span>
        <div class="tree-node-wrapper">
          <span v-for="(nestedQuery, index) in match.match" :key="`nestedQuery-${index}`">
            <RecursiveMatchDisplay
              :match="nestedQuery"
              :key="`nestedQueryDisplay-${index}`"
              :clause-index="index"
              :property-index="index"
              :parent-operator="match.bool"
              :depth="depth + 1"
              :parent-match="match"
              :bracketed="index === match.match!.length - 1"
              :edit-mode="editMode"
              :eclQuery="eclQuery"
            />
          </span>
        </div>
      </span>
      <span v-if="match.orderBy">{{ match.orderBy.description }}</span>
      <span v-if="match.path">
        <span class="field">{{ getFormattedPath(match) }}</span>
      </span>

      <span v-if="isArrayHasLength(match.where)">
        <RecursiveWhereDisplay
          v-for="(nestedWhere, index) in match.where"
          :where="nestedWhere"
          :depth="depth + (match.nodeRef ? 1 : 0)"
          :property-index="index"
          :key="index"
          :index="index"
          :operator="match.bool"
          :expandedSet="expandSet"
          :inline="!nestedWhere.where"
          :eclQuery="eclQuery"
        />
      </span>
      <span v-if="match.union">
        <span class="field">Select one of the following</span>
      </span>

      <span v-if="match.return && !match.then">
        <span class="field">(as</span>
        <span class="as">{{ match.return?.as }})</span>
      </span>
      <span v-if="match.then">
        <RecursiveMatchDisplay
          :match="match.then"
          :clause-index="0"
          :property-index="0"
          :parent-operator="match.bool"
          :depth="depth + 1"
          :parent-match="match"
          :edit-mode="editMode"
          :from="match"
          :eclQuery="eclQuery"
        />
      </span>
      <div v-if="match.rule">
        <span class="field">if true</span>
        <span :class="match.ifTrue">{{ match.ifTrue }},</span>
        <span class="field">if false</span>
        <span :class="match.ifFalse">{{ match.ifFalse }}<br /></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { Match, Return, Bool } from "@/interfaces/AutoGen";
import { computed, Ref, ref, watch } from "vue";
import RecursiveWhereDisplay from "./RecursiveWhereDisplay.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import ClauseEditorMenus from "@/components/imquery/ClauseEditorMenus.vue";
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
}

const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const parentMatch = defineModel<Match>("parentMatch", { default: {} });
const emit = defineEmits({
  navigateTo: (_payload: string) => true
});
const editMenu = match.value.match && !match.value.instanceOf ? "booleanEditor" : "matchEditor";
const expandSet: Ref<boolean> = ref(false);

function toggle() {
  expandSet.value = !expandSet.value;
}
function getOperatorText(operator: Bool | undefined): string {
  if (operator === "or") {
    return "At least one of the following";
  } else if (operator === "and") {
    return "All of the following";
  } else {
    return " ";
  }
}

function getReturnProperties(ret: Return): string {
  return ret.property
    ? ret.property
        .map(p => p.name?.replace(/\s*\(.*?\)/, "")) // Remove bracketed term
        .join(", ") // Join names with a comma and space
    : "";
}
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

function indentationStyle(depth: number) {
  return {
    paddingRight: depth * 2 + "rem"
  };
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
  fint-style: italic;
  padding-right: 1.2rem;
}

.as {
  color: var(--p-amber-700) !important;
}
.node-ref {
  color: var(--p-amber-700) !important;
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
