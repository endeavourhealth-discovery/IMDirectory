<template>
  <div v-if="!editMatch.is">
    <Dialog
      :visible="showEditor"
      modal
      closable
      :draggable="false"
      :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh' }"
      class="edit-match-dialog"
      maximizable
      @hide="onCancel"
    >
      <template #default>
        <div v-if="loading" class="flex w-full flex-auto flex-col flex-nowrap">
          <ProgressSpinner />
        </div>

        <Splitter class="h-full w-full" layout="horizontal">
          <SplitterPanel :size="25" class="column-selector">
            <div class="tree-scroll-container" @click.stop>
              <Tree
                v-if="activeTab === 'filter' || activeTab === 'test'"
                v-model:expandedKeys="expandedKeys"
                v-model:selectionKeys="selectedNodeKey"
                :loading="loading"
                :value="typeNodes"
                :lazy="true"
                icon="loading"
                selectionMode="single"
                @node-expand="onMatchNodeExpand"
                @node-select="onNodeSelect"
                :propagateSelectionUp="false"
                :propagateSelectionDown="false"
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
              <Tree
                v-if="activeTab === 'columns'"
                v-model:expandedKeys="expandedKeys"
                v-model:selectionKeys="selectedNodeKey"
                :loading="loading"
                :value="typeNodes"
                :lazy="true"
                icon="loading"
                selectionMode="single"
                @node-expand="onReturnNodeExpand"
                @node-select="onReturnNodeSelect"
                :propagateSelectionUp="false"
                :propagateSelectionDown="false"
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
          <SplitterPanel class="column-selector">
            <Tabs v-model:value="activeTab" class="match-editor-tabs">
              <TabList>
                <Tab value="filter">Filter</Tab>
                <Tab v-if="editMatch.then" value="test">Post ordering tests</Tab>
                <Tab value="columns">
                  <span v-if="!datasetEntry">Columns to keep</span>
                  <span v-else>Dataset items</span>
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel value="filter">
                  <div>
                    <MatchContentEditor
                      v-if="!editMatch.invalid && nodeShape"
                      :base-type="baseType"
                      :nodeShape="nodeShape"
                      v-model:match="editMatch"
                      :from="from"
                      :depth="0"
                      :index="0"
                      :key="'main'"
                      @deleteMatch="deleteMatch"
                      @updateMatch="onUpdate"
                      @add-test="activeTab = 'test'"
                      @addLinked="onAddLinked"
                    />
                  </div>
                </TabPanel>
                <TabPanel value="test">
                  <div v-if="editMatch.then">
                    <div>
                      <MatchContentEditor
                        v-if="!editMatch.invalid && nodeShape"
                        :base-type="baseType"
                        :nodeShape="nodeShape"
                        v-model:match="editMatch"
                        v-model:then="editMatch.then"
                        :from="from"
                        :depth="0"
                        :index="0"
                        :key="'then'"
                        @deleteMatch="deleteMatch"
                        @updateMatch="onUpdate"
                        @addLinked="onAddLinked"
                        @edit-main="onEditMain"
                      />
                    </div>
                  </div>
                </TabPanel>
                <TabPanel value="columns">
                  <div v-if="activeTab === 'columns'">
                    <span class="field">Select columns from left.</span>
                    <span v-if="!editMatch.path" style="font-style: italic">To select other columns, first define a filter</span>
                  </div>
                  <ReturnEditor v-if="editMatch.return" v-model:returns="editMatch.return" :match="editMatch" />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </SplitterPanel>
        </Splitter>
      </template>
      <template #footer>
        <div class="button-footer">
          <Button data-testid="cancel-edit-feature-button" label="Cancel" text @click="onCancel" />
          <Button v-if="edited" autofocus data-testid="save-feature-button" label="Save" @click="onSave" />
        </div>
      </template>
    </Dialog>
  </div>
  <div v-if="editMatch.is">
    <CohortEditor v-model:match="editMatch" :editMode="editCohort" @updateCohort="onSave" @updateClauses="onUpdateClauses" @cancel="onCancel" />
  </div>
