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
            v-model:match="match"
            v-model:parent="match"
            v-model:where="match.where"
            :base-type="baseType"
            :index="0"
            :parentIndex="0"
            :rootBool="true"
            @deleteWhere="emit('deleteWhere')"
            @updateProperty="onUpdate"
          />
          <div v-if="match.then && match.then.where">
            <div>Then test:</div>
            <WhereContentDisplay :depth="0" :index="0" :where="match.then.where" />
          </div>

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
              <InputText v-model="match.as" type="text" @input="onInput" />
            </div>
            <span v-if="match.orderBy">
              <Button v-if="!match.then" class="add-button" data-testid="add-test-button" label="Add further test on the results" @click="addTest" />
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
            v-if="match.then && match.then.where"
            :key="'test'"
            v-model:parent="match"
            v-model:where="match.then.where"
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
            v-if="when"
            :key="'test'"
            v-model:parent="match"
            v-model:where="when"
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

import { OrderLimit } from "@endeavour/vue-library";
import { IMFontAwesomeIcon } from "@endeavour/vue-library/components";
import { AlertDialog } from "@endeavour/vue-library/components";
import { useCopyToClipboard } from "@endeavour/vue-library/composables";
import { Bool, DisplayMode } from "@endeavour/vue-library/enums";
import { type Node, type NodeShape, Query, type When } from "@endeavour/vue-library/models";
import { useDialogStore } from "@endeavour/vue-library/stores";

import Button from "primevue/button";
import type { TreeNode } from "primevue/treenode";

import BooleanWhereEditor from "@/components/imquery/BooleanWhereEditor.vue";
import MatchContentDisplay from "@/components/imquery/MatchContentDisplay.vue";
import WhereContentDisplay from "@/components/imquery/WhereContentDisplay.vue";
import { usePropertyTree } from "@/composables/usePropertyTree";
import { ViewMode } from "@/enums/PropertyViewMode";
import { getOrderOptions, getOrderable } from "@/helpers/QueryEditorMethods";
import { addFilter, addWhereToWhen, getOrderables, setMandatoryWheres } from "@/helpers/buildQuery";
import { DataModelService, QueryService } from "@/services";

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
  mustKeep?: boolean;
}

const props = defineProps<Props>();
const match: Ref<Query> = defineModel<Query>("match", { default: {} });
const when = defineModel<When>("when", { default: {} });

const emit = defineEmits<{
  (event: "saveChanges", match: Query): void;
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
const keepAs = inject("keepAs") as Ref<Record<string, Ref<Query>>>;
const typeNodes: Ref<TreeNode[]> = ref([]);
const nodeShape: Ref<NodeShape | undefined> = ref();
const keepAsNode: Ref<string | undefined> = ref(match.value.as);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(async () => {
  await init();
});

function addTest() {
  match.value.then = { where: {} } as Query;
  emit("addTest");
}
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
  keepAsNode.value = match.value.as;
  if (match.value.as) keepAs.value[match.value.as] = match;
}

async function init() {
  loading.value = true;
  if (match.value.typeOf) {
    nodeShape.value = await DataModelService.getDataModelProperties(match.value.typeOf.iri!, false);
    typeNodes.value = await createFeatureTree(nodeShape.value, ViewMode.match);
  } else {
    nodeShape.value = await DataModelService.getRelatedTypes(props.baseType.iri!);
    typeNodes.value = createRelatedTypeTree(nodeShape.value);
  }

  setupTrees(ViewMode.match);
  selectedNodeKey.value = {};
  setOrderables();
  loading.value = false;
}

async function onNodeSelect(node: any) {
  if (!match.value.typeOf) {
    if (node.data.typeOf) {
      match.value.typeOf = { iri: node.data.typeOf } as Node;
      nodeShape.value = await DataModelService.getDataModelProperties(match.value.typeOf.iri!, false);
      typeNodes.value = await createFeatureTree(nodeShape.value, ViewMode.match);
      setupTrees(ViewMode.match);
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
  const matchAsQuery = match.value as Query;
  match.value = await QueryService.getQueryDisplayFromQuery(matchAsQuery, DisplayMode.ORIGINAL);
  edited.value = true;
  setOrderables();
  emit("updateMatch");
}
function onDeleteWhere() {
  emit("deleteWhere");
}

function setupTrees(mode: ViewMode) {
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
  await expandNode(node, ViewMode.match);
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
    match.value.orderBy = { property: [{ iri: value.iri, direction: value.direction }] } as OrderLimit;
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
