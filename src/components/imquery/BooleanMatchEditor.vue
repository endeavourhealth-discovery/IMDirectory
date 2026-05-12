<template>
  <template v-if="showEditor && editMatch">
    <MatchEditor
      v-if="showEditor"
      v-model:showEditor="showEditor"
      :baseType="baseType"
      :clauseIndex="index"
      :depth="depth"
      :editCohort="editMatch && !!editMatch.is"
      :match="editMatch"
      :parentOperator="parentOperator"
      @cancel="cancelEditMatch"
      @deleteMatch="onDeleteMatchList"
      @saveChanges="saveEditMatch"
      @add-test="addTest"
      @add-linked="addLinked"
    />
  </template>
  <template v-else>
    <div v-if="boolGroup" class="match-container">
      <div class="match-clause-inner">
        <div v-if="canCheck" class="group-checkbox">
          <Checkbox
            v-model="subgroupCheck"
            v-tooltip="'Select to build boolean subgroup'"
            :inputId="'group' + index"
            binary
            data-testid="group-checkbox"
            name="Group"
            @update:modelValue="onCheckGroupChange"
          />
        </div>
        <BooleanEditor
          v-model:clause="match"
          v-model:group="group"
          v-model:parent="parent"
          :clauseType="'Match'"
          :index="index"
          :operator="operator"
          :parentOperator="parentOperator as Bool"
          :parentType="'Match'"
          :rootBool="rootBool"
        />
      </div>
      <div>
        <div v-if="parentOperator === Bool.rule && index > 0" class="rule">Rule {{ index }}</div>
        <div v-for="(item, subIndex) in boolGroup" :key="item.uuid">
          <BooleanMatchEditor
            v-model:match="boolGroup![subIndex]"
            v-model:parent="match"
            v-model:parentGroup="group"
            :baseType="baseType"
            :canCheck="boolGroup!.length > 2"
            :depth="depth + 1"
            :index="subIndex"
            :parentIndex="index"
            :parentOperator="operator as Bool"
            :rootBool="false"
            @deleteMatch="onDeleteMatch(subIndex)"
            @updateBool="updateBool"
          />
        </div>
      </div>
      <div>
        <Button class="add-button" data-testid="add-clause-button" icon="fa-solid fa-plus" label="Add clause" type="button" @click="menu.toggle($event)" />
        <Menu ref="menu" :model="addItems" popup />
      </div>
    </div>
    <div v-else class="match-clause-outer" @dragover="onDragOver($event, 'Match')" @drop="onDrop($event, match, parent, index, 'Match')">
      <div v-if="match.nodeRef">
        <span class="from">from</span>
        <span class="node-ref">{{ match.nodeRef }}</span>
      </div>
      <div class="match-clause-inner">
        <div>
          <Button
            draggable="true"
            icon="drag-icon fa-solid fa-grip-vertical"
            severity="secondary"
            text
            @dragend="onDragEnd()"
            @dragstart="onDragStart(match, parent, index, 'Match')"
          />
        </div>
        <div v-if="canCheck" class="group-checkbox">
          <Checkbox
            v-model="subgroupCheck"
            v-tooltip="'Select to build boolean subgroup'"
            :inputId="'group' + index"
            binary
            data-testid="group-checkbox"
            name="Group"
            @update:modelValue="onCheckGroupChange"
          />
        </div>
        <span v-if="displayOperator" :class="parentOperator">{{ displayOperator }}</span>
        <div class="match-display">
          <MatchContentDisplay :clauseIndex="index" :depth="depth" :from="from" :match="match" :parentMatch="parent" />
        </div>
        <div class="edit-button">
          <Button
            class="add-button"
            data-testid="edit-clause-button"
            icon="fa-solid fa-pen-to-square"
            label="Edit clause"
            type="button"
            @click="editMatchClause()"
          />
        </div>
        <div>
          <Button class="delete-button" icon="fa-solid fa-trash" @click.stop="deleteMatch" />
        </div>
      </div>
      <div v-if="parentOperator === Bool.rule">
        <RuleActionEditor :rule="match" />
      </div>
    </div>
    <div v-if="rootBool && !boolGroup">
      <Button class="add-button" data-testid="add-clause-button" icon="fa-solid fa-plus" label="Add clause" type="button" @click="menu.toggle($event)" />
      <Menu ref="menu" :model="addItems" popup />
    </div>
  </template>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, Ref, ref } from "vue";

