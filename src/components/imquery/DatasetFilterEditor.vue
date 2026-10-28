<template>
  <template v-if="match.and">
    <BooleanMatchEditor v-model:match="match" v-model:parent="match" :baseType="baseType" :depth="0" :index="0" :parentIndex="parentIndex" :rootBool="true" />
  </template>
  <template v-else-if="showEditor">
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
</template>

<script lang="ts" setup>
import { Ref, computed, inject, onMounted, ref } from "vue";

import { AlertDialog } from "@endeavour/vue-library/components";
import { Bool, DisplayMode } from "@endeavour/vue-library/enums";
import type { Node, Query } from "@endeavour/vue-library/models";
import { useDialogStore } from "@endeavour/vue-library/stores";

import { v4 } from "uuid";

import BooleanMatchEditor from "@/components/imquery/BooleanMatchEditor.vue";
import MatchContentEditor from "@/components/imquery/MatchContentEditor.vue";
import { getBooleanOperator, updateKeepAs } from "@/helpers/buildQuery";
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
}

const props = defineProps<Props>();
const match = defineModel<Query>("match", { default: {} });
const emit = defineEmits(["activateInput", "navigateTo", "cancel", "addLinked", "updateMatch"]);
const group: Ref<number[]> = ref([]);
const showEditor = ref(false);
const from: Ref<Query | undefined> = ref();
const operator = computed(() => {
  return getBooleanOperator("Match", match.value);
});
const keepAs = inject("keepAs") as Ref<Record<string, Query>>;
const dialogStore = useDialogStore();

function cancel() {
  emit("cancel");
}
async function onAddLinked() {
  const valid = await saveChanges();
  if (valid) {
    if (!match.value.as) {
      match.value.invalid = true;
      match.value.errorMessage = "Please select a name to this clause  to line to";
      await showInvalid(match.value);
      return;
    }
    emit("addLinked", match.value);
  }
}

async function showInvalid(match: Query) {
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
  emit("updateMatch");
}

onMounted(() => {
  init();
});

function init() {
  updateKeepAs(match.value, keepAs.value);
  if (match.value.draft) editMatchClause();
}

function deleteAny() {
  updateKeepAs(match.value, keepAs.value);
  showEditor.value = false;
  delete match.value.and;
}
function deleteMatch(index: number) {
  if (match.value.and) {
    match.value.and.splice(index, 1);
    if (match.value.and.length === 0) {
      delete match.value.and;
    }
  }
}

function createNewMatch() {
  const newMatch = { uuid: v4(), draft: true } as Query;
  if (match.value.and) match.value.and.push(newMatch);
  else {
    match.value.and = [newMatch];
  }
  emit("updateMatch");
}

async function saveEditMatch(editedMatch: Query) {
  showEditor.value = false;
  match.value = editedMatch;
  match.value.draft = false;
  updateKeepAs(match.value, keepAs.value);
  showEditor.value = false;
  emit("updateMatch");
}

async function addLinked(editedMatch: Query) {
  await saveEditMatch(editedMatch);
  showEditor.value = false;
  const linkedMatch = { uuid: v4(), draft: true };
  match.value.and!.push(linkedMatch);
  showEditor.value = false;
  emit("updateMatch");
}
function editMatchClause() {
  showEditor.value = true;
}
</script>

<style scoped>

button:active {
  background-color: #d6d6d6;
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
