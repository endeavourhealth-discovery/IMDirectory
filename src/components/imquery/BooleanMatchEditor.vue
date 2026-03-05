<template>
  <MatchEditor
    v-if="showEditor"
    :key="refreshCounter"
    v-model:match="editMatch"
    v-model:showMatchEditor="showEditor"
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
          :canCheck="boolGroup!.length > 2 && !match.step"
          v-model:parentGroup="group"
          @updateBool="updateBool"
          @deleteMatch="onDeleteMatch(subIndex)"
          :rootBool="false"
        />
      </div>
    </div>
    <div v-if="!match.step">
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
      <div v-if="!parent.step">
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
      <div v-if="parent?.union && !from" class="number">{{ getSubrule(parentIndex, index + 1) }}</div>
      <span v-else-if="displayOperator" :class="parentOperator">{{ displayOperator }}</span>
      <span v-else-if="parent.step && !match.nodeRef && index > 0" :class="'and'">with</span>
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

<script setup lang="ts">
import { Bool, DisplayMode, Match, Node } from "@/interfaces/AutoGen";
import { computed, onMounted, Ref, ref, watch } from "vue";
import {
  addMatchToParent,
  checkGroupChange,
  getBooleanOperator,
  getBoolGroup,
  getDisplayOperator,
  getMatchFromNodeRef,
  updateBooleans
} from "@/helpers/buildQuery";
import Button from "primevue/button";
import MatchContentDisplay from "@/components/imquery/MatchContentDisplay.vue";
import RuleActionEditor from "@/components/imquery/RuleActionEditor.vue";
import BooleanEditor from "@/components/imquery/BooleanEditor.vue";
import MatchEditor from "@/components/imquery/MatchEditor.vue";
import { isEqual } from "lodash-es";
import { onDragEnd, onDragOver, onDragStart, onDrop } from "@/composables/useDragContext";
import Menu from "primevue/menu";
import { QueryService } from "@/services";

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
  { label: "Add cohort", icon: "pi pi-users", command: () => addCohort() },
  { label: "Import definition", icon: "pi pi-file", command: () => addDefinition() }
];
const isNewMatch = ref(false);
const boolGroup = computed(() => {
  return getBoolGroup("Match", match.value);
});
const displayOperator = computed(() => {
  return getDisplayOperator(props.parentOperator, props.index);
});

const refreshCounter = ref(0);
const adding = ref(false);

function onDeleteMatchList() {
  emit("deleteMatch");
}

function deleteMatch() {
  emit("deleteMatch");
}
function onDeleteMatch(index: number) {
  if (match.value.or) {
    match.value.or.splice(index, 1);
    if (match.value.or.length === 1) {
      match.value = match.value.or[0];
    }
  } else if (match.value.and) {
    match.value.and.splice(index, 1);
    if (match.value.and.length === 1) {
      match.value = match.value.and[0];
    }
  } else if (match.value.step) {
    match.value.step.splice(index, 1);
    if (match.value.step.length === 1) {
      if (match.value.step[0].nodeRef) {
        emit("deleteMatch");
      } else match.value = match.value.step[0];
    }
  } else emit("deleteMatch");
}

function onCheckGroupChange(e: any) {
  checkGroupChange(e, parentGroup.value, props.index);
}
function addCohort() {
  editMatch.value = { is: [{}] } as Match;
  isNewMatch.value = true;
  showEditor.value = true;
}

function addDefinition() {
  editMatch.value = { is: [{}] } as Match;
  isNewMatch.value = true;
  definitionSelector.value = true;
  showEditor.value = true;
}
function updateBool(oldOperator: Bool | string, newOperator: Bool | string, index: number) {
  updateBooleans(match.value!, oldOperator as Bool, newOperator as Bool);
}
function createNewMatch() {
  editMatch.value = {} as Match;
  isNewMatch.value = true;
  showEditor.value = true;
}

async function saveEditMatch() {
  showEditor.value = false;
  if (isNewMatch.value && editMatch.value) {
    if (definitionSelector.value && editMatch.value.is && editMatch.value.is[0].iri) {
      const definition = await QueryService.getDisplayFromQueryIri(editMatch.value.is[0].iri, DisplayMode.LOGICAL);
      delete definition.typeOf;
      editMatch.value = definition;
      addMatchToParent(parent.value, editMatch.value);
    } else addMatchToParent(parent.value, editMatch.value);
  } else match.value = editMatch.value!;
  isNewMatch.value = false;
  definitionSelector.value = false;
}

function createStep(match: Match): Match {
  const stepMatch = {} as Match;
  stepMatch.step = [];
  if (isNewMatch.value && editMatch.value) {
    stepMatch.step.push(editMatch.value!);
    addMatchToParent(parent.value, stepMatch);
  } else {
    if (parent.value.and) parent.value.and[props.index] = stepMatch;
    else if (parent.value.or) parent.value.or[props.index] = stepMatch;
    stepMatch.step.push(editMatch.value!);
  }
  return stepMatch;
}

async function addTest() {
  showEditor.value = true;
  const stepMatch = createStep(editMatch.value!);
  isNewMatch.value = false;
  from.value = editMatch.value!;
  editMatch.value = { nodeRef: editMatch.value!.node };
  stepMatch.step!.push(editMatch.value!);
  showEditor.value = true;
}

async function addLinked() {
  showEditor.value = false;
}
function onDeletedWhere() {
  emit("deleteMatch");
}
function editMatchClause() {
  if (match.value.nodeRef) from.value = getMatchFromNodeRef(match.value.nodeRef, parent.value);
  editMatch.value = match.value;
  showEditor.value = true;
}
function mouseover(event: any) {
  event.stopPropagation();
}
function getSubrule(parentIndex: number, index: number): string {
  return parentIndex + String.fromCharCode(96 + index);
}

function cancelEditMatch() {
  showEditor.value = false;
  refreshCounter.value++;
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
</style>
