<template>
  <div class="flex flex-column justify-content-start" id="hierarchy-tree-bar-container">
    <Tree
      :value="root"
      selectionMode="single"
      v-model:selectionKeys="selected"
      :expandedKeys="expandedKeys"
      @node-select="onNodeSelect"
      @node-expand="onNodeExpand"
      @node-collapse="onNodeCollapse"
      class="tree-root"
      :loading="loading"
    >
      <template #default="slotProps">
        <div
          class="tree-row grabbable"
          @mouseover="showOverlay($event, slotProps.node)"
          @mouseleave="hideOverlay($event)"
          draggable="true"
          @dragstart="dragStart($event, slotProps.node)"
        >
          <i class="fa-solid fa-grip-vertical drag-icon grabbable"></i>
          <span v-if="!slotProps.node.loading">
            <div :style="'color:' + slotProps.node.color">
              <i :class="slotProps.node.typeIcon" class="fa-fw" aria-hidden="true"></i>
            </div>
          </span>
          <ProgressSpinner v-if="slotProps.node.loading" />
          <span>{{ slotProps.node.label }}</span>
        </div>
      </template>
    </Tree>

    <OverlayPanel v-if="hoveredResult.iri === 'load'" ref="navTreeOP" id="nav_tree_overlay_panel" style="width: 50vw" :breakpoints="{ '960px': '75vw' }">
      <div class="flex flex-row justify-contents-start result-overlay" style="width: 100%; gap: 1rem">
        <span>{{ hoveredResult.name }}</span>
      </div>
    </OverlayPanel>
    <OverlayPanel v-else ref="navTreeOP" id="nav_tree_overlay_panel" style="width: 50vw" :breakpoints="{ '960px': '75vw' }">
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
import { computed, ref, Ref, watch, ComputedRef, onMounted, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import { useToast } from "primevue/usetoast";
import { TTIriRef, EntityReferenceNode, ConceptSummary } from "@im-library/interfaces";
import _ from "lodash";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getColourFromType, getFAIconFromType, getNamesAsStringFromTypes } from "@im-library/helpers/ConceptTypeMethods";
import { byKey } from "@im-library/helpers/Sorters";
import { EntityService } from "@/services";
import { IM } from "@im-library/vocabulary";
import { useRouter } from "vue-router";
import { TreeNode } from "primevue/tree";

const store = useStore();
const router = useRouter();
const toast = useToast();

const treeIri: ComputedRef<string> = computed(() => store.state.findInEditorTreeIri);

let selected: Ref<any> = ref({});
let selectedNode: Ref<any> = ref({});
let root: Ref<TreeNode[]> = ref([]);
let loading = ref(true);
let expandedKeys: Ref<any> = ref({});
let hoveredResult: Ref<ConceptSummary> = ref({} as ConceptSummary);
let overlayLocation: Ref<any> = ref({});
const pageSize: number = 20;

const navTreeOP = ref();

watch(treeIri, async () => {
  if (treeIri) await findPathToNode(treeIri.value);
});

onMounted(async () => {
  await init();
});

onBeforeUnmount(() => {
  if (isObjectHasKeys(overlayLocation.value)) {
    hideOverlay(overlayLocation.value);
  }
});

async function init() {
  loading.value = true;
  await addParentFoldersToRoot();
  if (treeIri.value) await findPathToNode(treeIri.value);
  loading.value = false;
}

async function addParentFoldersToRoot() {
  const IMChildren = await EntityService.getEntityChildren(IM.NAMESPACE + "InformationModel");
  for (let IMchild of IMChildren) {
    const hasNode = !!root.value.find(node => node.data === IMchild["@id"]);
    if (!hasNode) root.value.push(createTreeNode(IMchild.name, IMchild["@id"], IMchild.type, IMchild.hasGrandChildren, IMchild.orderNumber));
  }
  root.value.sort(byKey);
  const favNode = createTreeNode("Favourites", IM.NAMESPACE + "Favourites", [], false);
  favNode.typeIcon = ["fa-solid", "fa-star"];
  favNode.color = "#e39a36";
  root.value.push(favNode);
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
  if (node.data === "loadMore") {
    loadMore(node);
  } else {
    selectedNode.value = node;
    // router.push({
    //   name: "Folder",
    //   params: { selectedIri: node.data }
    // });
    store.commit("updateSelectedConceptIri", node.data);
  }
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
  return !!node.children?.find(nodeChild => child["@id"] === nodeChild.data);
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
      n = await locateChildInLoadMore(n, path);
    }
    if (n && n.data === path[0]["@id"]) {
      await selectAndExpand(n);

      while (!n.children?.some(child => child.data === iri)) {
        await loadMoreChildren(n);
      }
      for (const gc of n.children) {
        if (gc.data === iri && gc.key) {
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

async function locateChildInLoadMore(n: TreeNode, path: TTIriRef[]): Promise<TreeNode | undefined> {
  if (n.children?.find(c => c.data === "loadMore")) {
    const found = n.children.find(c => path.find(p => p["@id"] === c.data));
    if (found) {
      return n.children.find(c => path.find(p => p["@id"] === c.data));
    } else {
      await loadMoreChildren(n);
      return await locateChildInLoadMore(n, path);
    }
  } else {
    return n.children?.find(c => path.find(p => p["@id"] === c.data));
  }
}

async function selectAndExpand(node: any) {
  selectKey(node.key);
  if (!node.children || node.children.length === 0) {
    await onNodeExpand(node);
  }
  expandedKeys.value[node.key] = true;
}

function scrollToHighlighted() {
  const container = document.getElementById("hierarchy-tree-bar-container") as HTMLElement;
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
    const x: any = navTreeOP.value;
    overlayLocation.value = event;
    x.show(overlayLocation.value);
    hoveredResult.value.iri = "load";
    hoveredResult.value.name = node.parentNode.label;
  } else if (node.data && node.data !== IM.FAVOURITES) {
    const x: any = navTreeOP.value;
    overlayLocation.value = event;
    x.show(overlayLocation.value);
    hoveredResult.value = await EntityService.getEntitySummary(node.data);
  }
}

function hideOverlay(event: any): void {
  const x: any = navTreeOP.value;
  x.hide(event);
  overlayLocation.value = {};
}

function dragStart(event: any, data: any) {
  event.dataTransfer.setData("text/plain", JSON.stringify(data));
  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.dropEffect = "copy";
  hideOverlay(overlayLocation.value);
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

#hierarchy-tree-bar-container::v-deep(.p-tree-toggler) {
  height: 1.25rem !important;
  margin: 0 0 0 0 !important;
}

.drag-icon {
  cursor: move;
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
}

.grabbable:active {
  cursor: grabbing;
  cursor: -moz-grabbing;
  cursor: -webkit-grabbing;
}
</style>
