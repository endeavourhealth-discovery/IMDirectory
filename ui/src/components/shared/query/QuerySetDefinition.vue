<template>
  <div v-if="loading" class="flex flex-row justify-content-center align-items-center loading-container">
    <ProgressSpinner />
  </div>
  <div v-else-if="queryDisplay.length" class="query-display-container">
    <Tree :value="queryDisplay" :expandedKeys="expandedKeys" class="tree-container">
      <template #default="{ node }: any">
        <IMViewerLink v-if="isObjectHasKeys(node.data, ['@set'])" :label="node.display" :html="true" :iri="node.data['@set']" />
        <IMViewerLink v-else-if="isObjectHasKeys(node.data, ['@type'])" :label="node.display" :html="true" :iri="node.data['@type']" />
        <IMViewerLink v-else-if="isObjectHasKeys(node.data, ['@id'])" :label="node.display" :html="true" :iri="node.data['@id']" />
        <div v-else v-html="node.display"></div>
      </template>
    </Tree>
  </div>
  <div v-else>No query definition found.</div>
</template>

<script setup lang="ts">
import { onMounted, Ref } from "vue";
import { ref, watch } from "vue";
import { QueryService } from "@/services";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { TreeNode } from "primevue/tree";
import { ITextQuery } from "@im-library/interfaces";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

interface Props {
  conceptIri: string;
}

const props = defineProps<Props>();

const loading = ref<boolean>(false);
const queryDisplay: Ref<TreeNode[]> = ref([] as TreeNode[]);
const expandedKeys = ref<any>({});

onMounted(async () => {
  await init();
});

watch(
  () => props.conceptIri,
  async () => {
    await init();
  }
);

async function getQueryDisplay(): Promise<ITextQuery[]> {
  const queryDefinition = await QueryService.getQueryDefinitionDisplay(props.conceptIri);
  return queryDefinition || ([] as ITextQuery[]);
}

function expandAll() {
  if (queryDisplay.value) {
    for (const node of queryDisplay.value) {
      expandNode(node);
    }
  }
  expandedKeys.value = { ...expandedKeys.value };
}

function expandNode(node: TreeNode) {
  expandedKeys.value[node.key!] = true;
  if (node.children && node.children.length) {
    for (let child of node.children) {
      expandNode(child);
    }
  }
}

async function init() {
  loading.value = true;
  queryDisplay.value = await getQueryDisplay();
  expandAll();
  loading.value = false;
}
</script>

<style scoped>
.p-tree {
  border: none;
}
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
