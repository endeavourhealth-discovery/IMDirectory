<template>
  <div v-if="!queryDisplay">No query definition found.</div>

  <div v-else class="query-display-container">
    <Tree :value="queryDisplay" :expandedKeys="expandedKeys" class="tree-container">
      <template #default="{ node }">{{ node.value ? node.label + " - " + node.value : node.label }} </template>
    </Tree>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { ref, watch } from "vue";
import { QueryObject } from "@/im_library/interfaces";
import { QueryService } from "@/im_library/services";

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
</style>
