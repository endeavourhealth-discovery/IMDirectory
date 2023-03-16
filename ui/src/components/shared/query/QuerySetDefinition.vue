<template>
  <div v-if="loading" class="flex flex-row justify-content-center align-items-center loading-container">
    <ProgressSpinner />
  </div>
  <div v-else-if="queryDisplay.length" class="query-display-container">
    <Tree :value="queryDisplay" :expandedKeys="expandedKeys" class="tree-container">
      <template #default="{ node }">{{ node.label }}</template>
      <template #propertyIs="{ node }">
        <IMViewerLink
          :iri="node.value.property['@id']"
          :label="node.value.property.descendantsOrSelfOf ? node.value.property.name + '*' : node.value.property.name"
        />
        =
        <IMViewerLink :iri="node.value.is['@id']" :label="node.value.is.descendantsOrSelfOf ? node.value.is.name + '*' : node.value.is.name" />
      </template>
      <template #string="{ node }">{{ node.value }}</template>
      <template #iri="{ node }"> {{ node.label }} <IMViewerLink :iri="node.value" /></template>
      <template #boolean="{ node }">{{ node.label }}</template>
      <template #from="{ node }">
        <IMViewerLink v-if="node.value.descendantsOrSelfOf" :iri="node.value['@id']" :label="node.label + '*'" />
        <IMViewerLink v-else :iri="node.value['@id']" :label="node.label" />
      </template>

      <template #simpleOr="{ node }">
        <div v-for="(from, index) in node.value" :key="index">
          <IMViewerLink v-if="from.descendantsOrSelfOf" :iri="from['@id']" :label="from.label + '*'" />
          <IMViewerLink v-else :iri="node.value['@id']" :label="from.label" />
        </div>
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

const props = defineProps({ conceptIri: { type: String, required: true } });

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

async function getQueryDisplay(): Promise<TreeNode[]> {
  const queryDefinition = await QueryService.getQueryDefinitionDisplay(props.conceptIri);
  return queryDefinition.children || ([] as TreeNode[]);
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