import { Bool } from "@endeavour/vue-library/enums";
import type { Match, Node } from "@endeavour/vue-library/interfaces";

import Button from "primevue/button";
import Menu from "primevue/menu";
import { v4 } from "uuid";

import BooleanEditor from "@/components/imquery/BooleanEditor.vue";
import MatchContentDisplay from "@/components/imquery/MatchContentDisplay.vue";
import MatchEditor from "@/components/imquery/MatchEditor.vue";
import RuleActionEditor from "@/components/imquery/RuleActionEditor.vue";
import { onDragEnd, onDragOver, onDragStart, onDrop } from "@/composables/useDragContext";
import {
  addMatchToParent,
  checkGroupChange,
  getBooleanOperator,
  getBoolGroup,
  getDisplayOperator,
  updateBooleans
} from "@/helpers/buildQuery";

interface Props {
  isVariable?: boolean;
  depth: number;
  rootBool: boolean;
  index: number;
  expanded?: boolean;
  canExpand?: boolean;
  parentOperator?: Bool;
  parentIndex: number;
  baseType: Node;
  canCheck?: boolean;
}

const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const parent = defineModel<Match>("parent", { default: {} });
const parentGroup = defineModel<number[]>("parentGroup", { default: [] });
const emit = defineEmits(["updateBool", "rationalise", "activateInput", "navigateTo", "deleteMatch"]);
const group: Ref<number[]> = ref([]);
const showEditor = ref(false);
const subgroupCheck: Ref<boolean> = computed(() => parentGroup.value.includes(props.index));
const editMatch: Ref<Match | undefined> = ref();
const from: Ref<Match | undefined> = ref();
const operator = computed(() => {
  return getBooleanOperator("Match", match.value);
});
const definitionSelector = ref(false);
const menu = ref();
const addItems = [
  { label: "Add new clause", icon: "pi pi-user-plus", command: () => createNewMatch() },
  { label: "Add query reference or import clause", icon: "pi pi-users", command: () => addCohort() }
];
const keepAs = inject("keepAs") as Ref<Record<string, Match>>;

const boolGroup = computed(() => {
  return getBoolGroup("Match", match.value);
});
const displayOperator = computed(() => {
  return getDisplayOperator(props.parentOperator, props.index);
});

onMounted(() => {
  init();
});

function init() {
  updateKeepAs(match.value);
  if (match.value.draft) editMatchClause();
}

function updateKeepAs(match: Match) {
  if (match.node) {
    keepAs.value[match.node] = match;
  }
}

function onDeleteMatchList() {
  showEditor.value = false;
  emit("deleteMatch");
}

function deleteMatch() {
  updateKeepAs(match.value);
  showEditor.value = false;
  emit("deleteMatch");
}
function onDeleteMatch(index: number) {
  if (match.value.or) {
    match.value.or.splice(index, 1);
    if (match.value.or.length === 1) {
      if (!match.value.typeOf && !match.value.orderBy && !match.value.where && !match.value.node) match.value = match.value.or[0];
    }
  } else if (match.value.and) {
    match.value.and.splice(index, 1);
    if (match.value.and.length === 1) {
      if (!match.value.typeOf && !match.value.orderBy && !match.value.where && !match.value.node) match.value = match.value.and[0];
    }
  } else emit("deleteMatch");
}

function onCheckGroupChange(e: any) {
  checkGroupChange(e, parentGroup.value, props.index);
}
function addCohort() {
  const match = { uuid: v4(), draft: true, is: [{}] } as Match;
  match.invalid = true;
  addMatchToParent(parent.value, match);
}

