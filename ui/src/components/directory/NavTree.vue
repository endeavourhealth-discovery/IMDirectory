<template>
  <div class="flex flex-column justify-content-start" id="hierarchy-tree-bar-container">
    <Tree
      :value="root"
      selectionMode="single"
      v-model:selectionKeys="selectedKeys"
      :expandedKeys="expandedKeys"
      @node-select="onNodeSelect"
      @node-expand="onNodeExpand"
      class="tree-root"
      :loading="loading"
    >
      <template #default="{ node }: any">
        <div class="tree-row" @dblclick="onNodeDblClick($event, node)" @contextmenu="onNodeContext($event, node)">
          <ContextMenu ref="menu" :model="items" />
          <span v-if="!node.loading">
            <IMFontAwesomeIcon v-if="node.typeIcon" :style="'color:' + node.color" :icon="node.typeIcon" fixed-width />
          </span>
          <ProgressSpinner v-if="node.loading" />
          <span @mouseover="showOverlay($event, node)" @mouseleave="hideOverlay($event)">{{ node.label }}</span>
        </div>
      </template>
    </Tree>
    <OverlaySummary ref="OS" />
    <Dialog header="New folder" :visible="newFolder !== null" :modal="true" :closable="false">
      <InputText type="text" v-model="newFolderName" autofocus @keyup.enter="createFolder" />
      <template #footer>
        <Button label="Cancel" :icon="fontAwesomePro ? 'fa-regular fa-xmark' : 'pi pi-times'" @click="newFolder = null" class="p-button-text" />
        <Button label="Create" :icon="fontAwesomePro ? 'fa-solid fa-check' : 'pi pi-check'" :disabled="!newFolderName" @click="createFolder" />
      </template>
    </Dialog>
  </div>
</template>

<script async setup lang="ts">
import { computed, onMounted, onUnmounted, ref, Ref, watch } from "vue";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { EntityService, FilerService } from "@/services";
import { IM } from "@im-library/vocabulary";
import ContextMenu from "primevue/contextmenu";
import OverlaySummary from "@/components/directory/viewer/OverlaySummary.vue";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import setupTree from "@/composables/setupTree";
import createNew from "@/composables/createNew";
import { TreeNode } from "primevue/tree";
import { isArray } from "lodash";
import { isArrayHasLength, isObject } from "@im-library/helpers/DataTypeCheckers";
import { useSharedStore } from "@/stores/sharedStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useUserStore } from "@/stores/userStore";

const toast = useToast();
const confirm = useConfirm();
const sharedStore = useSharedStore();
const directoryStore = useDirectoryStore();
const userStore = useUserStore();

const conceptIri = computed(() => directoryStore.conceptIri);
const currentUser = computed(() => userStore.currentUser);
const findInTreeIri = computed(() => directoryStore.findInTreeIri);
const fontAwesomePro = computed(() => sharedStore.fontAwesomePro);

const loading = ref(true);
const overlayLocation: Ref<any> = ref({});
const items: Ref<any[]> = ref([]);
const newFolder: Ref<null | TreeNode> = ref(null);
const newFolderName = ref("");

const menu = ref();
const OS: Ref<any> = ref();
const { getCreateOptions }: { getCreateOptions: Function } = createNew();
const {
  selectedKeys,
  selectedNode,
  root,
  expandedKeys,

  createTreeNode,
  onNodeCollapse,
  onNodeDblClick,
  onNodeExpand,
  onNodeSelect,
  findPathToNode
} = setupTree();

onMounted(async () => {
  loading.value = true;
  await addParentFoldersToRoot();
  if (conceptIri.value) await findPathToNode(conceptIri.value, loading, "hierarchy-tree-bar-container");
  loading.value = false;
});

onUnmounted(() => {
  if (isObject(overlayLocation.value) && isArrayHasLength(Object.keys(overlayLocation.value))) {
    hideOverlay(overlayLocation.value);
  }
});

watch(
  () => findInTreeIri.value,
  async () => {
    if (findInTreeIri.value) await findPathToNode(findInTreeIri.value, loading, "hierarchy-tree-bar-container");
  }
);

async function addParentFoldersToRoot() {
  let IMChildren: any[] = [];
  const results = await EntityService.getEntityChildren(IM.NAMESPACE + "InformationModel");
  if (results && isArray(results)) IMChildren = results;
  for (let IMchild of IMChildren) {
    const hasNode = !!root.value.find(node => node.data === IMchild["@id"]);
    if (!hasNode) root.value.push(createTreeNode(IMchild.name, IMchild["@id"], IMchild.type, IMchild.hasGrandChildren, null, IMchild.orderNumber));
  }
  root.value.sort(byKey);
  const favNode = createTreeNode("Favourites", IM.NAMESPACE + "Favourites", [], false, null);
  favNode.typeIcon = ["fa-solid", "fa-star"];
  favNode.color = "var(--yellow-500)";
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

async function onNodeContext(event: any, node: any) {
  event.preventDefault();
  items.value = [];
  if (currentUser.value === null || !currentUser.value.roles.includes("IMAdmin")) return;
  items.value = await getCreateOptions(newFolderName, newFolder, node);

  if (selectedNode.value && node.typeIcon.includes("fa-folder")) {
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
  if (selectedNode.value && selectedNode.value.parentNode && selectedNode.value.key && target && target.key && target.children) {
    try {
      await FilerService.moveFolder(selectedNode.value.key, selectedNode.value.parentNode.key, target.key);
      toast.add({ severity: "success", summary: "Move", detail: 'Moved "' + selectedNode.value.label + '" into "' + target.label + '"', life: 3000 });
      selectedNode.value.parentNode.children = selectedNode.value.parentNode.children.filter((v: TreeNode) => v != selectedNode.value);
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
  if (selectedNode.value && selectedNode.value.parentNode && selectedNode.value.key && target && target.key && target.children) {
    try {
      await FilerService.addToFolder(selectedNode.value.key, target.key);
      toast.add({ severity: "success", summary: "Add", detail: 'Added "' + selectedNode.value.label + '" into "' + target.label + '"', life: 3000 });
      target.children.push(selectedNode.value); // Does this need to be a (deep) clone?
    } catch (e: any) {
      toast.add({ severity: "error", summary: e.response.data.title, detail: e.response.data.detail, life: 3000 });
    }
  }
}

async function createFolder() {
  if (!newFolder.value || !newFolder.value.key || !newFolderName.value) return;

  console.log("Create new folder " + newFolderName.value + " in " + newFolder.value.key);
  try {
    const iri = await FilerService.createFolder(newFolder.value.key, newFolderName.value);
    console.log("Created folder");
    console.log(iri);
    toast.add({ severity: "success", summary: "New folder", detail: 'New folder "' + newFolderName.value + '" created', life: 3000 });
    if (newFolder.value.children) {
      newFolder.value.children.push(createTreeNode(newFolderName.value, iri, [{ "@id": IM.FOLDER, name: "Folder" } as TTIriRef], false, newFolder.value));
    }
  } catch (e) {
    toast.add({ severity: "error", summary: "New folder", detail: '"' + newFolderName.value + '" already exists', life: 3000 });
  }
  newFolder.value = null;
}

async function showOverlay(event: any, node: any): Promise<void> {
  if (node.data !== "loadMore" && node.data !== "http://endhealth.info/im#Favourites") {
    await OS.value.showOverlay(event, node.key);
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

>>>.p-treenode-label {
  width: 100% !important;
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
