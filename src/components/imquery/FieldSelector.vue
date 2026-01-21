<template>
  <div class="column-selector">
    <div class="tree-container">
      <Tree
        v-model:expandedKeys="expandedKeys"
        v-model:selectionKeys="selectedKeys"
        :value="columns"
        lazy
        selectionMode="checkbox"
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
  flex: 1 1 auto;
  height: 100%;
}

.tree-container {
  flex: 1 1 auto; /* grow to fill column-selector */
  min-height: 0;
  overflow-y: auto; /* scroll only here */
}
</style>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import type { TreeNode } from "primevue/treenode";
import { Node } from "@/interfaces/AutoGen";
import { TreeSelectionKeys } from "primevue/tree";

const props = defineProps<{
  columns: TreeNode[];
}>();
const refreshColumns = defineModel<boolean>("refreshColumns", { default: true });
const expandedKeys = ref<Record<string, boolean>>({});
const emit = defineEmits<{
  (event: "node-selected", node: any): void;
  (event: "navigateTo", iri: string): void;
  (event: "loaded"): void;
}>();
const selectedKeys = ref<TreeSelectionKeys>({});

onMounted(async () => {
  await init();
});

watch(refreshColumns, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    await init();
  }
});

async function init() {}

function onNodeSelect(node: any) {
  if (node.selectable) {
    emit("node-selected", node);
  }
}
</script>
