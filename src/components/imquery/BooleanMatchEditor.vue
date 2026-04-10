<template>
  <template v-if="showEditor && editMatch">
    <MatchEditor
      v-if="showEditor"
      :match="editMatch"
      :showEditor="showEditor"
      :baseType="baseType"
      :from="from"
      :depth="depth"
      :clauseIndex="index"
      :editCohort="editMatch && !!editMatch.is"
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
            :inputId="'group' + index"
            name="Group"
            binary
            v-model="subgroupCheck"
            data-testid="group-checkbox"
            @update:modelValue="onCheckGroupChange"
            v-tooltip="'Select to build boolean subgroup'"
          />
        </div>
        <BooleanEditor
          v-model:clause="match"
          v-model:parent="parent"
          :parentType="'Match'"
          :index="index"
          v-model:group="group"
          :parentOperator="parentOperator as Bool"
          :operator="operator"
          :rootBool="rootBool"
          :clauseType="'Match'"
        />
      </div>
      <div>
        <div v-if="parentOperator === Bool.rule && index > 0" class="rule">Rule {{ index }}</div>
        <div v-for="(item, subIndex) in boolGroup" :key="item.uuid">
          <BooleanMatchEditor
            v-model:match="boolGroup![subIndex]"
            v-model:parent="match"
            :depth="depth + 1"
            :baseType="baseType"
            :parentOperator="operator as Bool"
            :parentIndex="index"
            :index="subIndex"
            :canCheck="boolGroup!.length > 2"
            v-model:parentGroup="group"
            @updateBool="updateBool"
            @deleteMatch="onDeleteMatch(subIndex)"
            :rootBool="false"
          />
        </div>
      </div>
      <div>
        <Button type="button" icon="fa-solid fa-plus" label="Add clause" data-testid="add-clause-button" class="add-button" @click="menu.toggle($event)" />
        <Menu ref="menu" :model="addItems" popup />
      </div>
    </div>
    <div v-else class="match-clause-outer" @drop="onDrop($event, match, parent, index, 'Match')" @dragover="onDragOver($event, 'Match')">
      <div v-if="match.nodeRef">
        <span class="from">from</span>
        <span class="node-ref">{{ match.nodeRef }}</span>
      </div>
      <div class="match-clause-inner">
        <div>
          <Button
            icon="drag-icon fa-solid fa-grip-vertical"
            severity="secondary"
            text
            draggable="true"
            @dragstart="onDragStart(match, parent, index, 'Match')"
            @dragend="onDragEnd()"
          />
        </div>
        <div v-if="canCheck" class="group-checkbox">
          <Checkbox
            :inputId="'group' + index"
            name="Group"
            binary
            v-model="subgroupCheck"
            data-testid="group-checkbox"
            @update:modelValue="onCheckGroupChange"
            v-tooltip="'Select to build boolean subgroup'"
          />
        </div>
        <span v-if="displayOperator" :class="parentOperator">{{ displayOperator }}</span>
        <div class="match-display">
          <MatchContentDisplay :match="match" :parentMatch="parent" :from="from" :depth="depth" :clauseIndex="index" />
        </div>
        <div class="edit-button">
          <Button
            type="button"
            icon="fa-solid fa-pen-to-square"
            label="Edit clause"
            data-testid="edit-clause-button"
            class="add-button"
            @click="editMatchClause()"
          />
        </div>
        <div>
          <Button @click.stop="deleteMatch" class="delete-button" icon="fa-solid fa-trash" />
        </div>
      </div>
      <div v-if="parentOperator === Bool.rule">
        <RuleActionEditor :rule="match" />
      </div>
    </div>
    <div v-if="rootBool && !boolGroup">
      <Button type="button" icon="fa-solid fa-plus" label="Add clause" data-testid="add-clause-button" class="add-button" @click="menu.toggle($event)" />
      <Menu ref="menu" :model="addItems" popup />
    </div>
  </template>
</template>

<script setup lang="ts">
import type { Match, Node } from "vue-library/interfaces";
import { Bool } from "vue-library/enums";
import { computed, Ref, ref, onMounted, inject } from "vue";
import { addMatchToParent, checkGroupChange, getBooleanOperator, getBoolGroup, getDisplayOperator, updateBooleans } from "@/helpers/buildQuery";
import Button from "primevue/button";
import MatchContentDisplay from "@/components/imquery/MatchContentDisplay.vue";
import RuleActionEditor from "@/components/imquery/RuleActionEditor.vue";
import BooleanEditor from "@/components/imquery/BooleanEditor.vue";
import MatchEditor from "@/components/imquery/MatchEditor.vue";
import { isEqual } from "lodash-es";
import { onDragEnd, onDragOver, onDragStart, onDrop } from "@/composables/useDragContext";
import Menu from "primevue/menu";
import { QueryService } from "@/services";
import { v4 } from "uuid";
import type { TreeNode } from "primevue/treenode";

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
const keepAs = inject("keepAs") as Ref<Match[]>;

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
  keepAs.value = keepAs.value.filter(m => m !== match);
  if (match.node) keepAs.value.push(match);
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
  if (match.value.nodeRef) from.value = parent.value.and![props.index - 1];
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
