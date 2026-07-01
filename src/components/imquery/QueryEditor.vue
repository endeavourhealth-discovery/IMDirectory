<template>
  <ProgressSpinner v-if="loading" />
  <Dialog
    v-if="!loading"
    id="query-builder-dialog"
    :auto-z-index="true"
    :closable="false"
    :contentStyle="{ flexGrow: '100', display: 'flex', flexDirection: 'column' }"
    :maximizable="true"
    :modal="true"
    :style="{
      minWidth: '90vw',
      minHeight: '90vh',
      display: 'flex',
      flexFlow: 'column nowrap'
    }"
    :visible="showDialog"
  >
    <template #header>
      <div class="ecl-builder-dialog-header">
        <strong>Query definition builder:</strong>
        <Button icon="fa-regular fa-circle-question" rounded-sm text @click="toggle" />
        <Popover ref="op">Select or drag and drop for grouping</Popover>
      </div>
    </template>
    <BaseTypeEditor v-model:match="query" />
    <div class="header">Cohort definition</div>
    <template v-if="query.typeOf">
      <BooleanMatchEditor
        v-model:match="query"
        v-model:parent="query"
        :baseType="query.typeOf!"
        :depth="0"
        :index="0"
        :parentIndex="parentIndex"
        :rootBool="true"
        @activateInput="activeInputId = $event"
        @rationalise="rationaliseBooleans"
      />
    </template>
    <div class="header">Output definition</div>
    <template v-if="query.typeOf && query.columnGroup && query.columnGroup.length > 0">
      <div><strong>Dataset entries:</strong></div>
      <template v-for="(columnGroup, index) in query.columnGroup" :key="index">
        <DataSetEditor
          v-if="showEditor && toEdit === index"
          v-model:match="query.columnGroup[index]"
          v-model:showEditor="showEditor"
          :index="index"
          :query="query"
          @cancel="cancelEditColumnGroup"
          @delete-group="onDeleteGroup(index)"
          @save-column-group="saveColumnGroup"
        />
        <div
          v-else
          class="column-group-display"
          :class="{ 'drag-over': dragOverColumnIndex === index }"
          @dragover="onColumnDragOver($event, index)"
          @drop="onColumnDrop($event, index)"
        >
          <Button
            class="drag-handle"
            icon="fa-solid fa-grip-vertical"
            severity="secondary"
            text
            draggable="true"
            @dragstart="onColumnDragStart($event, index)"
            @dragend="onColumnDragEnd"
          />
          <div class="column-group-content">
            <ColumnGroupDisplay
              v-model:datasetEntry="query.columnGroup![index]!"
              :baseType="query.typeOf!"
              :index="index"
              :matchExpanded="true"
              :parentQuery="query"
              :returnExpanded="true"
            />
          </div>
          <div class="button-group">
            <Button
              class="edit-button"
              data-testid="edit-clause-button"
              icon="fa-solid fa-pen-to-square"
              label="Edit entry"
              text
              @click="editColumnGroup(index)"
            />
            <Button class="delete-button p-button-text" icon="fa-solid fa-trash" @click.stop="deleteColumnGroup(index)" />
          </div>
        </div>
      </template>
    </template>
    <Button
      class="addColumnGroup-btn"
      data-testid="query-editor-add-column-button"
      icon="fa-solid fa-plus"
      label="Add Dataset entry"
      severity="secondary"
      @click="addColumnGroup"
    />

    <template #footer>
      <Button data-testid="cancel-ecl-builder-button" icon="fa-solid fa-xmark" label="Cancel" severity="secondary" @click="closeBuilderDialog" />
      <Button class="p-button-primary" data-testid="ecl-ok-button" icon="fa-solid fa-check" label="OK" @click="submit" />
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { Ref, onMounted, provide, readonly, ref, shallowRef, watch } from "vue";

import { useCopyToClipboard } from "@endeavour/vue-library/composables";
import type { Match, Query } from "@endeavour/vue-library/interfaces";

import { cloneDeep } from "lodash-es";
import Button from "primevue/button";
import { v4 } from "uuid";

import BaseTypeEditor from "@/components/imquery/BaseTypeEditor.vue";
import BooleanMatchEditor from "@/components/imquery/BooleanMatchEditor.vue";
import DataSetEditor from "@/components/imquery/DataSetEditor.vue";
import ColumnGroupDisplay from "@/components/query/viewer/ColumnGroupDisplay.vue";
import QueryService from "@/services/QueryService";
import { useDialogStore } from "@/stores/dialogStore";

import AlertDialog from "../shared/dynamicDialogs/AlertDialog.vue";

interface Props {
  showDialog?: boolean;
  sourceQuery: Query;
}
const props = defineProps<Props>();
const query: Ref<Query> = ref(cloneDeep(props.sourceQuery));
const emit = defineEmits<{
  querySubmitted: [payload: Query];
  eclConversionError: [payload: { error: boolean; message: string }];
  closeDialog: [];
}>();

