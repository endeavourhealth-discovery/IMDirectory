<template>
  <Dialog
    :visible="true"
    modal
    :draggable="false"
    :style="{ width: '80vw', height: '80vh', minWidth: '80vw', minHeight: '80vh' }"
    class="edit-match-dialog"
    maximizable
    @close="onCancel"
  >
    <template #header>
      <div>
        <strong>Property selector:</strong>
      </div>
    </template>
    <div>Navigate the tree to the property you want to add and click</div>
    <div id="tree-container" @click.stop>
      <Tree
        v-model:expandedKeys="expandedKeys"
        :selectionKeys="selectedNodeKey"
        :loading="loading"
        :value="rootNodes"
        :lazy="true"
        icon="loading"
        @node-expand="expandNode"
        @nodeSelect="onNodeSelect"
        selectionMode="single"
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
    <template #footer>
      <div class="button-footer">
        <Button data-testid="cancel-edit-feature-button" label="Cancel" text @click="onCancel" />
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import type { TreeNode } from "primevue/treenode";
import { Node } from "@/interfaces/AutoGen";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { TreeSelectionKeys } from "primevue/tree";
import setupPropertyTree from "@/composables/setupPropertyTree";
import { isEqual } from "lodash-es";

const visible = defineModel<boolean>("visible");
const props = defineProps<{
  baseType: Node;
  rootNodes: TreeNode[];
}>();
const expandedKeys = ref<Record<string, boolean>>({});

const emit = defineEmits<{
  (event: "node-selected", node: any): void;
  (event: "navigateTo", iri: string): void;
  (event: "cancel"): void;
}>();
const { expandNode, loading } = setupPropertyTree();
const selectedNodeKey = ref<TreeSelectionKeys | undefined>(undefined);
watch(
  () => props.rootNodes,
  (newValue, oldValue) => {
    if (!isEqual(newValue, oldValue)) {
      expandedKeys.value = {};
      const preExpanded = newValue?.[newValue.length - 1]?.key;
      if (preExpanded) {
        expandedKeys.value[preExpanded] = true;
      }
    }
  },
  { deep: true, immediate: true }
);

function onNodeSelect(node: any) {
  if (node.selectable) {
    emit("node-selected", node);
  }
}
function onCancel() {
  emit("cancel");
}
</script>

<style scoped>
#tree-container {
  width: 100%;
  height: 70rem;
  position: relative;
  overflow: auto;
}
.tree-node-label {
  padding-right: 1rem;
}

.progress-spinner {
  width: 1.25em !important;
  height: 1.25em !important;
  flex: 0 0 auto;
}
</style>
