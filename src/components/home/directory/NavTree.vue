<template>
  <div class="flex flex-column justify-content-start" id="hierarchy-tree-bar-container">
    <Tree
      :value="root"
      selectionMode="single"
      v-model:selectionKeys="selectedKeys"
      :expandedKeys="expandedKeys"
      @node-select="onNodeSelect"
      @node-expand="onNodeExpand"
      @node-collapse="onNodeCollapse"
      class="tree-root"
      :loading="loading"
    >
      <template #default="slotProps">
        <div
          class="tree-row"
          @mouseover="showOverlay($event, slotProps.node)"
          @mouseleave="hideOverlay($event)"
          @dblclick="onNodeDblClick($event, slotProps.node)"
          @contextmenu="onNodeContext($event, slotProps.node)"
        >
          <ContextMenu ref="menu" :model="items" />
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
            <span>{{ getConceptTypes(hoveredResult.entityType) }}</span>
          </p>
        </div>
      </div>
    </OverlayPanel>
    <Dialog header="New folder" v-model:visible="showNewFolder" :modal="true">
      <InputText type="text" v-model="newFolderName" autofocus />
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" @click="newFolder = null" class="p-button-text" />
        <Button label="Create" icon="pi pi-check" @click="createFolder" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, Ref } from "vue";
import { useStore } from "vuex";
import { TreeNode, TTIriRef, EntityReferenceNode, ConceptSummary } from "im-library/dist/types/interfaces/Interfaces";
import { Vocabulary, Helpers, Services } from "im-library";
import ContextMenu from "primevue/contextmenu";
import { useConfirm } from "primevue/useconfirm";
import axios from "axios";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
const { IM } = Vocabulary;
const {
  DataTypeCheckers: { isObjectHasKeys, isArrayHasLength, isObject },
  ConceptTypeMethods: { getColourFromType, getFAIconFromType, getNamesAsStringFromTypes }
} = Helpers;
const { DirectService, EntityService, Env, FilerService } = Services;

const toast = useToast();
const confirm = useConfirm();
const router = useRouter();
const store = useStore();
const conceptIri = computed(() => store.state.conceptIri);
const favourites = computed(() => store.state.favourites);
const currentUser = computed(() => store.state.currentUser);

const entityService = new EntityService(axios);
const filerService = new FilerService(axios);
const directService = new DirectService(store);

const selectedKeys: Ref<any> = ref({});
const selectedNode: Ref<TreeNode> = ref({} as TreeNode);
const root: Ref<TreeNode[]> = ref([]);
const loading = ref(true);
const expandedKeys: Ref<any> = ref({});
const hoveredResult: Ref<ConceptSummary> = ref({} as ConceptSummary);
const overlayLocation: Ref<any> = ref({});
const pageSize = ref(20);
const items: Ref<any[]> = ref([]);
const newFolder: Ref<null | TreeNode> = ref(null);
const newFolderName = ref("");

const menu = ref();
const navTreeOP = ref();

const showNewFolder = computed(() => !isObjectHasKeys(newFolder));

onMounted(async () => {
  loading.value = true;
  await addParentFoldersToRoot();
  if (conceptIri.value) await findPathToNode(conceptIri.value);
  loading.value = false;
});

onUnmounted(() => {
  if (isObject(overlayLocation.value) && isArrayHasLength(Object.keys(overlayLocation.value))) {
    hideOverlay(overlayLocation.value);
  }
});

async function addParentFoldersToRoot() {
  const IMChildren = await entityService.getEntityChildren(IM.NAMESPACE + "InformationModel");
  for (let IMchild of IMChildren) {
    const hasNode = !!root.value.find(node => node.data === IMchild["@id"]);
    if (!hasNode) root.value.push(createTreeNode(IMchild.name, IMchild["@id"], IMchild.type, IMchild.hasGrandChildren, null, IMchild.orderNumber));
  }
  root.value.sort(byKey);
  const favNode = createTreeNode("Favourites", IM.NAMESPACE + "Favourites", [], false, null);
  favNode.typeIcon = ["fa-solid", "fa-star"];
  favNode.color = "#e39a36";
  root.value.push(favNode);
}

function byKey(a: any, b: any): number {
  // order by order number
  if (a.order && b.order) return a.order - b.order;
  else if (a.order && !b.order) return -1;
  else if (!a.order && b.order) return 1;
  // order alphabetically
  else if (a.key > b.key) return 1;
  else if (b.key > a.key) return -1;

  return 0;
}

