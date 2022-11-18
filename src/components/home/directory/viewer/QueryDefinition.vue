<template>
  <div class="query-definition-container">
    <div v-if="!queryDisplay">No query definition found.</div>

    <div v-else class="query-display-container">
      <Tree :value="queryDisplay as unknown as TreeNode[]" :expandedKeys="expandedKeys" class="tree-container">
        <template #default="{ node }">{{ node.value ? node.label + " - " + node.value : node.label }} </template>
      </Tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { ref, watch } from "vue";
import { QueryObject } from "im-library/dist/types/interfaces/Interfaces";
import { Services, Vocabulary } from "im-library";
import axios from "axios";
import { TreeNode } from "primevue/tree";
const { QueryService } = Services;

const props = defineProps({ conceptIri: { type: String, required: true } });

const queryService = new QueryService(axios);
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
  queryDisplay.value = (await queryService.getQueryObjectByIri(props.conceptIri)).children;
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
