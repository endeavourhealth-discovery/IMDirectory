<template>
  <MatchEditor
    v-if="showEditor"
    :match="match"
    :showEditor="showEditor"
    :baseType="baseType"
    :depth="0"
    :datasetEntry="true"
    :clauseIndex="0"
    @cancel="cancelEditColumnGroup"
    @saveChanges="saveEditColumnGroup"
  />
  <div v-else class="column-group-display">
    <ColumnGroupDisplay
      v-model:datasetEntry="match"
      :matchExpanded="true"
      :returnExpanded="true"
      :index="index"
      :parentQuery="query"
      :baseType="query.typeOf!"
    />
    <div class="button-group">
      <Button text icon="fa-solid fa-pen-to-square" label="Edit entry" data-testid="edit-clause-button" class="edit-button" @click="editColumnGroup()" />
      <Button @click.stop="deleteColumnGroup" class="delete-button p-button-text" icon="fa-solid fa-trash" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";

import type { Match, Node, Query } from "@endeavour/vue-library/interfaces";

import Button from "primevue/button";
import { v4 } from "uuid";

import ColumnGroupEditor from "@/components/imquery/ColumnGroupEditor.vue";
import MatchEditor from "@/components/imquery/MatchEditor.vue";
import ColumnGroupDisplay from "@/components/query/viewer/ColumnGroupDisplay.vue";
import { deleteGroupFromQuery } from "@/helpers/buildQuery";
import { QueryService } from "@/services";

interface Props {
  index: number;
  query: Query;
}

const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const emit = defineEmits<{
  (event: "saveColumnGroup", index: number, match: Match): void;
  (event: "cancel"): void;
  (event: "deleteGroup", index: number): void;
}>();

const showEditor = ref(false);
const baseType: Ref<Node> = ref(props.query.typeOf!);

onMounted(() => {
  init();
});

function init() {
  if (match.value.draft) editColumnGroup();
}

function editColumnGroup() {
  showEditor.value = true;
}
function saveEditColumnGroup(editedMatch: Match) {
  showEditor.value = false;
  editedMatch.draft = false;
  emit("saveColumnGroup", props.index, editedMatch);
}
function cancelEditColumnGroup() {
  showEditor.value = false;
  if (match.value && match.value.draft) {
    deleteColumnGroup();
  }
}
function deleteColumnGroup() {
  showEditor.value = false;
  emit("deleteGroup", props.index);
}
</script>

<style scoped>
.nested-match {
  box-sizing: border-box;
  min-width: 0;
  padding: 0.5rem;
  border: #488bc230 1px solid;
  border-radius: 5px;
  background-color: #488bc210;
  margin: 0.5rem;
  font-size: 1rem;
}

.column-group-display {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  box-sizing: border-box;
  min-width: 0;
  padding: 0.5rem;
  border: #488bc230 1px solid;
  border-radius: 5px;
  background-color: #488bc210;
  margin: 0.5rem;
  font-size: 1rem;
}
.button-group {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
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
  width: 20rem;
  display: flex;
  align-items: center;
  color: black;
}
.delete-button {
  height: 100%;
  width: 4rem;
  display: flex;
  color: black;
  align-items: center;
}
.delete-button:hover,
.delete-button:focus {
  background-color: red;
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
</style>