function createTreeNode(
  conceptName: string,
  conceptIri: string,
  conceptTypes: TTIriRef[],
  hasChildren: boolean,
  parent: TreeNode | null,
  order?: number
): TreeNode {
  return {
    key: conceptIri,
    label: conceptName,
    typeIcon: getFAIconFromType(conceptTypes),
    color: getColourFromType(conceptTypes),
    data: conceptIri,
    leaf: !hasChildren,
    loading: false,
    children: [] as TreeNode[],
    order: order,
    parentNode: parent
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
    router.push({
      name: "Folder",
      params: { selectedIri: node.data }
    });
  }
}

function onNodeDblClick($event: any, node: any) {
  if (node.typeIcon && node.typeIcon.includes("fa-folder")) selectAndExpand(node);
  else if (node.data !== "loadMore") directService.directTo(Env.DIRECTORY_URL, node.key, "folder");
}

async function loadMore(node: any) {
  if (node.nextPage * pageSize.value < node.totalCount) {
    const children = await entityService.getPagedChildren(node.parentNode.data, node.nextPage, pageSize.value);
    node.parentNode.children.pop();
    children.result.forEach((child: any) => {
      if (!nodeHasChild(node.parentNode, child)) node.parentNode.children.push(createTreeNode(child.name, child["@id"], child.type, child.hasChildren, node));
    });
    node.nextPage = node.nextPage + 1;
    node.parentNode.children.push(createLoadMoreNode(node.parentNode, node.nextPage, node.totalCount));
  } else if (node.nextPage * pageSize.value > node.totalCount) {
    const children = await entityService.getPagedChildren(node.parentNode.data, node.nextPage, pageSize.value);
    node.parentNode.children.pop();
    children.result.forEach((child: any) => {
      if (!nodeHasChild(node.parentNode, child))
        node.parentNode.children.push(createTreeNode(child.name, child["@id"], child.type, child.hasChildren, node.parentNode));
    });
  } else {
    node.parentNode.children.pop();
  }
}

async function onNodeExpand(node: any) {
  if (isObjectHasKeys(node)) {
    node.loading = true;
    const children = await entityService.getPagedChildren(node.data, 1, pageSize.value);
    children.result.forEach((child: any) => {
      if (!nodeHasChild(node, child)) node.children.push(createTreeNode(child.name, child["@id"], child.type, child.hasChildren, node));
    });
    if (children.totalCount >= pageSize.value) {
      node.children.push(createLoadMoreNode(node, 2, children.totalCount));
    }
    node.loading = false;
  }
}

function onNodeCollapse(node: any) {
  node.children = [];
  node.leaf = false;
}

function onNodeContext(event: any, node: any) {
  items.value = [];

  if (!currentUser.value.roles.includes("IMAdmin")) return;

  if (node.typeIcon.includes("fa-folder")) {
    items.value.push({
      label: "New folder",
      icon: "fas fa-fw fa-folder-plus",
      command: () => {
        newFolderName.value = "";
        newFolder.value = node;
      }
    });
  }

  if (selectedNode.value && node.typeIcon.includes("fa-folder")) {
    items.value.push({
      label: "Move selection here",
      icon: "fas fa-fw fa-file-import",
      command: () => {
        confirmMove(node);
      }
    });
    items.value.push({
      label: "Add selection here",
      icon: "fas fa-fw fa-copy",
      command: () => {
        confirmAdd(node);
      }
    });
  }

  if (items.value.length > 0) menu.value.show(event);
}

function confirmMove(node: TreeNode) {
  if (selectedNode.value) {
    confirm.require({
      header: "Confirm move",
      message: 'Are you sure you want to move "' + selectedNode.value.label + '" to "' + node.label + '" ?',
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        moveConcept(node);
      },
      reject: () => {
        toast.add({ severity: "warn", summary: "Cancelled", detail: "Move cancelled", life: 3000 });
      }
    });
  }
}

