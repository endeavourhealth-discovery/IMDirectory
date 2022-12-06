<template>
  <div class="details-container">
    <div style="margin-bottom: 1em">
      <Button class="details-tree-button" icon="pi pi-plus" label="Expand All" @click="expandAll" />
      <Button class="details-tree-button p-button-secondary" icon="pi pi-minus" label="Collapse All" @click="collapseAll" />
    </div>
    <Tree
      v-model:selectionKeys="selectedKeys"
      selectionMode="single"
      :value="definition"
      :expandedKeys="expandedKeys"
      class="tree-container"
      @node-select="onSelect"
      @node-expand="onExpand"
    >
      <template #default="{ node }">
        {{ node.label }}
      </template>
      <template #property="{ node }"> {{ node.label }}: <IMViewerLink :iri="node.data['@id']" :label="node.data.name" /> </template>
      <template #link="{ node }">
        <IMViewerLink :iri="node.key!" :label="node.label" />
      </template>
      <template #loadMore="{ node }">
        <b>{{ node.label }}...</b>
      </template>
    </Tree>
  </div>
</template>

<script setup lang="ts">
import { EntityService } from "@/im_library/services";
import { TreeNode } from "primevue/tree";
import { onMounted, Ref, ref, watch } from "vue";
import IMViewerLink from "@/im_library/components/modules/IMViewerLink.vue";
import { IM } from "@/im_library/vocabulary";
import { isArrayHasLength } from "@/im_library/helpers/modules/DataTypeCheckers";
const props = defineProps({
  conceptIri: { type: String, required: true }
});

const definition: Ref<any> = ref();
const expandedKeys: Ref<any> = ref({});
const selectedKeys: Ref<any> = ref({});
const predicatePageIndexMap: Ref<Map<string, { pageIndex: number; node: TreeNode }>> = ref(new Map<string, { pageIndex: number; node: TreeNode }>());

watch(
  () => props.conceptIri,
  async newValue => getDefinition()
);

onMounted(async () => await getDefinition());

const expandAll = () => {
  for (let node of definition.value) {
    expandNode(node);
  }

  expandedKeys.value = { ...expandedKeys.value };
};
const collapseAll = () => {
  expandedKeys.value = {};
};
const expandNode = (node: TreeNode) => {
  if (node.children && node.children.length) {
    expandedKeys.value[node.key!] = true;

    for (let child of node.children) {
      expandNode(child);
    }
  }
};

async function getDefinition() {
  definition.value = await EntityService.getEntityDetailsDisplay(props.conceptIri);
}

async function onSelect(node: TreeNode) {
  if (node.key === IM.NAMESPACE + "loadMore") {
    const pageIndexInfo = predicatePageIndexMap.value.get(node.data.predicate);
    if (pageIndexInfo) {
      const entityDetails = await EntityService.loadMoreDetailsDisplay(props.conceptIri, node.data.predicate, ++pageIndexInfo.pageIndex, 10);
      const predicateValueNode = entityDetails.find(loadMoreNode => loadMoreNode.key === node.data.predicate);
      if (isArrayHasLength(predicateValueNode?.children)) {
        pageIndexInfo.node.children = pageIndexInfo.node.children?.concat(predicateValueNode!.children!);
        pageIndexInfo.node.children = pageIndexInfo.node.children?.filter(child => child.key !== node.key);
        pageIndexInfo.node.children?.push(node);
      } else {
        pageIndexInfo.node.children = pageIndexInfo.node.children?.filter(child => child.key !== node.key);
      }
    }
  }
}

async function onExpand(node: TreeNode) {
  const hasLoadMore = node.children?.some(child => child.key === IM.NAMESPACE + "loadMore");
  if (hasLoadMore) predicatePageIndexMap.value.set(node.key!, { pageIndex: 1, node: node });
}
</script>

<style scoped>
.details-container {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
}
.tree-container {
  height: 100vh;
  overflow-y: auto;
}

.details-tree-button {
  margin-right: 0.5rem;
}
</style>
