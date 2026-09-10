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
import { type Node, type NodeShape, Query } from "@endeavour/vue-library/models";

import type { TreeNode } from "primevue/treenode";

import { useReturnTree } from "@/composables/useReturnTrees";

interface Props {
  baseType: Node;
  match: Query;
  showPropertySelector: boolean;
}

const props = defineProps<Props>();
const showPropertySelector = defineModel<boolean>("showPropertySelector", { default: false });
const match = defineModel<Query>("match", { default: {} });
const expandedKeys = ref<Record<string, boolean>>({});
const selectedNodeKey = ref<Record<string, { checked: boolean; partialChecked?: boolean }>>({});
const { expandNode, createReturnTree } = useReturnTree();
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
  typeNodes.value = await createReturnTree(match.value, props.baseType);
  if (!props.match.and) expandedKeys.value = { [typeNodes.value[0].key]: true };
  selectedNodeKey.value = {};
  loading.value = false;
}

async function onReturnNodeSelect(node: TreeNode) {
  emit("selectedProperty", node);
}
async function onReturnNodeExpand(node: any) {
  await expandNode(node);
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
