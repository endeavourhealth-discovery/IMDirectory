<template>
  <div v-if="!match.is">
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
            </div>
          </SplitterPanel>
          <SplitterPanel class="column-selector">
            <div v-if="match.nodeRef">
              <span>From: </span>
              <MatchContentDisplay :match="from!" :depth="0" :clauseIndex="0" :parentOperator="Bool.step" />
              <div>Test for the following:</div>
            </div>
            <div v-else>With the following conditions:</div>
            <div>
              <MatchContentEditor
                v-if="!match.invalid"
                :base-type="baseType"
                v-model:match="match"
                :from="from"
                :depth="0"
                :index="0"
                @deleteMatch="deleteMatch"
                @addTest="addThen"
                @addLinked="addLinked"
                @updateMatch="onUpdate"
              />
            </div>
          </SplitterPanel>
        </Splitter>
      </template>
      <template #footer>
        <div class="button-footer">
          <Button data-testid="cancel-edit-feature-button" label="Cancel" text @click="onCancel" />
          <Button v-if="edited && match" autofocus data-testid="save-feature-button" label="Save" @click="onSave" />
        </div>
      </template>
    </Dialog>
  </div>
  <div v-if="match.is" class="where-container">
    <CohortEditor v-model:match="match" :editMode="editCohort" @updateCohort="onSave" @cancel="onCancel" />
  </div>
</template>

<script lang="ts" setup>
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { Bool, DisplayMode, Match, Node, TTIriRef } from "@/interfaces/AutoGen";
import { onMounted, Ref, ref, watch, inject } from "vue";
import { useCopyToClipboard } from "@/composables/useCopyToClipboard";
import { EntityService, QueryService } from "@/services";
import { IM } from "@/vocabulary";
import type { TreeNode } from "primevue/treenode";
import { setDefiningProperty, setPathGetNodeRef, createNodeVariable } from "@/helpers/buildQuery";
import CohortEditor from "@/components/imquery/CohortEditor.vue";
import { usePropertyTree } from "@/composables/usePropertyTree";
import { cloneDeep } from "lodash-es";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import MatchContentEditor from "@/components/imquery/MatchContentEditor.vue";
import { findNodeByKey } from "@/helpers/TreeHelper";
import MatchContentDisplay from "@/components/imquery/MatchContentDisplay.vue";
import Swal from "sweetalert2";
interface Props {
  baseType: Node;
  from?: Match;
  depth: number;
  clauseIndex: number;
  editCohort?: boolean;
}

const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const showMatchEditor = defineModel<boolean>("showMatchEditor", { default: false });
const emit = defineEmits<{
  (event: "saveChanges", match: Match): void;
  (event: "cancel"): void;
  (event: "deleteMatch"): void;
  (event: "addTest"): void;
  (event: "addLinked"): void;
  (event: "updateMatch"): void;
}>();
const expandedKeys = ref<Record<string, boolean>>({});
const selectedNodeKey = ref<Record<string, { checked: boolean; partialChecked?: boolean }>>({});
const { expandNode, addWhereFromTree, findNodeFromFlatPath, findNodeFromMatchPath } = usePropertyTree();
const editMatchString: Ref<string> = ref("");
const { onCopy, onCopyError } = useCopyToClipboard(editMatchString);
const loading = ref(true);
const rootNodes = inject("featureTree") as Ref<TreeNode[]>;
const edited = ref(false);
const initialized = ref(false);
const typeNodes: Ref<TreeNode[]> = ref(rootNodes.value);

onMounted(async () => {
  await init();
});

watch(expandedKeys.value, () => {
  console.log(expandedKeys.value);
});

async function init() {
  loading.value = true;
  if (match.value.path) {
    const nodes = await findNodeFromMatchPath(match.value, rootNodes.value);
    if (nodes) typeNodes.value = nodes;
  }
  expandedKeys.value = { [typeNodes.value[0].key]: true };
  loading.value = false;
  initialized.value = true;
}

async function onNodeSelect(node: any) {
  if (node.data.path) {
    setPathGetNodeRef(match.value, node.data.path);
    addWhereFromTree(match.value, node);
    const parentNode = findNodeByKey(rootNodes.value, node.data.parentKey);
    if (parentNode) setDefiningProperty(match.value, parentNode, node.data.path);
  } else addWhereFromTree(match.value, node);
  match.value = await QueryService.getQueryDisplayFromQuery(match.value, DisplayMode.ORIGINAL);
  match.value.invalid = false;
  edited.value = true;
  const nodes = findNodeFromFlatPath(node.data.path, rootNodes.value);
  if (nodes) {
    typeNodes.value = nodes;
    expandedKeys.value = { [nodes[0].key]: true };
  }
  selectedNodeKey.value = {};
}
function onUpdate() {
  edited.value = true;
  emit("updateMatch");
}
function deleteMatch() {
  emit("deleteMatch");
}

function addThen() {
  emit("addTest");
}

function addLinked() {
  emit("addLinked");
}

async function getFunctionTemplates() {
  const iri = match.value?.typeOf?.iri;
  if (iri) {
    const entity = await EntityService.getPartialEntity(iri, [IM.FUNCTION_TEMPLATE]);
    if (isArrayHasLength(entity[IM.FUNCTION_TEMPLATE])) {
      const iris = entity[IM.FUNCTION_TEMPLATE].map((functionTemplate: TTIriRef) => functionTemplate.iri);
      return await EntityService.getPartialEntities(iris, []);
    }
  }
}

async function onSave() {
  const matchCheck = await QueryService.validateQuery(match.value);
  if (matchCheck.invalid) {
    await Swal.fire({
      icon: "warning",
      title: "Warning",
      text: matchCheck.errorMessage,
      confirmButtonText: "Close",
      confirmButtonColor: "#689F38"
    });
  } else {
    match.value = await QueryService.getQueryDisplayFromQuery(match.value, DisplayMode.ORIGINAL);
    showMatchEditor.value = false;
    emit("saveChanges", match.value);
  }
}
function onCancel() {
  emit("cancel");
  showMatchEditor.value = false;
}

function onAddFunctionProperty(args: { property: string; value: any }) {
  if (args.property === "orderBy") {
    match.value!.orderBy = args.value;
  }
}
</script>

<style scoped>
.tree-scroll-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}
.column-selector {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.where-container {
  display: flex;
  flex-flow: column;
  gap: 1rem;
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
