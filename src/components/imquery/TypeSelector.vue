<template>
  <div class="column-selector">
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>
    <div v-else class="tree-container">
      <Tree
        v-model:expandedKeys="expandedKeys"
        v-model:selectionKeys="selectedKeys"
        :loading="loading"
        :value="rootNodes"
        lazy
        selectionMode="single"
        @node-expand="onNodeExpand"
        @nodeSelect="onNodeSelect"
        :propagateSelectionUp="true"
      />
    </div>
  </div>
</template>

<style scoped>
.column-selector {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto; /* fill available space */
  height: 100%;
}

.tree-container {
  flex: 1 1 auto; /* grow to fill column-selector */
  min-height: 0;
  overflow-y: auto; /* scroll only here */
}
</style>

<script lang="ts" setup>
import { nextTick, onMounted, Ref, ref, watch } from "vue";
import type { TreeNode } from "primevue/treenode";
import { Node, Match, Path } from "@/interfaces/AutoGen";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { TreeSelectionKeys } from "primevue/tree";
import { useReturnTrees } from "@/composables/useReturnTrees";
import { getOrderable, getOrderOptions } from "@/helpers/QueryEditorMethods";

const visible = defineModel<boolean>("visible");
const props = defineProps<{
  baseType: Node;
}>();
const match = defineModel<Match>("match", { default: {} });
const columns = defineModel<TreeNode[]>("columns", { default: [] });
const refreshColumns = defineModel<boolean>("refreshColumns", { default: true });
const expandedKeys = ref<Record<string, boolean>>({});
const emit = defineEmits<{
  (event: "node-selected", node: any): void;
  (event: "navigateTo", iri: string): void;
  (event: "loaded"): void;
}>();
const { expandNode, loading, createReturnTree } = useReturnTrees();
const selectedKeys = ref<TreeSelectionKeys>({});

const rootNodes: Ref<TreeNode[]> = ref([]);

onMounted(async () => {
  await init();
});

async function onNodeExpand(node: TreeNode) {
  columns.value = await expandNode(props.baseType, node);
}
watch(refreshColumns, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    await init();
  }
});

async function init() {
  loading.value = true;
  const tree = await createReturnTree(props.baseType);
  if (tree[0].children) {
    rootNodes.value = tree[0].children;
  }
  loading.value = false;
  emit("loaded");
}

function nodeExpand() {}
const onNodeSelect = (node: any) => {
  console.log(node);
};
</script>
