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
      <template #default="{ node }: any">
        <div
          class="tree-row grabbable"
          @mouseover="showOverlay($event, node)"
          @mouseleave="hideOverlay($event)"
          draggable="true"
          @dragstart="dragStart($event, node)"
        >
          <IMFontAwesomeIcon icon="fa-solid fa-grip-vertical" class="drag-icon grabbable" />
          <span v-if="!node.loading">
            <FontAwesomeIcon v-if="node.typeIcon" :icon="node.typeIcon" fixed-width :style="'color:' + node.color" />
          </span>
          <ProgressSpinner v-if="node.loading" />
          <span>{{ node.label }}</span>
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
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { useToast } from "primevue/usetoast";
import { ConceptSummary } from "@im-library/interfaces";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getNamesAsStringFromTypes } from "@im-library/helpers/ConceptTypeMethods";
import { byKey } from "@im-library/helpers/Sorters";
import { EntityService } from "@/services";
import { IM } from "@im-library/vocabulary";
import { useRouter } from "vue-router";
import { TreeNode } from "primevue/tree";
import setupTree from "@/composables/setupTree";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useRootStore } from "@/stores/root";

const store = useRootStore();
const router = useRouter();
const toast = useToast();

const treeIri: ComputedRef<string> = computed(() => store.findInEditorTreeIri);

const {
  selectedNode,
  expandedKeys,
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
  nodeHasChild
} = setupTree();

let selected: Ref<any> = ref({});
let root: Ref<TreeNode[]> = ref([]);
let loading = ref(true);
let hoveredResult: Ref<ConceptSummary> = ref({} as ConceptSummary);
let overlayLocation: Ref<any> = ref({});

const navTreeOP = ref();

watch(treeIri, async () => {
  if (treeIri) await findPathToNode(treeIri.value, loading, "hierarchy-tree-bar-container");
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
  if (treeIri.value) await findPathToNode(treeIri.value, loading, "hierarchy-tree-bar-container");
  loading.value = false;
}

async function addParentFoldersToRoot() {
  const IMChildren = await EntityService.getEntityChildren(IM.NAMESPACE + "InformationModel");
  for (let IMchild of IMChildren) {
    const hasNode = !!root.value.find(node => node.data === IMchild["@id"]);
    if (!hasNode) root.value.push(createTreeNode(IMchild.name, IMchild["@id"], IMchild.type, IMchild.hasGrandChildren, null));
  }
  root.value.sort(byKey);
  const favNode = createTreeNode("Favourites", IM.NAMESPACE + "Favourites", [], false, null, undefined);
  favNode.typeIcon = ["fa-solid", "fa-star"];
  favNode.color = "var(--yellow-500)";
  root.value.push(favNode);
}

function onNodeSelect(node: any): void {
  if (node.data === "loadMore") {
    if (!node.loading) loadMore(node);
  } else {
    selectedNode.value = node;
    // router.push({
    //   name: "Folder",
    //   params: { selectedIri: node.data }
    // });
    store.updateSelectedConceptIri(node.data);
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