const dialogStore = useDialogStore();
const activeInputId = ref("");
const includeTerms = ref(true);
const forceValidation = ref(false);
const queryString = ref("");
const { copyToClipboard, onCopy, onCopyError } = useCopyToClipboard(queryString);
const loading = ref(true);
const childLoadingState: Ref<any> = ref({});
const wasDraggedAndDropped = ref(false);
const op = ref();
const parentIndex = ref(0);
const keepAs = shallowRef<Record<string, Ref<Match>>>({});
const toEdit: Ref<number | undefined> = ref();
const showEditor = ref(false);
const draggedColumnIndex = ref<number | undefined>();
const dragOverColumnIndex = ref<number | undefined>();
provide("keepAs", keepAs);
provide("keepAs", keepAs);
provide("wasDraggedAndDropped", wasDraggedAndDropped);
provide("includeTerms", readonly(includeTerms));
provide("forceValidation", readonly(forceValidation));
provide("childLoadingState", childLoadingState);
watch(
  () => props.showDialog,
  val => {
    if (val) init();
  }
);

onMounted(async () => {
  await init();
});

function toggle(event: any) {
  op.value.toggle(event);
}
function onDeleteGroup(index: number) {
  if (query.value.columnGroup && query.value.columnGroup.length > 0) query.value.columnGroup.splice(index, 1);
}
function addColumnGroup() {
  if (!query.value.columnGroup) query.value.columnGroup = [];
  const match = { uuid: v4(), draft: true } as Match;
  query.value.columnGroup.push(match);
  toEdit.value = query.value.columnGroup.length - 1;
  showEditor.value = true;
}
function saveColumnGroup(editMatch: Match) {
  showEditor.value = false;
  if (toEdit.value !== undefined) {
    query.value.columnGroup![toEdit.value] = editMatch;
  }
  toEdit.value = undefined;
}

function cancelEditColumnGroup() {
  showEditor.value = false;
  toEdit.value = undefined;
}
function deleteColumnGroup(index: number) {
  query.value.columnGroup?.splice(index, 1);
  showEditor.value = false;
  toEdit.value = undefined;
}

function editColumnGroup(index: number) {
  showEditor.value = true;
  toEdit.value = index;
}

function onColumnDragStart(event: DragEvent, index: number) {
  draggedColumnIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
  }
}

function onColumnDragOver(event: DragEvent, index: number) {
  if (draggedColumnIndex.value === undefined || draggedColumnIndex.value === index) return;
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
  dragOverColumnIndex.value = index;
}

function onColumnDrop(event: DragEvent, index: number) {
  event.preventDefault();
  if (draggedColumnIndex.value === undefined || draggedColumnIndex.value === index) return;
  const fromIndex = draggedColumnIndex.value;
  const toIndex = index;
  const item = query.value.columnGroup!.splice(fromIndex, 1)[0];
  query.value.columnGroup!.splice(toIndex, 0, item);
  draggedColumnIndex.value = undefined;
  dragOverColumnIndex.value = undefined;
}

function onColumnDragEnd() {
  draggedColumnIndex.value = undefined;
  dragOverColumnIndex.value = undefined;
}

async function init() {
  loading.value = false;
  await rationaliseBooleans();
}

async function rationaliseBooleans() {
  query.value = await QueryService.flattenBooleans(query.value);
}

async function submit(): Promise<void> {
  emit("querySubmitted", query.value!);
}

function closeBuilderDialog(): void {
  emit("closeDialog");
}

async function displayValidationMessage(invalid: boolean | undefined) {
  if (!invalid) {
    await dialogStore.open(AlertDialog, {
      props: { modal: true, style: { width: "30vw" }, closable: false },
      data: {
        icon: "fa-regular fa-circle-check",
        title: "Success",
        text: "All entities are valid.",
        confirmButtonText: "Close"
      }
    });
  } else {
    await dialogStore.open(AlertDialog, {
      props: { modal: true, style: { width: "30vw" }, closable: false },
      data: {
        icon: "fa-regular fa-circle-exclamation",
        title: "Warning",
        text: "Invalid values found. Please review your entries.",
        confirmButtonText: "Close"
      }
    });
  }
}

function stripIds(idBuild: any) {
  if (idBuild) {
    delete idBuild.id;
    if (idBuild.items?.length) {
      for (const [index, item] of idBuild.items.entries()) {
        stripIds(item);
      }
    } else if (idBuild.type === "ExpressionConstraint") {
      if (idBuild.conceptBool) {
        stripIds(idBuild.conceptBool);
      }
      if (idBuild.refinementItems) {
        for (const [index, item] of idBuild.refinementItems.entries()) {
          stripIds(item);
        }
      }
    }
  }
}

function stripValidation(build: any) {
  delete build.validation;
  if (build.items?.length) {
    for (const item of build.items) {
      stripValidation(item);
    }
  } else if (build.refinementItems?.length) {
    for (const item of build.refinementItems) {
      stripValidation(item);
    }
  }
}
</script>

<style scoped>
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
  cursor: default;
  transition: opacity 0.15s, box-shadow 0.15s;
}
.column-group-display.drag-over {
  border-color: #488bc2;
  box-shadow: 0 0 0 2px #488bc280;
}
.column-group-display .drag-handle {
  cursor: grab;
  align-self: center;
}
.column-group-display .drag-handle:active {
  cursor: grabbing;
}
.column-group-content {
  flex: 1;
  min-width: 0;
}
#query-builder-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  overflow: auto;
}
.addColumnGroup-btn {
  align-self: flex-start;
  width: 220px;
}
.header {
  font-weight: bold;
}

.ecl-builder-dialog-header {
  display: flex;
  flex-flow: row;
  align-items: baseline;
  justify-content: space-between;
  font-size: larger;
}
.button-group {
  margin-left: auto;
}
</style>
