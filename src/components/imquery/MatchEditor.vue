<template>
  <div v-if="!editMatch.is">
    <Dialog
      v-model:visible="showMatchEditor"
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
                @node-expand="expandNode"
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
                v-model:selectionKeys="selectedReturnNodeKey"
                :loading="loading"
                :value="returnNodes"
                :lazy="true"
                icon="loading"
                selectionMode="single"
                @node-expand="expandNode"
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
                <Tab value="filter">Conditions</Tab>
                <Tab v-if="editMatch.then" value="test">Post ordering tests</Tab>
                <Tab value="columns">Return columns</Tab>
              </TabList>
              <TabPanels>
                <TabPanel value="filter">
                  <div>
                    <MatchContentEditor
                      v-if="!editMatch.invalid"
                      :base-type="baseType"
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
                        v-if="!editMatch.invalid"
                        :base-type="baseType"
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
  <div v-if="editMatch.is" class="where-container">
    <CohortEditor v-model:match="editMatch" :editMode="editCohort" @updateCohort="onSave" @cancel="onCancel" />
  </div>
</template>

<script lang="ts" setup>
import { isArrayHasLength } from "vue-library/helpers";
import { Match, Node, TTIriRef, Return } from "vue-library/interfaces";
import { DisplayMode } from "vue-library/enums";
import { onMounted, Ref, ref, watch, inject } from "vue";
import { useCopyToClipboard } from "vue-library/composables";
import { EntityService, QueryService } from "@/services";
import { IM } from "vue-library/enums";
import type { TreeNode } from "primevue/treenode";
import { setDefiningProperty, setPathGetNodeRef } from "@/helpers/buildQuery";
import CohortEditor from "@/components/imquery/CohortEditor.vue";
import { usePropertyTree } from "@/composables/usePropertyTree";
import { cloneDeep } from "lodash-es";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import MatchContentEditor from "@/components/imquery/MatchContentEditor.vue";
import { findNodeByKey } from "@/helpers/TreeHelper";
import MatchContentDisplay from "@/components/imquery/MatchContentDisplay.vue";
import Swal from "sweetalert2";
import ReturnEditor from "@/components/imquery/ReturnEditor.vue";
import BooleanWhereEditor from "@/components/imquery/BooleanWhereEditor.vue";
interface Props {
  baseType: Node;
  match: Match;
  from?: Match;
  depth: number;
  clauseIndex: number;
  editCohort?: boolean;
}

const props = defineProps<Props>();
const showMatchEditor = defineModel<boolean>("showMatchEditor", { default: false });
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
const selectedReturnNodeKey = ref<Record<string, { checked: boolean; partialChecked?: boolean }>>({});
const { expandNode, addWhereFromTree, findNodesFromMatch, findReturnNodesFromMatch } = usePropertyTree();
const editMatchString: Ref<string> = ref("");
const { onCopy, onCopyError } = useCopyToClipboard(editMatchString);
const loading = ref(true);
const rootNodes = inject("featureTree") as Ref<TreeNode[]>;
const edited = ref(false);
const initialized = ref(false);
const typeNodes: Ref<TreeNode[]> = ref(rootNodes.value);
const returnNodes: Ref<TreeNode[]> = ref(rootNodes.value);
const keepAs = inject("keepAs") as Ref<Match[]>;

onMounted(async () => {
  await init();
});

async function init() {
  loading.value = true;
  typeNodes.value = await findNodesFromMatch(editMatch.value, rootNodes.value);
  expandedKeys.value = { [typeNodes.value[0].key]: true };
  returnNodes.value = await findReturnNodesFromMatch(editMatch.value, rootNodes.value);
  expandedReturnKeys.value = { [returnNodes.value[0].key]: true };
  loading.value = false;
  initialized.value = true;
}

async function onNodeSelect(node: any) {
  if (node.data.path) {
    setPathGetNodeRef(editMatch.value, node.data.path);
    addWhereFromTree(editMatch.value, node);
    const parentNode = findNodeByKey(rootNodes.value, node.data.parentKey);
    if (parentNode) setDefiningProperty(editMatch.value, parentNode, node.data.path);
  } else addWhereFromTree(editMatch.value, node);
  editMatch.value.invalid = false;
  editMatch.value = await QueryService.getQueryDisplayFromQuery(editMatch.value, DisplayMode.ORIGINAL);
  edited.value = true;
  await setupTrees();
}

async function setupTrees() {
  typeNodes.value = await findNodesFromMatch(editMatch.value, rootNodes.value);
  expandedKeys.value = { [typeNodes.value[0].key]: true };
  returnNodes.value = await findReturnNodesFromMatch(editMatch.value, rootNodes.value);
  expandedReturnKeys.value = { [returnNodes.value[0].key]: true };
  selectedNodeKey.value = {};
}
function onUpdate() {
  edited.value = true;
}
function onDeleteThen() {
  delete editMatch.value.then;
}
async function onReturnNodeSelect(node: any) {
  edited.value = true;
  if (node.data.iri) {
    const nodeRef = setPathGetNodeRef(editMatch.value, node.data.path, true);
    const ret = { nodeRef: nodeRef, iri: node.data.iri, name: node.label, as: node.label } as Return;
    if (!editMatch.value.return) editMatch.value.return = [];
    editMatch.value.return.push(ret);
    editMatch.value.invalid = false;
    editMatch.value = await QueryService.getQueryDisplayFromQuery(editMatch.value, DisplayMode.ORIGINAL);
  }
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

async function onSave() {
  const valid = await saveChanges();
  if (valid) {
    showMatchEditor.value = false;
    emit("saveChanges", editMatch.value);
  }
}

async function showInvalid(match: Match) {
  await Swal.fire({
    icon: "warning",
    title: "Warning",
    text: match.errorMessage,
    confirmButtonText: "Close",
    confirmButtonColor: "#689F38"
  });
}

async function saveChanges(): Promise<boolean> {
  editMatch.value.keepClauses = keepAs.value;
  const matchCheck = await QueryService.validateQuery(editMatch.value);
  delete editMatch.value.keepClauses;
  if (matchCheck.invalid) {
    await showInvalid(editMatch.value);
    return false;
  } else {
    editMatch.value = await QueryService.getQueryDisplayFromQuery(editMatch.value, DisplayMode.ORIGINAL);
    return true;
  }
}
function onCancel() {
  showMatchEditor.value = false;
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