async function moveConcept(target: TreeNode) {
  if (selectedNode.value && selectedNode.value.parentNode) {
    try {
      await filerService.moveFolder(selectedNode.value.key, selectedNode.value.parentNode.key, target.key);
      toast.add({ severity: "success", summary: "Move", detail: 'Moved "' + selectedNode.value.label + '" into "' + target.label + '"', life: 3000 });
      selectedNode.value.parentNode.children = selectedNode.value.parentNode.children.filter((v, _i, _r) => v != selectedNode.value);
      selectedNode.value.parentNode = target;
      target.children.push(selectedNode.value);
    } catch (e: any) {
      toast.add({ severity: "error", summary: e.response.data.title, detail: e.response.data.detail, life: 3000 });
    }
  }
}

function confirmAdd(node: TreeNode) {
  if (selectedNode.value) {
    confirm.require({
      header: "Confirm add",
      message: 'Are you sure you want to add "' + selectedNode.value.label + '" to "' + node.label + '" ?',
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        addConcept(node);
      },
      reject: () => {
        toast.add({ severity: "warn", summary: "Cancelled", detail: "Add cancelled", life: 3000 });
      }
    });
  }
}

async function addConcept(target: TreeNode) {
  if (selectedNode.value && selectedNode.value.parentNode) {
    try {
      await filerService.addToFolder(selectedNode.value.key, target.key);
      toast.add({ severity: "success", summary: "Add", detail: 'Added "' + selectedNode.value.label + '" into "' + target.label + '"', life: 3000 });
      target.children.push(selectedNode.value); // Does this need to be a (deep) clone?
    } catch (e: any) {
      toast.add({ severity: "error", summary: e.response.data.title, detail: e.response.data.detail, life: 3000 });
    }
  }
}

async function createFolder() {
  if (!newFolder.value) return;

  console.log("Create new folder " + newFolderName.value + " in " + newFolder.value.key);
  const iri = await filerService.createFolder(newFolder.value.key, newFolderName.value);
  if (iri) {
    console.log("Created folder");
    console.log(iri);
    toast.add({ severity: "success", summary: "New folder", detail: 'New folder "' + newFolderName.value + '" created', life: 3000 });
    if (newFolder.value.children) {
      newFolder.value.children.push(createTreeNode(newFolderName.value, iri, [{ "@id": IM.FOLDER, name: "Folder" }], false, newFolder.value));
    }
  } else {
    toast.add({ severity: "error", summary: "New folder", detail: '"' + newFolderName.value + '" already exists', life: 3000 });
  }
  newFolder.value = null;
}

function nodeHasChild(node: TreeNode, child: EntityReferenceNode) {
  return !!node.children.find(nodeChild => child["@id"] === nodeChild.data);
}

function selectKey(selectedKey: string) {
  Object.keys(selectedKeys.value).forEach(key => {
    selectedKeys.value[key] = false;
  });
  selectedKeys.value[selectedKey] = true;
}

async function findPathToNode(iri: string) {
  loading.value = true;
  const path = await entityService.getPathBetweenNodes(iri, IM.MODULE_IM);

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

async function locateChildInLoadMore(n: TreeNode, path: TTIriRef[]): Promise<TreeNode | undefined> {
  if (n.children.find(c => c.data === "loadMore")) {
    const found = n.children.find(c => path.find(p => p["@id"] === c.data));
    if (found) {
      return n.children.find(c => path.find(p => p["@id"] === c.data));
    } else {
      await loadMoreChildren(n);
      return await locateChildInLoadMore(n, path);
    }
  } else {
    return n.children.find(c => path.find(p => p["@id"] === c.data));
  }
}

async function selectAndExpand(node: any) {
  selectKey(node.key);
  if (!node.children || node.children.length === 0) {
    await onNodeExpand(node);
  }
  expandedKeys.value[node.key] = true;
  expandedKeys.value = { ...expandedKeys.value };
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
    const x = navTreeOP.value;
    overlayLocation.value = event;
    x.show(overlayLocation.value);
    hoveredResult.value.iri = "load";
    hoveredResult.value.name = node.parentNode.label;
  } else if (node.data && node.data !== "http://endhealth.info/im#Favourites") {
    const x = navTreeOP.value;
    overlayLocation.value = event;
    x.show(overlayLocation.value);
    hoveredResult.value = await entityService.getEntitySummary(node.data);
  }
}

function hideOverlay(event: any): void {
  const x = navTreeOP.value;
  x.hide(event);
  overlayLocation.value = {} as any;
}

function getConceptTypes(types: TTIriRef[]): string {
  return getNamesAsStringFromTypes(types);
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
</style>
