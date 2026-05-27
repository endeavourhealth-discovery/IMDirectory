<template>
  <div>{{ editMatch.any }}</div>
  <template v-if="showEditor && editMatch">
    <MatchContentEditor
      v-model:match="editMatch"
      :baseType="baseType"
      :depth="depth"
      :index="index"
      :mustKeep="true"
      :parentOperator="parentOperator"
      @addLinked="onAddLinked"
      @cancel="cancel"
      @deleteMatch="deleteMatch"
      @saveChanges="saveEditMatch"
      @updateMatch="onUpdate"
    />
  </template>
  <template v-else>
    <div>{{ editMatch.any }}</div>
    <div v-if="editMatch.any && editMatch.any.length > 0" class="match-container">
      <div v-for="(item, subIndex) in editMatch.any" :key="item.uuid">
        <DatasetFilterEditor
          v-model:match="editMatch.any[subIndex]"
          v-model:parentGroup="group"
          :baseType="baseType"
          :depth="depth + 1"
          :index="subIndex"
          :parentIndex="index"
          :parentOperator="operator as Bool"
          :rootBool="false"
          @deleteMatch="onDeleteMatch(subIndex)"
          @add-linked="addLinked"
        />
      </div>
    </div>
    <div class="match-clause-outer">
      <div v-if="match.nodeRef">
        <span class="from">from</span>
        <span class="node-ref">{{ match.nodeRef }}</span>
      </div>
      <div class="match-clause-inner">
        <div class="match-display">
          <MatchContentDisplay :clauseIndex="index" :depth="depth" :from="from" :match="editMatch" :parentMatch="editMatch" />
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
    </div>
    <div v-if="rootBool">
      <Button class="add-button" data-testid="add-clause-button" icon="fa-solid fa-plus" label="Add clause" type="button" @click="createNewMatch" />
    </div>
  </template>
</template>

<script lang="ts" setup>
import { Ref, computed, inject, onMounted, ref } from "vue";

import { Bool, DisplayMode } from "@endeavour/vue-library/enums";
import type { Match, Node } from "@endeavour/vue-library/interfaces";

import { cloneDeep } from "lodash-es";
import Button from "primevue/button";
import { v4 } from "uuid";

import MatchContentDisplay from "@/components/imquery/MatchContentDisplay.vue";
import MatchContentEditor from "@/components/imquery/MatchContentEditor.vue";
import AlertDialog from "@/components/shared/dynamicDialogs/AlertDialog.vue";
import { onDragEnd, onDragOver, onDragStart, onDrop } from "@/composables/useDragContext";
import { addMatchToParent, checkGroupChange, getBooleanOperator, getDisplayOperator, updateBooleans } from "@/helpers/buildQuery";
import { QueryService } from "@/services";
import { useDialogStore } from "@/stores/dialogStore";

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
  match: Match;
}

const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const editMatch: Ref<Match> = ref(cloneDeep(props.match));
const emit = defineEmits(["activateInput", "navigateTo", "deleteMatch", "cancel", "addLinked","updateMatch"]);
const group: Ref<number[]> = ref([]);
const showEditor = ref(false);
const from: Ref<Match | undefined> = ref();
const operator = computed(() => {
  return getBooleanOperator("Match", match.value);
});
const keepAs = inject("keepAs") as Ref<Record<string, Ref<Match>>>;
const dialogStore = useDialogStore();

function cancel() {
  emit("cancel");
}
async function onAddLinked() {
  const valid = await saveChanges();
  if (valid) {
    if (!editMatch.value.node) {
      editMatch.value.invalid = true;
      editMatch.value.errorMessage = "Please select a name to this clause  to line to";
      await showInvalid(editMatch.value);
      return;
    }
    emit("addLinked", editMatch.value);
  }
}

async function showInvalid(match: Match) {
  await dialogStore.open(AlertDialog, {
    props: { modal: true, style: { width: "30vw" }, closable: false },
    data: {
      icon: "fa-regular fa-circle-check",
      title: "Warning",
      text: match.errorMessage + ". Use filter tab to edit.",
      confirmButtonText: "Close"
    }
  });
}

async function saveChanges(): Promise<boolean> {
  const matchCheck = await QueryService.validateQuery(editMatch.value);
  if (matchCheck.invalid) {
    editMatch.value.draft = true;
    await showInvalid(matchCheck);
    return false;
  } else {
    editMatch.value = await QueryService.getQueryDisplayFromQuery(editMatch.value, DisplayMode.ORIGINAL);
    editMatch.value.draft = false;
    return true;
  }
}

async function onUpdate() {
  editMatch.value = await QueryService.getQueryDisplayFromQuery(editMatch.value, DisplayMode.ORIGINAL);
}

onMounted(() => {
  init();
});

function init() {
  updateKeepAs();
  if (match.value.draft) editMatchClause();
}

function updateKeepAs() {
  if (match.value.node) {
    keepAs.value[match.value.node] = match;
  }
}

function deleteMatch() {
  updateKeepAs();
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

function createNewMatch() {
  const match = { uuid: v4(), draft: true } as Match;
  if (editMatch.value.any) editMatch.value.any.push(match);
  else {
    editMatch.value.any = [match];
  }
  emit("updateMatch");
}

async function saveEditMatch(editedMatch: Match) {
  showEditor.value = false;
  match.value = editedMatch;
  match.value.draft = false;
  updateKeepAs();
  showEditor.value = false;
  emit("updateMatch");

}

async function addLinked(editedMatch: Match) {
  await saveEditMatch(editedMatch);
  showEditor.value = false;
  const linkedMatch = { uuid: v4(), draft: true };
  editMatch.value.any!.push(linkedMatch);
  showEditor.value = false;
  emit("updateMatch");
}
function onDeletedWhere() {
  emit("deleteMatch");
}
function editMatchClause() {
  editMatch.value = match.value;
  showEditor.value = true;
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
