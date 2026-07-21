<template>
  <Dialog
    :draggable="false"
    :style="{ width: '65vw', height: '65vh', minWidth: '65vw', minHeight: '65vh' }"
    :visible="showPropertySelector"
    closable
    maximizable
    modal
    @hide="onCancel"
  >
    <template #default>
      <div class="tree-scroll-container" @click.stop>
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
          @node-expand="onReturnNodeExpand"
          @node-select="onReturnNodeSelect"
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
    </template>
    <template #footer>
      <div class="button-footer">
        <Button data-testid="cancel-edit-feature-button" label="Cancel" text @click="onCancel" />
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { onMounted, Ref, ref } from "vue";

import { IMFontAwesomeIcon } from "@endeavour/vue-library/components";
import { useCopyToClipboard } from "@endeavour/vue-library/composables";
import type { Match, Node, NodeShape } from "@endeavour/vue-library/interfaces";

import type { TreeNode } from "primevue/treenode";

import { Mode, usePropertyTree } from "@/composables/usePropertyTree";
import { DataModelService } from "@/services";

interface Props {
  baseType: Node;
  match: Match;

  showPropertySelector: boolean;
}

const props = defineProps<Props>();
const showPropertySelector = defineModel<boolean>("showPropertySelector", { default: false });
const match = defineModel<Match>("match", { default: {} });
const expandedKeys = ref<Record<string, boolean>>({});
const selectedNodeKey = ref<Record<string, { checked: boolean; partialChecked?: boolean }>>({});
const { expandNode, createModeView, createFeatureTree } = usePropertyTree();
const editMatchString: Ref<string> = ref("");
const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "selectedProperty", node: TreeNode): void;
}>();
const { onCopy, onCopyError } = useCopyToClipboard(editMatchString);
const loading = ref(true);
const typeNodes: Ref<TreeNode[]> = ref([]);
const nodeShape: Ref<NodeShape | undefined> = ref();

onMounted(async () => {
  await init();
});

async function init() {
  loading.value = true;
  nodeShape.value = await DataModelService.getDataModelProperties(props.match.typeOf ? props.match.typeOf.iri! : props.baseType.iri!, false);
  typeNodes.value = await createFeatureTree(nodeShape.value, "return");
  setupTrees("return");
  if (!props.match.any) expandedKeys.value = { [typeNodes.value[0].key]: true };
  selectedNodeKey.value = {};
  loading.value = false;
}

function setupTrees(mode: Mode) {
  createModeView(typeNodes.value, mode);
  if (typeNodes.value[0].children && typeNodes.value[0].children.length === 0) expandNode(typeNodes.value[0], mode);
}

async function onReturnNodeSelect(node: any) {
  if (!match.value.typeOf) {
    if (node.data.type) {
      match.value.typeOf = { iri: node.data.typeOf };
      nodeShape.value = await DataModelService.getDataModelProperties(match.value.typeOf.iri!, false);
      typeNodes.value = await createFeatureTree(nodeShape.value, "return");
      setupTrees("return");
      if (!expandedKeys.value[typeNodes.value[0].key]) {
        expandedKeys.value[typeNodes.value[0].key] = true;
      }
    }
  }
  emit("selectedProperty", node);
}
async function onReturnNodeExpand(node: any) {
  await expandNode(node, "return");
}

async function onMatchNodeExpand(node: any) {
  await expandNode(node, "match");
}
function onCancel() {
  showPropertySelector.value = false;
  emit("cancel");
}
</script>

<style scoped>
.tree-scroll-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}
</style>
