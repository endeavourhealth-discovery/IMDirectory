<template>
  <div class="query-definition-container">
    <div v-if="!queryDisplay">No query definition found.</div>

    <div v-else class="query-display-container">
      <Tree :value="queryDisplay as unknown as TreeNode[]" :expandedKeys="expandedKeys" class="tree-container">
        <template #default="{ node }">
          <div v-if="node.value">{{ node.label + " - " + node.value }}</div>
          <div v-else>{{ node.label }}</div>
        </template>
      </Tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { QueryObject } from "@/im_library/interfaces";
import { QueryService } from "@/im_library/services";
import { TreeNode } from "primevue/tree";

const props = defineProps({ conceptIri: { type: String, required: true } });

const queryDisplay = ref<QueryObject[]>();
let expandedKeys = ref<any>({});

onMounted(async () => {
  await init();
});

watch(
  () => props.conceptIri,
  async () => {
    await init();
  }
);

async function getQueryDisplay() {
  queryDisplay.value = (await QueryService.getQueryObjectByIri(props.conceptIri)).children;
}

function expandAll() {
  if (queryDisplay.value) {
    for (const node of queryDisplay.value) {
      expandNode(node);
    }
  }
  expandedKeys.value = { ...expandedKeys.value };
}

function expandNode(node: QueryObject) {
  expandedKeys.value[node.key] = true;
  if (node.children && node.children.length) {
    for (let child of node.children) {
      expandNode(child);
    }
  }
}

async function init() {
  await getQueryDisplay();
  expandAll();
}
</script>

<style scoped>
.tree-container,
.json {
  height: 100%;
  overflow: auto;
  width: 100%;
}

.query-display-container {
  display: flex;
}

.query-definition-container {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
}
</style>
