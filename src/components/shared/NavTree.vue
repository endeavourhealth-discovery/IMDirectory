<template>
  <div id="hierarchy-tree-bar-container" class="flex flex-col justify-start">
    <Tree
      v-model:expandedKeys="expandedKeys"
      :selectionKeys="selectedKeys"
      :loading="loading"
      :value="root"
      class="tree-root"
      selectionMode="single"
      @node-expand="expandNode"
      @node-collapse="onNodeCollapse"
    >
      <template #default="{ node }: any">
        <div
          :class="allowDragAndDrop && 'grabbable'"
          :draggable="allowDragAndDrop"
          class="tree-row"
          @contextmenu="onNodeContext($event, node)"
          @click="onNodeSelect($event, node, false, true)"
          @dragstart="dragStart($event, node.data)"
          @mouseleave="hideOverlay"
          @mouseover="displayOverlay($event, node)"
        >
          <span v-if="allowDragAndDrop">
            <IMFontAwesomeIcon class="drag-icon grabbable" icon="fa-solid fa-grip-vertical" />
          </span>
          <ContextMenu ref="menu" :model="items" />
          <span v-if="!node.loading">
            <IMFontAwesomeIcon v-if="node.typeIcon" :icon="node.typeIcon" :style="'color:' + node.color" fixed-width />
          </span>
          <ProgressSpinner v-if="node.loading" class="progress-spinner" />
          <span class="row-name">{{ node.label }}</span>
        </div>
      </template>
    </Tree>
    <small class="p-1">CTRL+click to open in new tab</small>
    <OverlaySummary ref="OS" />
    <Dialog :closable="false" :modal="true" :visible="newFolder !== null" header="New folder">
      <InputText v-model="newFolderName" autofocus type="text" @keyup.enter="createFolder" />
      <template #footer>
        <Button class="p-button-text" icon="fa-regular fa-xmark" label="Cancel" @click="newFolder = null" />
        <Button :disabled="creating || !newFolderName" :icon="newFolderIcon" label="Create" @click="createFolder" />
      </template>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, Ref, watch } from "vue";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import OverlaySummary from "./OverlaySummary.vue";
import { useToast } from "primevue/usetoast";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { byKey } from "@/helpers/Sorters";
import { EntityService, FilerService } from "@/services";
import { IM } from "@/vocabulary";
import { useRouter } from "vue-router";
import type { TreeNode } from "primevue/treenode";
import setupTree from "@/composables/setupTree";
import { useUserStore } from "@/stores/userStore";
import { useConfirm } from "primevue/useconfirm";
import createNew from "@/composables/createNew";
import { SearchResultSummary, TTIriRef } from "@/interfaces/AutoGen";
import setupOverlay from "@/composables/setupOverlay";
import { useDirectoryStore } from "@/stores/directoryStore";
import { cloneDeep } from "lodash-es";

interface Props {
  allowDragAndDrop?: boolean;
  allowRightClick?: boolean;
  rootEntities?: string[];
  selectedIri?: string;
  findInTree?: boolean;
  typeFilter?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  rootEntities: () => [] as string[],
  allowRightClick: false,
  allowDragAndDrop: false
});

const emit = defineEmits<{
  rowSelected: [payload: any];
  rowDblClicked: [payload: any];
  foundInTree: [];
}>();

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();
const userStore = useUserStore();
const directoryStore = useDirectoryStore();

const currentUser = computed(() => userStore.currentUser);
const isLoggedIn = computed(() => userStore.isLoggedIn);
const favourites = computed(() => userStore.favourites);

const {
  root,
  selectedKeys,
  selectedNode,
  expandedKeys,
  expandedData,
  pageSize,
  createTreeNode,
  createLoadMoreNode,
  loadMore,
  loadMoreChildren,
  locateChildInLoadMore,
  onNodeExpand,
  onNodeCollapse,
  findPathToNode,
  scrollToHighlighted,
  selectAndExpand,
  nodeHasChild,
  customOnClick
} = setupTree(emit, 50);
const { getCreateOptions }: { getCreateOptions: Function } = createNew();
const loading = ref(true);
const hoveredResult: Ref<SearchResultSummary> = ref({} as SearchResultSummary);
const overlayLocation: Ref<MouseEvent | undefined> = ref();
const items: Ref<any[]> = ref([]);
const newFolder: Ref<null | TreeNode> = ref(null);
const newFolderName = ref("");

