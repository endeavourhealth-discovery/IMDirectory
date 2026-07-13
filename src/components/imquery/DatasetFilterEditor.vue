<template>
  <template v-if="showEditor">
    <MatchContentEditor
      v-model:match="match"
      :baseType="baseType"
      :depth="depth"
      :index="index"
      :mustKeep="true"
      :parentOperator="parentOperator"
      @addLinked="onAddLinked"
      @cancel="cancel"
      @deleteMatch="deleteAny"
      @saveChanges="saveEditMatch"
      @updateMatch="onUpdate"
    />
  </template>
  <template v-else>
    <div v-if="match.any && match.any.length > 0" class="match-container">
      <div v-for="(item, subIndex) in match.any" :key="item.uuid">
        <DatasetFilterEditor
          v-model:match="match.any[subIndex]"
          :baseType="baseType"
          :depth="depth + 1"
          :index="subIndex"
          :parentIndex="index"
          :parentOperator="operator as Bool"
          :rootBool="false"
          @add-linked="addLinked"
        />
        <div class="edit-button">
          <Button
            class="add-button"
            data-testid="edit-clause-button"
            icon="fa-solid fa-pen-to-square"
            label="Edit clause"
            type="button"
            @click="editMatchClause()"
          />
          <div>
            <Button class="delete-button" icon="fa-solid fa-trash" @click.stop="deleteMatch(subIndex)" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="isDefined" class="match-clause-outer">
      <div v-if="match.nodeRef">
        <span class="from">from</span>
        <span class="node-ref">{{ match.nodeRef }}</span>
      </div>
      <div class="match-clause-inner">
        <div class="match-display">
          <MatchContentDisplay :clauseIndex="index" :depth="depth" :from="from" :match="match" :parentMatch="match" />
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
import type { Match, Node } from "@endeavour/vue-library/models";

import Button from "primevue/button";
import { v4 } from "uuid";

import MatchContentDisplay from "@/components/imquery/MatchContentDisplay.vue";
import MatchContentEditor from "@/components/imquery/MatchContentEditor.vue";
import AlertDialog from "@/components/shared/dynamicDialogs/AlertDialog.vue";
import { getBooleanOperator } from "@/helpers/buildQuery";
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
const emit = defineEmits(["activateInput", "navigateTo", "cancel", "addLinked", "updateMatch"]);
const group: Ref<number[]> = ref([]);
const showEditor = ref(false);
const from: Ref<Match | undefined> = ref();
const operator = computed(() => {
  return getBooleanOperator("Match", match.value);
});
const keepAs = inject("keepAs") as Ref<Record<string, Ref<Match>>>;
const dialogStore = useDialogStore();
const isDefined = computed(() => {
  return !!match.value.where;
});
function cancel() {
  emit("cancel");
}
async function onAddLinked() {
  const valid = await saveChanges();
  if (valid) {
    if (!match.value.node) {
      match.value.invalid = true;
      match.value.errorMessage = "Please select a name to this clause  to line to";
      await showInvalid(match.value);
      return;
    }
    emit("addLinked", match.value);
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
  const matchCheck = await QueryService.validateQuery(match.value);
  if (matchCheck.invalid) {
    match.value.draft = true;
    await showInvalid(matchCheck);
    return false;
  } else {
    match.value = await QueryService.getQueryDisplayFromQuery(match.value, DisplayMode.ORIGINAL);
    match.value.draft = false;
    return true;
  }
}

async function onUpdate() {
  match.value = await QueryService.getQueryDisplayFromQuery(match.value, DisplayMode.ORIGINAL);
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

function deleteAny() {
  updateKeepAs();
  showEditor.value = false;
  delete match.value.any;
}
function deleteMatch(index: number) {
  if (match.value.any) {
    match.value.any.splice(index, 1);
    if (match.value.any.length === 0) {
      delete match.value.any;
    }
  }
}

function createNewMatch() {
  const newMatch = { uuid: v4(), draft: true } as Match;
  if (match.value.any) match.value.any.push(newMatch);
  else {
    match.value.any = [newMatch];
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
  match.value.any!.push(linkedMatch);
  showEditor.value = false;
  emit("updateMatch");
}
function editMatchClause() {
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
  padding-right: 0;
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
</style>