</template>

<script lang="ts" setup>
import { isArrayHasLength } from "vue-library/helpers";
import type { Match, Node, TTIriRef, Return,NodeShape } from "vue-library/interfaces";
import { DisplayMode,Bool } from "vue-library/enums";
import { onMounted, Ref, ref, watch, inject } from "vue";
import { useCopyToClipboard } from "vue-library/composables";
import { EntityService, QueryService,DataModelService } from "@/services";
import { IM } from "vue-library/enums";
import type { TreeNode } from "primevue/treenode";
import { addReturn, addFilter, setDefiningProperty } from "@/helpers/buildQuery";
import CohortEditor from "@/components/imquery/CohortEditor.vue";
import { usePropertyTree, Mode } from "@/composables/usePropertyTree";
import { cloneDeep } from "lodash-es";
import { IMFontAwesomeIcon } from "vue-library/components";
import MatchContentEditor from "@/components/imquery/MatchContentEditor.vue";
import Swal from "sweetalert2";
import ReturnEditor from "@/components/imquery/ReturnEditor.vue";

interface Props {
  baseType: Node;
  match: Match;
  from?: Match;
  depth: number;
  clauseIndex: number;
  showEditor: boolean;
  editCohort?: boolean;
  datasetEntry?: boolean;
}

const props = defineProps<Props>();
const editMatch: Ref<Match> = ref(cloneDeep(props.match));
const emit = defineEmits<{
  (event: "saveChanges", match: Match): void;
  (event: "cancel"): void;
  (event: "deleteMatch"): void;
  (event: "addTest", match: Match): void;
  (event: "addLinked", match: Match): void;
}>();
const activeTab = ref("filter");
const expandedKeys = ref<Record<string, boolean>>({});
const expandedReturnKeys = ref<Record<string, boolean>>({});
const selectedNodeKey = ref<Record<string, { checked: boolean; partialChecked?: boolean }>>({});
const { expandNode, createModeView, getTypeNode, createFeatureTree } = usePropertyTree();
const editMatchString: Ref<string> = ref("");
const { onCopy, onCopyError } = useCopyToClipboard(editMatchString);
const loading = ref(true);
const edited = ref(false);
const initialized = ref(false);
const typeNodes: Ref<TreeNode[]> = ref([]);
const keepAs = inject("keepAs") as Ref<Match[]>;
const nodeShape: Ref<NodeShape | undefined> = ref();

onMounted(async () => {
  await init();
});

watch(activeTab, async () => {
  if (!initialized.value) {
    initialized.value = true;
  } else {
    setupTrees(activeTab.value === "columns" ? "return" : "match");
    expandedKeys.value = { [typeNodes.value[0].key]: true };
    selectedNodeKey.value = {};
  }
});

async function init() {
  loading.value = true;
  nodeShape.value = await DataModelService.getDataModelProperties(
    editMatch.value.typeOf ? editMatch.value.typeOf.iri! : props.baseType.iri!,
    false,
    !!editMatch.value.typeOf
  );
  typeNodes.value = await createFeatureTree(nodeShape.value, "match");
  setupTrees(props.datasetEntry ? "return" : "match");
  expandedKeys.value = { [typeNodes.value[0].key]: true };
  selectedNodeKey.value = {};
  activeTab.value = props.datasetEntry ? "columns" : "filter";
  loading.value = false;
}

async function onNodeSelect(node: any) {
  if (!editMatch.value.typeOf) {
    if (node.data.typeOf) {
      editMatch.value.typeOf = { iri: node.data.typeOf };
      nodeShape.value = await DataModelService.getDataModelProperties(editMatch.value.typeOf.iri!, false, true);
      typeNodes.value = await createFeatureTree(nodeShape.value, "match");
      setupTrees("match");
      if (!expandedKeys.value[typeNodes.value[0].key]) {
        expandedKeys.value[typeNodes.value[0].key] = true;
      }
      setDefiningProperty(editMatch.value, nodeShape.value);
    }
  }
  if (node.type === "property") {
    addFilter(editMatch.value, node);
  }
  editMatch.value = await QueryService.getQueryDisplayFromQuery(editMatch.value, DisplayMode.ORIGINAL);
  edited.value = true;
}

