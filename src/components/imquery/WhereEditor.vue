<template>
  <div class="filter-editor-container">
    <Splitter layout="horizontal" size="25">
      <SplitterPanel :size="25">
        <div class="column-selector" @click.stop>
          <Tree
            v-model:expandedKeys="expandedKeys"
            v-model:selectionKeys="selectedNodeKey"
            :lazy="true"
            :loading="loading"
            :propagateSelectionDown="false"
            :propagateSelectionUp="false"
            :value="typeNodes"
            icon="loading"
            selectionMode="single"
            @node-expand="onMatchNodeExpand"
            @node-select="onNodeSelect"
          >
            <template #default="{ node }: any">
              <div class="items-center">
                <ProgressSpinner v-if="node.loading" class="progress-spinner" />
                <IMFontAwesomeIcon
                  v-if="node.data.typeIcon && !node.loading"
                  :icon="node.data.typeIcon"
                  :style="'color:' + node.data.color"
                  class="mr-2"
                  fixed-width
                />
                <span class="tree-node-label">{{ node.label }}</span>
                <IMFontAwesomeIcon
                  v-if="node.data.rangeTypeIcon && !node.loading"
                  :icon="node.data.rangeTypeIcon"
                  :style="'color:' + node.data.rangeTypeColor"
                  class="mr-2"
                  fixed-width
                />
              </div>
            </template>
          </Tree>
        </div>
      </SplitterPanel>
      <SplitterPanel>
        <div v-if="editingWhere" class="column-selector">
          <div>Select features and properties from left</div>
          <BooleanWhereEditor
            v-if="match.where"
            :key="match.where ? match.where.uuid : 'no-where'"
            v-model:parent="match"
            v-model:where="match.where"
            :base-type="baseType"
            :index="0"
            :match="match"
            :parentIndex="0"
            :rootBool="true"
            @deleteWhere="emit('deleteWhere')"
            @updateProperty="onUpdate"
          />

          <div v-if="!editingThen && orderables && orderables.length > 0 && match.where">
            <div v-if="orderables && orderables.length > 0">
              <span class="keep-as-reference">Select</span>
              <Select
                :modelValue="orderable"
                :options="orderables"
                class="test-selector"
                data-testid="order-selector"
                option-label="label"
                option-value="value"
                scroll-height="50rem"
                @update:modelValue="updateOrderable"
              >
                <template #value="slotProps">
                  <div class="test-selector">
                    <div v-if="orderable">{{ orderable.label }}</div>
                  </div>
                </template>
                <template #dropdownicon>
                  <i class="pi pi-chevron-down"></i>
                </template>
                <template #option="slotProps">
                  <div v-tooltip="slotProps.option.tooltip" class="flex items-center" style="min-height: 1rem">
                    <div>{{ slotProps.option.label }}</div>
                  </div>
                </template>
              </Select>
            </div>
            <div v-if="(match.where || match.orderBy) && !editingThen">
              <span class="keep-as-reference">Keep as reference</span>
              <InputText v-model="match.node" type="text" @input="onInput" />
            </div>
            <span v-if="match.orderBy">
              <Button v-if="!match.then" class="add-button" data-testid="add-test-button" label="Add further test on the results" @click="emit('addTest')" />
            </span>
            <Button class="add-button" data-testid="add-test-button" label="Add related feature" @click="emit('addLinked')" />
            <span v-if="match.then">
              <Button class="add-button" data-testid="edit-test-button" label="Edit test criteria" @click="emit('editTest')" />
            </span>
          </div>
        </div>

        <div v-else-if="editingThen" class="column-selector">
          <span class="field">With the following conditions:</span>
          <MatchContentDisplay :clauseIndex="0" :depth="0" :match="match" :parentMatch="match" :skipThen="true" />
          <div>
            <Button class="add-button" data-testid="edit-test-button" label="Edit main criteria" @click="emit('editMain')" />
          </div>
          <div>Then further test the above values after ordering. Add from left</div>
          <BooleanWhereEditor
            v-if="match.then"
            :key="'test'"
            v-model:parent="match"
            v-model:where="match.then"
            :base-type="baseType"
            :index="0"
            :match="match"
            :parentIndex="0"
            :rootBool="true"
            @deleteWhere="emit('deleteThen')"
            @updateProperty="onUpdate"
          />
        </div>
        <div v-else-if="editingWhen" class="column-selector">
          <div>Add properties to test from left</div>
          <BooleanWhereEditor
            v-if="when && when.where"
            :key="'test'"
            v-model:parent="match"
            v-model:where="when.where"
            :base-type="baseType"
            :index="0"
            :match="match"
            :parentIndex="0"
            :rootBool="true"
            @deleteWhere="emit('deleteWhenWhere')"
            @updateProperty="onUpdateWhen"
          />
        </div>
      </SplitterPanel>
    </Splitter>
  </div>
</template>

<script lang="ts" setup>
import { Ref, inject, onMounted, ref } from "vue";

import { IMFontAwesomeIcon } from "@endeavour/vue-library/components";
import { useCopyToClipboard } from "@endeavour/vue-library/composables";
import { Bool, DisplayMode } from "@endeavour/vue-library/enums";
import type { Match, Node, NodeShape, When } from "@endeavour/vue-library/interfaces";

import Button from "primevue/button";
import type { TreeNode } from "primevue/treenode";

import BooleanWhereEditor from "@/components/imquery/BooleanWhereEditor.vue";
import MatchContentDisplay from "@/components/imquery/MatchContentDisplay.vue";
import { Mode, usePropertyTree } from "@/composables/usePropertyTree";
import { getOrderOptions, getOrderable } from "@/helpers/QueryEditorMethods";
import { addFilter, addWhereToWhen, getOrderables, setMandatoryWheres } from "@/helpers/buildQuery";
import { DataModelService, QueryService } from "@/services";
import { useDialogStore } from "@/stores/dialogStore";

