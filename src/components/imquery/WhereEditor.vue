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
        <div class="right-panel">
          <div>Select features and properties from left</div>
          <div v-if="editingWhere" class="column-selector">
            <div
              v-for="section in sections"
              :key="section.key"
              :class="{ active: activeSection === section.key }"
              class="panel-section"
              @click="activeSection = section.key"
            >
              <div v-if="section.data">
                <div :class="section.key === activeSection ? 'section-header' : 'section-header-inactive'">
                  {{ section.title }}
                </div>
                <div class="column-selector">
                  <BooleanWhereEditor
                    v-if="section.data && section.data.where && dataModelType"
                    :key="section.data.where.uuid"
                    v-model:match="section.data"
                    v-model:where="section.data.where"
                    :baseType="baseType"
                    :dataModelType="dataModelType"
                    :index="0"
                    :parentIndex="0"
                    :rootBool="true"
                    @deleteWhere="emit('deleteWhere')"
                    @updateProperty="onUpdate"
                  />

                  <div v-if="section.key === 'main' && orderables && orderables.length > 0 && section.data && section.data.where">
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

                    <span v-if="section.key === 'main' && match.orderBy && !match.then">
                      <Button class="add-button" data-testid="add-test-button" label="Add further test on the results" @click="addTest" />
                    </span>
                    <Button class="add-button" data-testid="add-test-button" label="Add related feature" @click="emit('addLinked')" />
                  </div>
                  <div v-if="section.data">
                    <span class="keep-as-reference">Keep as reference</span>
                    <InputText v-model="section.data.as" type="text" @input="onInput" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="editingWhen" class="column-selector">
            <div>Add properties to test from left</div>
            <BooleanWhereEditor
              v-if="when && dataModelType"
              :key="'test'"
              v-model:parent="match"
              v-model:where="when"
              :baseType="baseType"
              :dataModelType="dataModelType"
              :index="0"
              :match="match"
              :parentIndex="0"
              :rootBool="true"
              @deleteWhere="emit('deleteWhenWhere')"
              @updateProperty="onUpdateWhen"
            />
          </div>
        </div>
      </SplitterPanel>
    </Splitter>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, Ref, ref } from "vue";

import { OrderLimit } from "@endeavour/vue-library";
import { IMFontAwesomeIcon } from "@endeavour/vue-library/components";
import { useCopyToClipboard } from "@endeavour/vue-library/composables";
import { Bool, DisplayMode } from "@endeavour/vue-library/enums";
import { type Node, type NodeShape, Query, type When } from "@endeavour/vue-library/models";
import { useDialogStore } from "@endeavour/vue-library/stores";

import Button from "primevue/button";
import type { TreeNode } from "primevue/treenode";

import BooleanWhereEditor from "@/components/imquery/BooleanWhereEditor.vue";
import { usePropertyTree } from "@/composables/usePropertyTree";
import { ViewMode } from "@/enums/PropertyViewMode";
import { getOrderable, getOrderOptions } from "@/helpers/QueryEditorMethods";
import { addFilter, addWhereToWhen, getOrderables, setMandatoryWheres } from "@/helpers/buildQuery";
import { DataModelService, QueryService } from "@/services";

interface Props {
  baseType: Node;
  depth: number;
  clauseIndex: number;
  showEditor: boolean;
  editCohort?: boolean;
  datasetEntry?: boolean;
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
const dataModelType: Ref<string | undefined> = ref();
const activeSection: Ref<string> = ref("main");
const sections = computed(() => [
  {
    key: "main",
    data: match.value,
    title: "Editing main"
  },
  {
    key: "then",
    data: match.value.then,
    title: "Editing test"
  }
]);

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
const selectedNodeKey = ref<Record<string, { checked: boolean; partialChecked?: boolean }>>({});
const { expandNode, createModeView, createFeatureTree, createRelatedTypeTree } = usePropertyTree();
const editMatchString: Ref<string> = ref("");
const { onCopy, onCopyError } = useCopyToClipboard(editMatchString);
const loading = ref(true);
const edited = ref(false);
const keepAs = inject("keepAs") as Ref<Record<string, Query>>;
const typeNodes: Ref<TreeNode[]> = ref([]);
const nodeShape: Ref<NodeShape | undefined> = ref();
const keepAsNode: Ref<string | undefined> = ref(match.value.as);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(async () => {
  await init();
});

function addTest() {
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
  if (match.value.as) keepAs.value[match.value.as] = match.value;
}

async function init() {
  loading.value = true;
  if (match.value.typeOf) {
    nodeShape.value = await DataModelService.getDataModelProperties(match.value.typeOf.iri!, false);
    typeNodes.value = await createFeatureTree(nodeShape.value, ViewMode.match);
    dataModelType.value = match.value.typeOf.iri;
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
      dataModelType.value = node.data.typeOf.iri;
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
    else addFilter(match.value, node, props.editingWhen);
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
.right-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.panel-section {
  position: relative;
  border: 3px solid transparent;
  padding: 1rem;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.panel-section:hover {
  background: var(--p-surface-hover);
}

.panel-section.active {
  border-color: var(--p-primary-color);
  background: var(--p-surface-50);
}
.section-header {
  padding: 0.75rem 1rem;
  font-weight: 700;
  color: var(--p-primary-color);
  background: var(--p-primary-10);
}

.section-header-inactive {
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
  background: var(--p-surface-100);
}
</style>
