<template>
  <div class="query-tree-wrapper">
    <div class="query-tree-nav" id="hierarchy-tree-bar-container">
      <Tree
        :value="root"
        selectionMode="single"
        v-model:selectionKeys="selectedKeys"
        :expandedKeys="expandedKeys"
        @node-select="onNodeSelect"
        class="tree-root"
        :loading="loading"
        :filter="true"
        filterMode="lenient"
      >
        <template #default="{ node }: any">
          <div class="tree-row">
            <span v-if="!node.loading">
              <IMFontAwesomeIcon v-if="node.typeIcon" :style="'color:' + node.color" :icon="node.typeIcon" fixed-width />
            </span>
            <ProgressSpinner v-if="node.loading" />
            <span @mouseover="showOverlay($event, node)" @mouseleave="hideOverlay($event)">{{ node.label }}</span>
          </div>
        </template>
      </Tree>
      <OverlaySummary ref="OS" />
    </div>
  </div>
</template>

<script async setup lang="ts">
import { onMounted, onUnmounted, ref, Ref } from "vue";
import { EntityService } from "@/services";
import { IM, SHACL } from "@im-library/vocabulary";
import OverlaySummary from "@/components/directory/viewer/OverlaySummary.vue";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";
import setupTree from "@/composables/setupTree";
import { TreeNode } from "primevue/tree";
import { isArrayHasLength, isObject, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getColourFromType, getFAIconFromType, isProperty, isRecordModel } from "@im-library/helpers/ConceptTypeMethods";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { getKey, getParentNode } from "@im-library/helpers";
import { byLabel } from "@im-library/helpers/Sorters";

interface Props {
  baseEntityIri?: string;
}
const props = defineProps<Props>();

const emit = defineEmits({
  addBaseEntity: (_payload: TreeNode) => true
});

const loading = ref(true);
const overlayLocation: Ref<any> = ref({});
const OS: Ref<any> = ref();
const { selectedKeys, selectedNode, root, expandedKeys } = setupTree();

onMounted(async () => {
  loading.value = true;
  await populateTree();
  loading.value = false;
});

onUnmounted(() => {
  if (isObject(overlayLocation.value) && isArrayHasLength(Object.keys(overlayLocation.value))) {
    hideOverlay(overlayLocation.value);
  }
});

function onNodeSelect(node: any) {
  selectedNode.value = node;
  emit("addBaseEntity", selectedNode.value);
}

function createTreeNode(conceptName: string, conceptIri: string, conceptTypes: TTIriRef[], hasChildren: boolean, parent?: TreeNode, order?: number): TreeNode {
  return {
    key: getKey(parent as any),
    label: conceptName,
    typeIcon: getFAIconFromType(conceptTypes),
    color: getColourFromType(conceptTypes),
    conceptTypes: conceptTypes,
    data: conceptIri,
    leaf: !hasChildren,
    loading: false,
    children: [] as TreeNode[],
    order: order,
    parent: getParentNode(parent as any)
  };
}

async function populateTree() {
  const allNodeShapes = await EntityService.getAllByType(SHACL.NODESHAPE);
  addFolder("Data models", allNodeShapes, [{ "@id": SHACL.NODESHAPE }]);
  const allQueries = await EntityService.getAllQueries();
  addFolder("Queries", allQueries, [{ "@id": IM.QUERY }]);
  expandedKeys.value = { "0": true, "1": true };
}

async function addFolder(folderName: string, children: TTIriRef[], conceptTypes: TTIriRef[]) {
  const parent = createTreeNode(folderName, IM.NAMESPACE + folderName, [{ "@id": IM.FOLDER }], true, undefined);
  parent.key = "" + root.value.length;
  for (const [index, child] of children.entries()) {
    const node = createTreeNode(child.name!, child["@id"], conceptTypes, false, parent);
    node.key = `${index}`;
    parent.children!.push(node);
  }
  parent.children?.sort(byLabel);
  root.value.push(parent);
}

async function showOverlay(event: any, node: any): Promise<void> {
  if (node.data !== "loadMore" && node.data !== IM.NAMESPACE + "Data models" && node.data !== IM.NAMESPACE + "Queries") {
    await OS.value.showOverlay(event, node.data);
  }
}

function hideOverlay(event: any): void {
  OS.value.hideOverlay(event);
}
</script>

<style scoped>
#hierarchy-tree-bar-container {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
}

.loading-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
}

.p-tree .p-tree-container .p-treenode .p-treenode-content {
  padding: 0rem !important;
  transition: box-shadow 3600s 3600s !important;
}

.p-tree-toggler {
  margin-right: 0 !important;
}

.tree-root {
  height: 100%;
  overflow: auto;
  border: none;
  padding: 0;
}
.tree-root ::v-deep(.p-tree-toggler) {
  min-width: 2rem;
}

.tree-row .p-progress-spinner {
  width: 1.25em !important;
  height: 1.25em !important;
}

.tree-row {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 0.25rem;
}

#hierarchy-tree-bar-container::v-deep(.p-tree-toggler) {
  height: 1.25rem !important;
  margin: 0 0 0 0 !important;
}

.query-tree-wrapper {
  display: flex;
  flex-flow: column;
  height: 100%;
  width: 100%;
  justify-content: space-between;
}
</style>