const creating = ref(false);
const newFolderIcon = computed(() => {
  if (creating.value) return "fa-solid fa-spinner";
  else return "fa-solid fa-check";
});

const menu = ref();
const { OS, showOverlay, hideOverlay } = setupOverlay();

watch(
  () => props.findInTree,
  async newValue => {
    if (newValue && props.selectedIri) await findPathToNode(props.selectedIri, loading, "hierarchy-tree-bar-container");
    emit("foundInTree");
  }
);

watch(
  () => cloneDeep(favourites.value),
  () => {
    const favouritesIndex = root.value.findIndex(node => node.data === IM.FAVOURITES);
    if (favouritesIndex !== -1) {
      root.value.splice(favouritesIndex, 1);
      addFavouritesToTree();
    }
  }
);

watch(
  () => cloneDeep(props.rootEntities),
  async () => await init()
);

onMounted(async () => {
  await init();
});

onBeforeUnmount(() => {
  if (overlayLocation.value) {
    hideOverlay();
  }
});

document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    expandedKeys.value = {};
    for (const newNode in expandedData.value) {
      onNodeExpand(expandedData.value[newNode]);
    }
  }
});

async function init() {
  loading.value = true;
  if (isArrayHasLength(props.rootEntities)) await addRootEntitiesToTree();
  else await addParentFoldersToRoot();
  if (props.selectedIri) await findPathToNode(props.selectedIri, loading, "hierarchy-tree-bar-container");
  loading.value = false;
}

function expandNode(node: any) {
  onNodeExpand(node, props.typeFilter);
}

async function addParentFoldersToRoot() {
  const IMChildren = await EntityService.getEntityChildren(IM.MODULE_IM);
  if (isArrayHasLength(IMChildren)) {
    for (let IMchild of IMChildren) {
      const hasNode = !!root.value.find(node => node.data === IMchild["@id"]);
      if (!hasNode) root.value.push(createTreeNode(IMchild.name, IMchild["@id"], IMchild.type, IMchild.hasGrandChildren, null, IMchild.orderNumber));
    }
  }
  root.value.sort((r1, r2) => (r1.order > r2.order ? 1 : r1.order < r2.order ? -1 : 0));
  if (isLoggedIn.value) await addFavouritesToTree();
}

async function addFavouritesToTree() {
  const favNode = createTreeNode("Favourites", IM.FAVOURITES, [], !!favourites.value.length, null, undefined);
  favNode.typeIcon = ["fa-solid", "fa-star"];
  favNode.color = "var(--p-yellow-500)";
  root.value.push(favNode);
}

async function addRootEntitiesToTree() {
  root.value = [];
  for (const item of props.rootEntities) {
    const itemSummary = await EntityService.getEntityAsEntityReferenceNode(item);
    if (itemSummary) {
      const hasNode = !!root.value.find(node => node.data === itemSummary["@id"]);
      if (!hasNode) root.value.push(createTreeNode(itemSummary.name, itemSummary["@id"], itemSummary.type, itemSummary.hasGrandChildren, null));
    }
  }
  root.value.sort(byKey);
}

async function onNodeContext(event: any, node: any) {
  event.preventDefault();
  items.value = [];

  if (!currentUser.value || !currentUser.value.roles.includes("IMAdmin")) return;

  items.value = await getCreateOptions(newFolderName, newFolder, node);

  if (
    selectedNode.value &&
    isObjectHasKeys(selectedNode.value) &&
    selectedNode.value.key &&
    node.key !== selectedNode.value.key &&
    node.typeIcon.includes("fa-folder")
  ) {
    const isOwnDescendant = await EntityService.getPathBetweenNodes(node.key, selectedNode.value.key);
    if (isOwnDescendant.findIndex(pathItem => pathItem["@id"] === selectedNode.value?.key) === -1) {
      items.value.push({
        label: "Move selection here",
        icon: "fa-solid fa-fw fa-file-import",
        command: () => {
          confirmMove(node);
        }
      });
      items.value.push({
        label: "Add selection here",
        icon: "fa-solid fa-fw fa-copy",
        command: () => {
          confirmAdd(node);
        }
      });
    }
  }
  if (items.value.length > 0) menu.value.show(event);
}