function updateBool(oldOperator: Bool | string, newOperator: Bool | string, index: number) {
  updateBooleans(match.value!, oldOperator as Bool, newOperator as Bool);
}
function createNewMatch() {
  const match = { uuid: v4(), draft: true } as Match;
  addMatchToParent(parent.value, match);
}

async function saveEditMatch(editedMatch: Match) {
  showEditor.value = false;
  match.value = editedMatch;
  match.value.draft = false;
  updateKeepAs(match.value);
  showEditor.value = false;
}

function getStepParent(): Match {
  if (parent.value.and) {
    return parent.value;
  } else {
    const stepMatch = { uuid: v4() } as Match;
    stepMatch.and = [];
    if (parent.value.or) parent.value.or[props.index] = stepMatch;
    stepMatch.and!.push(match.value!);
    return stepMatch;
  }
}

async function addTest(editedMatch: Match) {
  await saveEditMatch(editedMatch);
  const stepMatch = getStepParent();
  const testMatch = { uuid: v4(), nodeRef: match.value!.node, draft: true };
  stepMatch.and!.push(testMatch);
  showEditor.value = false;
}

async function addLinked(editedMatch: Match) {
  await saveEditMatch(editedMatch);
  showEditor.value = false;
  const stepMatch = getStepParent();
  const linkedMatch = { uuid: v4(), draft: true };
  stepMatch.and!.push(linkedMatch);
  showEditor.value = false;
}
function onDeletedWhere() {
  emit("deleteMatch");
}
function editMatchClause() {
  editMatch.value = match.value;
  showEditor.value = true;
}
function mouseover(event: any) {
  event.stopPropagation();
}

function cancelEditMatch() {
  showEditor.value = false;
  if (editMatch.value && editMatch.value.draft) {
    emit("deleteMatch");
  }
  showEditor.value = false;
}

function mouseout(event: any) {
  event.stopPropagation();
}
</script>

<style scoped>
.add-button,
.delete-button {
  color: #444444; /* text */
  background-color: #f0f0f0; /* greyish default */
  border: 1px solid #ccc;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.add-button:hover,
.add-button:focus {
  background-color: #a5d6a7;
}
.delete-button:hover,
.delete-button:focus {
  background-color: red;
}

button:active {
  background-color: #d6d6d6;
}
.node-ref {
  padding-right: 0.2rem;
  font-style: italic;
}
.from {
  padding-right: 0.2rem;
}
.match-surround {
  background-color: #fafafa;
}
.match-container {
  box-sizing: border-box;
  min-width: 0;
  padding: 0.5rem;
  border: #488bc230 1px solid;
  border-radius: 5px;
  background-color: #fafafa;
  margin: 0.5rem;
  font-size: 1rem;
}
.match-clause-outer {
  display: flex;
  flex-direction: column;
  border: #488bc230 1px solid;
  margin: 0.5rem;
  padding-left: 0.5rem;
}
.match-clause-inner {
  display: flex;
  align-items: center;
  flex-direction: row;
}
.drag-drop {
  align-items: flex-start;
  justify-content: flex-start;
}
.boolean-editor {
  min-height: 100%;
  width: 6rem;
}

.match-display {
  width: 30%;
  padding-left: 0.2rem;
  flex: 1 1 auto;
}

.edit-button {
  height: 100%;
  width: 8%;
  display: flex;
  align-items: center;
}
.delete-button {
  height: 100%;
  width: 2%;
  display: flex;
  align-items: center;
}

::v-deep(.operator-selector .p-select-label) {
  font-size: 0.85rem;
  padding-right: 0rem;
  margin-right: 0;
}

::v-deep(.operator-selector .p-select-dropdown) {
  padding-left: 0;
  margin-left: 0;
}

::v-deep(.operator-selector-not .p-select-label) {
  color: var(--p-red-500) !important;
  font-size: 0.85rem;
}
.rule {
  font-weight: bold;
  padding-right: 1rem;
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

.group-checkbox {
  padding-right: 0.5rem;
}
</style>
