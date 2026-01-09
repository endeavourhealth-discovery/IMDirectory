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
        selectionMode="checkbox"
        @node-expand="expandNode"
        @nodeSelect="nodeSelect"
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
  min-height: 0;
  max-height: 70vh;
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
import { usePropertyTree } from "@/composables/usePropertyTree";
import { getOrderable, getOrderOptions } from "@/helpers/QueryEditorMethods";

const visible = defineModel<boolean>("visible");
const props = defineProps<{
  baseType: Node;
}>();
const match = defineModel<Match>("match", { default: {} });
const refreshColumns = defineModel<boolean>("refreshColumns", { default: true });
const expandedKeys = ref<Record<string, boolean>>({});
const emit = defineEmits<{
  (event: "node-selected", node: any): void;
  (event: "navigateTo", iri: string): void;
  (event: "loaded"): void;
}>();
const { expandNode, loading, initialiseSelected } = usePropertyTree();
const selectedKeys = ref<TreeSelectionKeys>({});

const rootNodes: Ref<TreeNode[]> = ref([]);
const { getRootNodes, getDefiningProperty, createFeatureTree, getOrderables } = usePropertyTree();

onMounted(async () => {
  await init();
});

watch(refreshColumns, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    await init();
  }
});

async function init() {
  loading.value = true;
  const tree = await createFeatureTree(props.baseType, true);
  if (tree[0].children) {
    rootNodes.value = tree[0].children;
  }
  await initialiseSelected(rootNodes.value, expandedKeys.value, selectedKeys.value, match.value);
  loading.value = false;
  emit("loaded");
}

function nodeExpand() {}
function nodeSelect() {}
function onNodeSelect(node: any) {
  if (node.selectable) {
    emit("node-selected", node);
  }
}
</script>