function confirmMove(node: TreeNode) {
  if (selectedNode.value && isObjectHasKeys(selectedNode.value)) {
    confirm.require({
      header: "Confirm move",
      message: 'Are you sure you want to move "' + selectedNode.value.label + '" to "' + node.label + '" ?',
      icon: "fa-solid fa-triangle-exclamation",
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
  if (
    selectedNode.value &&
    isObjectHasKeys(selectedNode.value) &&
    selectedNode.value.parentNode &&
    selectedNode.value.key &&
    target &&
    target.key &&
    target.children
  ) {
    try {
      await FilerService.moveFolder(selectedNode.value.key, selectedNode.value.parentNode.key, target.key);
      toast.add({
        severity: "success",
        summary: "Move",
        detail: 'Moved "' + selectedNode.value.label + '" into "' + target.label + '"',
        life: 3000
      });
      selectedNode.value.parentNode.children = selectedNode.value.parentNode.children.filter((v: TreeNode) => v != selectedNode.value);
      selectedNode.value.parentNode = target;
      target.children.push(selectedNode.value);
    } catch (e: any) {
      toast.add({ severity: "error", summary: e.response.data.title, detail: e.response.data.detail, life: 3000 });
    }
  }
}

function confirmAdd(node: TreeNode) {
  if (selectedNode.value && isObjectHasKeys(selectedNode.value)) {
    confirm.require({
      header: "Confirm add",
      message: 'Are you sure you want to add "' + selectedNode.value.label + '" to "' + node.label + '" ?',
      icon: "fa-solid fa-triangle-exclamation",
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
  if (
    selectedNode.value &&
    isObjectHasKeys(selectedNode.value) &&
    selectedNode.value.parentNode &&
    selectedNode.value.key &&
    target &&
    target.key &&
    target.children
  ) {
    try {
      await FilerService.addToFolder(selectedNode.value.key, target.key);
      toast.add({
        severity: "success",
        summary: "Add",
        detail: 'Added "' + selectedNode.value.label + '" into "' + target.label + '"',
        life: 3000
      });
      target.children.push(selectedNode.value); // Does this need to be a (deep) clone?
    } catch (e: any) {
      toast.add({ severity: "error", summary: e.response.data.title, detail: e.response.data.detail, life: 3000 });
    }
  }
}

async function createFolder() {
  if (!newFolder.value || !newFolder.value.key || !newFolderName.value) return;

  creating.value = true;

  try {
    const iri = await FilerService.createFolder(newFolder.value.key, newFolderName.value);
    toast.add({
      severity: "success",
      summary: "New folder",
      detail: 'New folder "' + newFolderName.value + '" created',
      life: 3000
    });
    if (newFolder.value.children) {
      newFolder.value.children.push(
        createTreeNode(
          newFolderName.value,
          iri,
          [
            {
              "@id": IM.FOLDER,
              name: "Folder"
            } as TTIriRef
          ],
          false,
          newFolder.value
        )
      );
    }
  } catch (e) {
    toast.add({
      severity: "error",
      summary: "New folder",
      detail: '"' + newFolderName.value + '" already exists',
      life: 3000
    });
  } finally {
    newFolder.value = null;
    creating.value = false;
    await onNodeExpand(selectedNode.value);
  }
}

async function displayOverlay(event: any, node: any): Promise<void> {
  if (node.data !== "loadMore" && node.data !== "http://endhealth.info/im#Favourites") {
    showOverlay(event, node.key);
  }
}

function onNodeSelect(event: MouseEvent, node: TreeNode, useEmits?: boolean, updateSelectedKeys?: boolean) {
  if (node.data === "loadMore") {
    if (!node.loading) loadMore(node);
  } else customOnClick(event, node, useEmits, updateSelectedKeys);
}

function dragStart(event: any, data: any) {
  if (props.allowDragAndDrop) {
    event.dataTransfer.setData("conceptIri", JSON.stringify(data));
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.dropEffect = "copy";
    hideOverlay();
  }
}
</script>

<style scoped>
#hierarchy-tree-bar-container {
  height: 100%;
  overflow: auto;
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

.tree-root ::v-deep(.p-tree-node-label) {
  width: 100% !important;
}

.progress-spinner {
  width: 1.25em !important;
  height: 1.25em !important;
  flex: 0 0 auto;
}

.tree-row .row-name {
  flex: 1 1 auto;
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
