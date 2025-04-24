<template>
  <div id="recursive-match-edit" :style="{ paddingLeft: depth + 'rem' }" class="flex items-start">
    <AddFeature v-if="addFeature" v-model:addFeature="addFeature" :base-type="parentMatch.typeOf!" @onAddMatch="addNewMatch" @on-add-cohort="addInstanceOf" />
    <EditMatchDialog v-model:show-dialog="editFeature" :match="selectedMatch" :query-base-type-iri="match.typeOf!['@id']" @save-changes="onSaveChanges" />
    <span v-if="depth > 0 && !match.rule && !match.match" class="mr-2 mt-1">•</span>
    <span v-if="match.rule">
      <span class="rule">Rule {{ clauseIndex + 1 }}</span>
    </span>
    <span class="paragraph">
      <span v-if="parentMatch && parentMatch.union" class="number">{{ clauseIndex + 1 }}</span>
      <span class="text">
        <span v-if="match.nodeRef">
          <span class="field">From</span>
          <span class="node-ref">{{ match.nodeRef }}</span>
          <span class="field">test that</span>
        </span>
        <span v-if="match.exclude">
          <span v-if="parentMatch && parentMatch.bool && parentMatch.bool === 'and'">
            <span class="not">(exclude if) </span>
          </span>
          <span v-else class="not">or exclude if </span>
        </span>
        <span v-if="match.union">
          <span class="field">Select one of the following</span>
          <span v-if="match.return">
            <span>(as</span>
            <span class="node">{{ match.return?.as }})</span>
          </span>
        </span>
        <span v-if="match.test">
          <span v-if="match.nodeRef">
            <span class="field">From</span>
            <span class="node">{{ match.nodeRef }},</span>
            <span class="field">test that the</span>
          </span>
          <span v-else-if="!match.exclude" class="field">Test that:</span>
        </span>
        <span v-if="match.orderBy">{{ match.orderBy.description }}</span>
        <span v-if="match.path" class="field" v-html="getFormattedPath(match.path)"></span>
        <span v-if="match.instanceOf">
          <span v-for="(instanceOf, index) in match.instanceOf" :key="`instanceOf-${index}`">
            <span v-if="instanceOf.qualifier" v-html="instanceOf.qualifier"></span>
            <IMViewerLink v-if="instanceOf['@id']" :iri="instanceOf['@id']" :label="instanceOf.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
          </span>
        </span>
        <span v-if="!match.match && !match.where" class="relative-inline-block">
          <Button
            class="p-button-square p-button-outlined"
            severity="info"
            v-tooltip="'edit or add feature or manage the group'"
            @click="toggleEditMenu"
            ref="editMenuTrigger"
            :style="{ padding: '2px 6px', lineHeight: '2' }"
          >
            ...
          </Button>
          <Menu ref="editMenu" :model="editMenuItems" :popup="true" />
        </span>
        <span v-if="isArrayHasLength(match.match)">
          <div>
            <span v-if="depth > 0" class="ml-4 mr-2 mt-1">•</span>
            <span>{{ getBooleanOperator(match.bool) }}</span>
            <span v-if="depth > 0">(</span>
            <span class="relative-inline-block">
              <Button
                class="p-button-rounded p-button-outlined"
                severity="info"
                v-tooltip="'Click to manage boolean logic or add to group'"
                @click="toggleBooleanMenu"
                ref="booleanMenuTrigger"
                :style="{ padding: '2px 6px', lineHeight: '2' }"
              >
                ...
              </Button>
              <Menu ref="booleanMenu" :model="booleanMenuItems" :popup="true" />
            </span>
          </div>
          <span v-for="(nestedQuery, index) in match.match" :key="`nestedQuery-${index}`">
            <RecursiveMatchEditor
              :match="nestedQuery"
              :key="`nestedQueryDisplay-${index}`"
              :clause-index="index"
              :parent-operator="match.bool"
              :depth="depth + 1"
              :parent-match="match"
              :bracketed="index === match.match!.length - 1"
            />
          </span>

          <span v-if="depth > 0">)</span>
        </span>
        <span v-if="isArrayHasLength(match.where)">
          <RecursiveWhereEditor
            v-for="(nestedWhere, index) in match.where"
            :where="nestedWhere"
            :depth="depth + (match.nodeRef ? 1 : 0)"
            :property-index="index"
            :key="index"
            :index="index"
            :operator="match.bool"
            :expandedSet="expandSet"
            :inline="!nestedWhere.where"
          />
        </span>
        <span v-if="match.where" class="relative-inline-block">
          <Button
            class="p-button-square p-button-outlined"
            severity="info"
            @click="toggleEditMenu"
            v-tooltip="'Click to edit or add feature or manage the group'"
            ref="editMenuTrigger"
            :style="{ padding: '2px 6px', lineHeight: '2' }"
          >
            ...
          </Button>
          <Menu ref="editMenu" :model="editMenuItems" :popup="true" />
        </span>
        <span v-if="match.return">
          <span v-if="match.return.as">
            <div class="ml-4">
              <span class="field">Label as</span>
              <span class="node-ref">{{ match.return.as }}</span>
            </div>
          </span>
        </span>
      </span>
    </span>
    <div v-if="match.rule">
      <span class="field">if true</span>
      <span :class="match.ifTrue">{{ match.ifTrue }},</span>
      <span class="field">if false</span>
      <span :class="match.ifFalse">{{ match.ifFalse }}<br /></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { Bool, DisplayMode, Match, Path, Query, Return } from "@/interfaces/AutoGen";
