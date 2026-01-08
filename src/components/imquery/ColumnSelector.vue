<template>
  <div :style="{ width: '80vw', height: '80vh', minWidth: '80vw', minHeight: '80vh' }" class="edit-match-dialog">
    <template>
      <div>
        <strong>Column selector:</strong>
      </div>
    </template>
    <div>Navigate the tree to the properties you want to add and select</div>
    <div id="tree-container" @click.stop>
      <span>{{ selectedKeys }}</span>
      <Tree
        v-model:expandedKeys="expandedKeys"
        v-model:selectionKeys="selectedKeys"
        :loading="loading"
        :value="rootNodes"
        :lazy="true"
        icon="loading"
        selectionMode="checkbox"
        @node-expand="expandNode"
        @nodeSelect="nodeSelect"
        :propagateSelectionUp="true"
      >
      </Tree>
    </div>
    <template>
      <div class="button-footer">
        <Button data-testid="cancel-edit-feature-button" label="Cancel" text @click="onCancel" />
        <Button label="Select" icon="fa-solid fa-check" class="p-button-primary" @click="" data-testid="ecl-ok-button" />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, Ref, ref, watch } from "vue";
import type { TreeNode } from "primevue/treenode";
import { Node, Match, Path } from "@/interfaces/AutoGen";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { TreeSelectionKeys } from "primevue/tree";
import { usePropertyTree } from "@/composables/usePropertyTree";
import { getOrderable, getOrderOptions } from "@/helpers/QueryEditorMethods";

const visible = defineModel<boolean>("visible");
const props = defineProps<{
  baseType: Node;
}>();
const match = defineModel<Match>("match", { default: {} });
const expandedKeys = ref<Record<string, boolean>>({});
const emit = defineEmits<{
  (event: "node-selected", node: any): void;
  (event: "navigateTo", iri: string): void;
  (event: "cancelColumnGroup"): void;
}>();
const { expandNode, loading, initialiseSelected } = usePropertyTree();
const selectedKeys = ref<TreeSelectionKeys>({});

const rootNodes: Ref<TreeNode[]> = ref([]);
const { getRootNodes, getDefiningProperty, createFeatureTree, getOrderables } = usePropertyTree();

onMounted(async () => {
  await init();
  initialiseSelected(rootNodes.value, expandedKeys.value, selectedKeys.value, match.value);
});

async function init() {
  loading.value = true;
  const tree = await createFeatureTree(props.baseType, true);
  if (tree[0].children) {
    rootNodes.value = tree[0].children;
  }
  loading.value = false;
}

function nodeExpand() {}
function nodeSelect() {}
function onNodeSelect(node: any) {
  if (node.selectable) {
    emit("node-selected", node);
  }
}
function onCancel() {
  emit("cancelColumnGroup");
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