import AlertDialog from "../shared/dynamicDialogs/AlertDialog.vue";

interface Props {
  baseType: Node;
  depth: number;
  clauseIndex: number;
  showEditor: boolean;
  editCohort?: boolean;
  datasetEntry?: boolean;
  editingThen?: boolean;
  parentOperator?: Bool;
  editingWhere?: boolean;
  editingWhen?: boolean;
  returnIndex?: number;
  whenIndex?: number;
}

const props = defineProps<Props>();
const match: Ref<Match> = defineModel<Match>("match", { default: {} });
const when = defineModel<When>("when", { default: {} });

const emit = defineEmits<{
  (event: "saveChanges", match: Match): void;
  (event: "updateMatch"): void;
  (event: "cancel"): void;
  (event: "deleteMatch"): void;
  (event: "addTest"): void;
  (event: "addLinked"): void;
  (event: "editMain"): void;
  (event: "deleteThen"): void;
  (event: "deleteWhere"): void;
  (event: "editTest"): void;
  (event: "deleteWhenWhere"): void;
}>();
const dialogStore = useDialogStore();
const orderables: Ref<any[] | undefined> = ref();
const orderable: Ref<any> = ref({ label: "Any/latest/earliest", value: "addTest" });
const expandedKeys = ref<Record<string, boolean>>({});
const expandedReturnKeys = ref<Record<string, boolean>>({});
const selectedNodeKey = ref<Record<string, { checked: boolean; partialChecked?: boolean }>>({});
const { expandNode, createModeView, createFeatureTree, createRelatedTypeTree } = usePropertyTree();
const editMatchString: Ref<string> = ref("");
const { onCopy, onCopyError } = useCopyToClipboard(editMatchString);
const loading = ref(true);
const edited = ref(false);
const keepAs = inject("keepAs") as Ref<Record<string, Ref<Match>>>;
const typeNodes: Ref<TreeNode[]> = ref([]);
const nodeShape: Ref<NodeShape | undefined> = ref();
const keepAsNode: Ref<string | undefined> = ref(match.value.node);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(async () => {
  await init();
});
function onInput() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    emit("updateMatch");
  }, 1000);
  updateKeepAs();
}
function updateKeepAs() {
  if (keepAsNode.value) delete keepAs.value[keepAsNode.value];
  keepAsNode.value = match.value.node;
  if (match.value.node) keepAs.value[match.value.node] = match;
}

async function init() {
  loading.value = true;
  if (match.value.typeOf) {
    nodeShape.value = await DataModelService.getDataModelProperties(match.value.typeOf.iri!, false);
    typeNodes.value = await createFeatureTree(nodeShape.value, "match");
  } else {
    nodeShape.value = await DataModelService.getRelatedTypes(props.baseType.iri!);
    typeNodes.value = await createRelatedTypeTree(nodeShape.value);
  }

  setupTrees(props.datasetEntry ? "return" : "match");
  selectedNodeKey.value = {};
  setOrderables();
  loading.value = false;
}

async function onNodeSelect(node: any) {
  if (!match.value.typeOf) {
    if (node.data.typeOf) {
      match.value.typeOf = { iri: node.data.typeOf };
      nodeShape.value = await DataModelService.getDataModelProperties(match.value.typeOf.iri!, false);
      typeNodes.value = await createFeatureTree(nodeShape.value, "match");
      setupTrees("match");
      if (!expandedKeys.value[typeNodes.value[0].key]) {
        expandedKeys.value[typeNodes.value[0].key] = true;
      }
    }
  }
  if (node.type === "property") {
    if (props.editingWhen && when.value) addWhereToWhen(when.value, match.value, node);
    else addFilter(match.value, node, props.editingThen, props.editingWhen);
  }
  await setMandatoryWheres(match.value);
  match.value = await QueryService.getQueryDisplayFromQuery(match.value, DisplayMode.ORIGINAL);
  edited.value = true;
  setOrderables();
  emit("updateMatch");
}
function onDeleteWhere() {
  emit("deleteWhere");
}

function setupTrees(mode: Mode) {
  createModeView(typeNodes.value, mode);
  if (typeNodes.value[0].children && typeNodes.value[0].children.length === 0) expandNode(typeNodes.value[0], mode);
}
async function onUpdate() {
  edited.value = true;
  emit("updateMatch");
}
async function onUpdateWhen() {
  edited.value = true;
  emit("updateMatch");
}
async function onMatchNodeExpand(node: any) {
  await expandNode(node, "match");
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
function setOrderables() {
  if (match.value.typeOf && nodeShape.value) {
    orderables.value = getOrderOptions(getOrderables(nodeShape.value));
    if (match.value.orderBy) {
      orderable.value = getOrderable(match.value, orderables.value);
    }
  }
}

function updateOrderable(value: any) {
  if (!value.iri) {
    delete match.value.orderBy;
    orderable.value = undefined;
  } else {
    orderable.value = value;
    match.value.orderBy = { property: [{ iri: value.iri, direction: value.direction }] };
  }
  emit("updateMatch");
}
</script>

<style scoped>
.filter-editor-container {
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* IMPORTANT */
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-content-border-radius);
}
.p-splitter {
  height: 100%;
}
:deep(.p-splitter) {
  height: 100%;
}
.p-splitter-panel {
  min-height: 0; /* CRITICAL for scroll to work */
  display: flex;
  flex-direction: column;
}
:deep(.p-splitter-panel) {
  height: 100%;
}
.column-selector {
  height: 100%;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}
.field {
  padding-right: 0.2rem;
}
.add-button {
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
.keep-as-reference {
  padding-right: 1rem;
}
</style>