import { computed, Ref, ref } from "vue";
import RecursiveWhereEditor from "./RecursiveWhereEditor.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import AddFeature from "@/components/imquery/AddFeature.vue";
import { QueryService } from "@/services";
import EditMatchDialog from "@/components/imquery/EditMatchDialog.vue";

interface Props {
  isVariable?: boolean;
  depth: number;
  clauseIndex: number;
  propertyIndex?: number;
  expanded?: boolean;
  canExpand?: boolean;
}

const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const parentMatch = defineModel<Match>("parentMatch", { default: {} });
const emit = defineEmits<{
  navigateTo: [payload: string];
}>();
const expandSet: Ref<boolean> = ref(false);
const booleanMenu = ref();
const booleanMenuTrigger = ref();
const editMenu = ref();
const editMenuTrigger = ref();
const addFeature: Ref<boolean> = ref(false);
const editFeature: Ref<boolean> = ref(false);
const selectedMatch: Ref<Match> = ref({});
function toggle() {
  expandSet.value = !expandSet.value;
}
function getBooleanOperator(operator: Bool | undefined) {
  return operator === "and" ? "and" : "either or";
  /*
  if (!operator) return "Must have all of the following";
  else if (operator === "and") return "Must have all of the following:";
  else if (operator === "or") return "Must have at least one  of the following:";
  return "";

   */
}

function getReturnProperties(ret: Return): string {
  return ret.property
    ? ret.property
        .map(p => p.name?.replace(/\s*\(.*?\)/, "")) // Remove bracketed term
        .join(", ") // Join names with a comma and space
    : "";
}

function indentationStyle(depth: number) {
  return {
    paddingRight: depth * 2 + "rem"
  };
}

function getFormattedPath(path: Path): string {
  let formatted = "";
  if (path.qualifier) formatted = "<span>" + path.qualifier + "</span>";
  if (path.name) formatted = formatted + '<span style="color : rgb(0,102,102);">' + path.name + "</span>";
  return formatted;
}
const booleanMenuItems = computed(() => {
  const items = [];
  if (match.value.bool === "or") {
    items.push({
      label: "Must have all of the following (and)",
      command: () => changeBooleanOperator()
    });
  }

  if (match.value.bool === "and") {
    items.push({
      label: "Must have at least one of the following (or)",
      command: () => changeBooleanOperator()
    });
  }
  if (!match.value.match) {
    items.push({
      label: `Create nested ${match.value.bool === "and" ? "or" : "and"}`,
      command: () => createNestedMatch()
    });
  }

  items.push({
    label: "Add feature to this group",
    command: () => addSubMatch()
  });

  return items;
});
const toggleEditMenu = (event: MouseEvent) => {
  editMenu.value?.toggle(event);
};

function createNewGroup() {}

function unGroup() {}

function moveMatch() {}

