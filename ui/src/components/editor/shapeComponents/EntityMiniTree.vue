<template>
  <div id="mini-tree-container">
    <Tree
      :value="root"
      selectionMode="single"
      v-model:selectionKeys="selected"
      :expandedKeys="expandedKeys"
      @node-select="onNodeSelect"
      @node-expand="onNodeExpand"
      class="tree-root"
      :loading="loading"
    >
      <template #default="slotProps">
        <div class="tree-row" @mouseover="showOverlay($event, slotProps.node)" @mouseleave="hideOverlay($event)">
          <span v-if="!slotProps.node.loading">
            <div :style="'color:' + slotProps.node.color">
              <i :class="slotProps.node.typeIcon" class="fa-fw"></i>
            </div>
          </span>
          <ProgressSpinner v-else />
          <span>{{ slotProps.node.label }}</span>
        </div>
      </template>
    </Tree>

    <OverlayPanel v-if="hoveredResult.iri === 'load'" ref="miniTreeOP" id="mini_tree_overlay_panel" style="width: 50vw" :breakpoints="{ '960px': '75vw' }">
      <div class="flex flex-row justify-contents-start result-overlay" style="width: 100%; gap: 1rem">
        <span>{{ hoveredResult.name }}</span>
      </div>
    </OverlayPanel>
    <OverlayPanel v-else ref="miniTreeOP" id="mini_tree_overlay_panel" style="width: 50vw" :breakpoints="{ '960px': '75vw' }">
      <div v-if="hoveredResult.name" class="flex flex-row justify-contents-start result-overlay" style="width: 100%; gap: 1rem">
        <div class="left-side" style="width: 50%">
          <p>
            <strong>Name: </strong>
            <span>{{ hoveredResult.name }}</span>
          </p>
          <p>
            <strong>Iri: </strong>
            <span style="word-break: break-all">{{ hoveredResult.iri }}</span>
          </p>
          <p v-if="hoveredResult.code">
            <strong>Code: </strong>
            <span>{{ hoveredResult.code }}</span>
          </p>
        </div>
        <div class="right-side" style="width: 50%">
          <p v-if="hoveredResult.status">
            <strong>Status: </strong>
            <span>{{ hoveredResult.status.name }}</span>
          </p>
          <p v-if="hoveredResult.scheme">
            <strong>Scheme: </strong>
            <span>{{ hoveredResult.scheme.name }}</span>
          </p>
          <p v-if="hoveredResult.entityType">
            <strong>Type: </strong>
            <span>{{ getNamesAsStringFromTypes(hoveredResult.entityType) }}</span>
          </p>
        </div>
      </div>
    </OverlayPanel>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, PropType, ref, Ref, watch } from "vue";
import { ConceptSummary, EntityReferenceNode, TreeNode, TTIriRef } from "@im-library/interfaces";
import axios from "axios";
import { getColourFromType, getFAIconFromType, getNamesAsStringFromTypes } from "@im-library/helpers/ConceptTypeMethods";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { byKey } from "@im-library/helpers/Sorters";
import { EntityService } from "@/services";
import { IM } from "@im-library/vocabulary";
import { useToast } from "primevue/usetoast";

const props = defineProps({
  selectedEntity: { type: Object as PropType<TTIriRef>, required: true }
});

// watch(
//   () => props.selectedEntity,
//   async newValue => {
//     await findPathToNode(newValue["@id"]);
//   }
// );

const emit = defineEmits({
  treeNodeSelected: (_payload: TTIriRef) => true
});

const toast = useToast();

let selected: Ref<any> = ref({});
let selectedNode: Ref<TreeNode> = ref({} as TreeNode);
let root: Ref<TreeNode[]> = ref([]);
let loading = ref(true);
let expandedKeys: Ref<any> = ref({});
let hoveredResult: Ref<ConceptSummary> = ref({} as ConceptSummary);
let overlayLocation: Ref<any> = ref({});
const pageSize = 20;

const miniTreeOP = ref();

onMounted(async () => {
  await init();
});

async function init() {
  loading.value = true;
  await addParentFoldersToRoot();
  if (props.selectedEntity["@id"]) await findPathToNode(props.selectedEntity["@id"]);
  loading.value = false;
}

async function addParentFoldersToRoot() {
  const IMChildren = await EntityService.getEntityChildren(IM.NAMESPACE + "InformationModel");
  for (let IMchild of IMChildren) {
    const hasNode = !!root.value.find(node => node.data === IMchild["@id"]);
    if (!hasNode) root.value.push(createTreeNode(IMchild.name, IMchild["@id"], IMchild.type, IMchild.hasGrandChildren, IMchild.orderNumber));
  }
  root.value.sort(byKey);
}

function createTreeNode(conceptName: string, conceptIri: string, conceptTypes: TTIriRef[], hasChildren: boolean, order?: number): TreeNode {
  return {
    key: conceptName,
    label: conceptName,
    typeIcon: getFAIconFromType(conceptTypes),
    color: getColourFromType(conceptTypes),
    data: conceptIri,
    leaf: !hasChildren,
    loading: false,
    children: [] as TreeNode[],
    order: order
  };
}