function setupTrees(mode: Mode) {
  createModeView(typeNodes.value, mode);
  if (typeNodes.value[0].children && typeNodes.value[0].children.length === 0) expandNode(typeNodes.value[0], mode);
}
function onUpdate() {
  edited.value = true;
}
function onDeleteThen() {
  delete editMatch.value.then;
}
async function onReturnNodeSelect(node: any) {
  edited.value = true;
  if (!editMatch.value.typeOf) {
    if (node.data.typeOf) {
      editMatch.value.typeOf = { iri: node.data.typeOf };
      nodeShape.value = await DataModelService.getDataModelProperties(editMatch.value.typeOf.iri!, false, true);
      typeNodes.value = await createFeatureTree(nodeShape.value, "return");
      setupTrees("return");
      if (!expandedKeys.value[typeNodes.value[0].key]) {
        expandedKeys.value[typeNodes.value[0].key] = true;
      }
    }
  }
  addReturn(editMatch.value, node);
  setDefiningProperty(editMatch.value, nodeShape.value!);
  editMatch.value = await QueryService.getQueryDisplayFromQuery(editMatch.value, DisplayMode.ORIGINAL);
}
async function onReturnNodeExpand(node: any) {
  await expandNode(node, "return");
}

async function onMatchNodeExpand(node: any) {
  await expandNode(node, "match");
}

function deleteMatch() {
  emit("deleteMatch");
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

async function getFunctionTemplates() {
  const iri = editMatch.value?.typeOf?.iri;
  if (iri) {
    const entity = await EntityService.getPartialEntity(iri, [IM.FUNCTION_TEMPLATE]);
    if (isArrayHasLength(entity[IM.FUNCTION_TEMPLATE])) {
      const iris = entity[IM.FUNCTION_TEMPLATE].map((functionTemplate: TTIriRef) => functionTemplate.iri);
      return await EntityService.getPartialEntities(iris, []);
    }
  }
}

async function onUpdateClauses(match: Match) {
  editMatch.value = match;
  await onSave();
}

async function onSave() {
  const valid = await saveChanges();
  if (valid) {
    emit("saveChanges", editMatch.value);
  }
}

async function showInvalid(match: Match) {
  await Swal.fire({
    icon: "warning",
    title: "Warning",
    text: match.errorMessage + ". Use filter tab to edit.",
    confirmButtonText: "Close",
    confirmButtonColor: "#689F38"
  });
}

async function saveChanges(): Promise<boolean> {
  editMatch.value.keepClauses = keepAs.value;
  const matchCheck = await QueryService.validateQuery(editMatch.value);
  delete editMatch.value.keepClauses;
  if (matchCheck.invalid) {
    editMatch.value.draft = true;
    await showInvalid(matchCheck);
    return false;
  } else {
    editMatch.value = await QueryService.getQueryDisplayFromQuery(editMatch.value, DisplayMode.ORIGINAL);
    return true;
  }
}
function onCancel() {
  emit("cancel");
}
function onEditMain() {
  activeTab.value = "filter";
}

function onAddFunctionProperty(args: { property: string; value: any }) {
  if (args.property === "orderBy") {
    editMatch.value!.orderBy = args.value;
  }
}
</script>

<style scoped>
.match-editor-tabs {
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  min-height: 0;
  overflow-y: auto;
}
.tree-scroll-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}
.column-selector {
  max-height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
}
.where-container {
  display: flex;
  flex-flow: column;
  gap: 1rem;
}
.field {
  padding-right: 0.2rem;
}

.edit-match-dialog {
  background-color: var(--p-surface-section);
  min-height: 90vh;
  min-width: 90vh;
}
.test-selector {
  background-color: rgb(16, 185, 129);
  color: white;
}
.test-dropdown {
  color: white;
}
</style>