const editMenuItems = computed(() => {
  const items = [];
  items.push({
    label: "Add feature",
    command: () => addMatch()
  });
  items.push({
    label: "Edit this feature",
    command: () => editMatch()
  });
  items.push({
    label: "Delete this feature",
    command: () => deleteMatch()
  });
  if (parentMatch.value && parentMatch.value.bool) {
    items.push({
      label: `Add nested ${parentMatch.value.bool === "and" ? "'or'" : "'and'"}`,
      command: () => createNewGroup()
    });
    items.push({
      label: `Ungroup this feature`,
      command: () => unGroup()
    });
  } else {
    items.push({
      label: `Create nested group "}`,
      command: () => createNewGroup()
    });
  }
  items.push({
    label: `Move this feature`,
    command: () => moveMatch()
  });

  return items;
});
const toggleBooleanMenu = (event: MouseEvent) => {
  booleanMenu.value?.toggle(event);
};
function changeBooleanOperator() {
  match.value.bool = match.value.bool === Bool.and ? Bool.or : Bool.and;
  if (parentMatch.value && parentMatch.value.bool) {
    if (parentMatch.value.bool === match.value.bool) {
      if (parentMatch.value && parentMatch.value.match) {
        const childIndex = parentMatch.value.match.findIndex(m => m === match.value);
        if (childIndex !== -1) {
          parentMatch.value.match.splice(childIndex, 1, ...(match.value.match ?? []));
          for (let i = 0; i < parentMatch.value.match.length; i++) {
            const subMatch = parentMatch.value.match[i];
            if (subMatch.match && subMatch.bool && subMatch.bool === parentMatch.value.bool) {
              parentMatch.value.match.splice(i, 1, ...(subMatch.match ?? []));
              i--;
            }
          }
        }
      }
    }
  }
}
function editMatch() {}
function deleteMatch() {}
function addMatch() {
  addFeature.value = true;
}
async function addNewMatch(newMatch: Match) {
  addFeature.value = false;
  const describedMatch = await QueryService.getQueryDisplayFromQuery(newMatch as Query, DisplayMode.ORIGINAL);
  if (!parentMatch.value.match) parentMatch.value.match = [];
  parentMatch.value.match.push(describedMatch);
  if (parentMatch.value.match.length > 1 && !parentMatch.value.bool) parentMatch.value.bool = Bool.and;
  selectedMatch.value = describedMatch;
  editFeature.value = true;
}
async function addInstanceOf(newMatch: Match) {
  addFeature.value = false;
  if (!parentMatch.value.match) parentMatch.value.match = [];
  const describedMatch = await QueryService.getQueryDisplayFromQuery(newMatch as Query, DisplayMode.ORIGINAL);
  parentMatch.value.match.push(describedMatch);
  if (parentMatch.value.match.length > 1 && !parentMatch.value.bool) parentMatch.value.bool = Bool.and;
}

function addSubMatch() {}
function createNestedMatch() {
  const nestedMatch = {} as Match;
  nestedMatch.bool = match.value.bool;
  nestedMatch.match = match.value.match;
  match.value.match = [nestedMatch];
  match.value.bool = match.value.bool === Bool.and ? Bool.or : Bool.and;
}
async function onSaveChanges(editMatch: Match) {
  match.value = await QueryService.getQueryDisplayFromQuery(editMatch, DisplayMode.ORIGINAL);
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
.relative-inline-block {
  padding-left: 2rem;
}

.field {
  padding-right: 0.2rem;
}
.rule {
  font-weight: bold;
  padding-right: 1rem;
}

.node {
  padding-left: 0.5rem;
  font-style: italic;
  padding-right: 0.3rem;
}
#recursive-match-display:deep(.or) {
  color: var(--p-blue-500);
  padding-right: 1.2rem;
}

.node-ref {
  color: var(--p-amber-700) !important;
  padding-right: 0.2rem;
  cursor: pointer !important;
}

#recursive-match-display:deep(.either) {
  color: var(--p-blue-500);
  padding-right: 0.3rem;
}

#recursive-match-display:deep(.and) {
  color: var(--p-orange-500);
  padding-right: 0.3rem;
}
#recursive-match-display:deep(.not) {
  color: var(--p-red-500) !important;
  padding-right: 0.2rem;
}
#recursive-match-display:deep(.variable) {
  color: var(--p-orange-500) !important;
}

.edit-button {
  color: var(--p-purple-500) !important;
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