function createLoadMoreNode(parentNode: TreeNode, nextPage: number, totalCount: number): any {
  return {
    key: "loadMore" + parentNode.data,
    label: "Load more...",
    typeIcon: null,
    color: null,
    data: "loadMore",
    leaf: true,
    loading: false,
    children: [] as TreeNode[],
    parentNode: parentNode,
    nextPage: nextPage,
    totalCount: totalCount,
    style: "font-weight: bold;"
  };
}

function onNodeSelect(node: any): void {
  selectedNode.value = node;
  emit("treeNodeSelected", { "@id": node.data, name: node.label });
}

async function loadMore(node: any) {
  if (node.nextPage * pageSize < node.totalCount) {
    const children = await EntityService.getPagedChildren(node.parentNode.data, node.nextPage, pageSize);
    node.parentNode.children.pop();
    children.result.forEach((child: any) => {
      if (!nodeHasChild(node.parentNode, child)) node.parentNode.children.push(createTreeNode(child.name, child["@id"], child.type, child.hasChildren));
    });
    node.nextPage = node.nextPage + 1;
    node.parentNode.children.push(createLoadMoreNode(node.parentNode, node.nextPage, node.totalCount));
  } else if (node.nextPage * pageSize > node.totalCount) {
    const children = await EntityService.getPagedChildren(node.parentNode.data, node.nextPage, pageSize);
    node.parentNode.children.pop();
    children.result.forEach((child: any) => {
      if (!nodeHasChild(node.parentNode, child)) node.parentNode.children.push(createTreeNode(child.name, child["@id"], child.type, child.hasChildren));
    });
  } else {
    node.parentNode.children.pop();
  }
}

async function onNodeExpand(node: any) {
  if (isObjectHasKeys(node)) {
    node.loading = true;
    const children = await EntityService.getPagedChildren(node.data, 1, pageSize);
    children.result.forEach((child: any) => {
      if (!nodeHasChild(node, child)) node.children.push(createTreeNode(child.name, child["@id"], child.type, child.hasChildren));
    });
    if (children.totalCount >= pageSize) {
      node.children.push(createLoadMoreNode(node, 2, children.totalCount));
    }
    node.loading = false;
  }
}

function onNodeCollapse(node: any) {
  node.children = [];
  node.leaf = false;
}

function nodeHasChild(node: TreeNode, child: EntityReferenceNode) {
  return !!node.children.find(nodeChild => child["@id"] === nodeChild.data);
}

function selectKey(selectedKey: string) {
  Object.keys(selected.value).forEach(key => {
    selected.value[key] = false;
  });
  selected.value[selectedKey] = true;
}

async function findPathToNode(iri: string) {
  loading.value = true;
  const path = await EntityService.getPathBetweenNodes(iri, IM.MODULE_IM);

  // Recursively expand
  let n = root.value.find(c => path.find(p => p["@id"] === c.data));
  let i = 0;
  if (n) {
    expandedKeys.value = {};
    while (n && n.data != path[0]["@id"] && i++ < 50) {
      await selectAndExpand(n);
      // Find relevant child
      n = n.children.find(c => path.find(p => p["@id"] === c.data));
    }
    if (n && n.data === path[0]["@id"]) {
      await selectAndExpand(n);

      while (!n.children.some(child => child.data === iri)) {
        await loadMoreChildren(n);
      }
      for (const gc of n.children) {
        if (gc.data === iri) {
          selectKey(gc.key);
        }
      }
      selectedNode.value = n;
    } else {
      toast.add({
        severity: "warn",
        summary: "Unable to locate",
        detail: "Unable to locate concept in the current hierarchy"
      });
    }
  }
  scrollToHighlighted();
  loading.value = false;
}

async function selectAndExpand(node: any) {
  selectKey(node.key);
  if (!node.children || node.children.length === 0) {
    await onNodeExpand(node);
  }
  expandedKeys.value[node.key] = true;
}

function scrollToHighlighted() {
  const container = document.getElementById("mini-tree-container") as HTMLElement;
  const highlighted = container.getElementsByClassName("p-highlight")[0];
  if (highlighted) highlighted.scrollIntoView();
}

async function loadMoreChildren(node: any) {
  if (node.children[node.children.length - 1].data === "loadMore") {
    await loadMore(node.children[node.children.length - 1]);
  }
}

async function showOverlay(event: any, node?: any): Promise<void> {
  if (node.data === "loadMore") {
    const x: any = miniTreeOP.value;
    overlayLocation.value = event;
    x.show(overlayLocation.value);
    hoveredResult.value.iri = "load";
    hoveredResult.value.name = node.parentNode.label;
  } else if (node.data) {
    const x: any = miniTreeOP.value;
    overlayLocation.value = event;
    x.show(overlayLocation.value);
    hoveredResult.value = await EntityService.getEntitySummary(node.data);
  }
}

function hideOverlay(event: any): void {
  const x: any = miniTreeOP.value;
  x.hide(event);
  overlayLocation.value = {};
}
</script>

<style scoped>
#mini-tree-container {
  max-height: 30vh;
  min-width: 20rem;
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

#parent-button-bar {
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
  align-items: center;
}

.toggle-buttons-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.tree-locked-button,
.tree-lock-button,
.home-button,
.next-parent-button {
  width: fit-content !important;
}
</style>
