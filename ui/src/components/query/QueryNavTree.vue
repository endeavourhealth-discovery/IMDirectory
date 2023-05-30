<template>
  <div class="flex flex-column justify-content-start" id="hierarchy-tree-bar-container">
    <Tree
      :value="root"
      selectionMode="single"
      v-model:selectionKeys="selectedKeys"
      :expandedKeys="expandedKeys"
      @node-select="onNodeSelect"
      @node-expand="handleTreeNodeExpand"
      class="tree-root"
      :loading="loading"
    >
      <template #default="{ node }: any">
        <div class="tree-row" @dblclick="onNodeDblClick(node)" @contextmenu="onNodeContext($event, node)">
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
  </div>
</template>

<script async setup lang="ts">
import { computed, onMounted, onUnmounted, ref, Ref, watch } from "vue";
import { EntityService } from "@/services";
import { IM, RDF, SHACL } from "@im-library/vocabulary";
import ContextMenu from "primevue/contextmenu";
import OverlaySummary from "@/components/directory/viewer/OverlaySummary.vue";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";
import { useToast } from "primevue/usetoast";
import setupTree from "@/composables/setupTree";
import { TreeNode } from "primevue/tree";
import { isArray } from "lodash";
import { isArrayHasLength, isObject, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { useSharedStore } from "@/stores/sharedStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { getColourFromType, getFAIconFromType, isProperty, isRecordModel } from "@im-library/helpers/ConceptTypeMethods";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { TTProperty } from "@im-library/interfaces";
import { getKey, getParentNode } from "@im-library/helpers";

const emit = defineEmits({
  addRule: (payload: TreeNode) => true
});

const toast = useToast();
const sharedStore = useSharedStore();
const directoryStore = useDirectoryStore();

const conceptIri = computed(() => directoryStore.conceptIri);
const findInTreeIri = computed(() => directoryStore.findInTreeIri);
const fontAwesomePro = computed(() => sharedStore.fontAwesomePro);

const loading = ref(true);
const overlayLocation: Ref<any> = ref({});
const items: Ref<any[]> = ref([]);

const menu = ref();
const OS: Ref<any> = ref();
const { selectedKeys, selectedNode, root, expandedKeys, pageSize, createLoadMoreNode, nodeHasChild, findPathToNode } = setupTree();

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

function onNodeSelect(node: any) {
  selectedNode.value = node;
}

async function handleTreeNodeExpand(node: any) {
  node.children = [];
  if (isRecordModel(node.conceptTypes)) {
    onNodeExpand(node);
  } else if (isProperty(node.conceptTypes)) {
    onPropertyExpand(node);
  } else {
    onClassExpand(node);
  }
}

function createTreeNode(conceptName: string, conceptIri: string, conceptTypes: TTIriRef[], hasChildren: boolean, parent?: TreeNode, order?: number): TreeNode {
  return {
    key: getKey(parent as any),
    label: conceptName,
    typeIcon: getFAIconFromType(conceptTypes),
    color: getColourFromType(conceptTypes),
    conceptTypes: conceptTypes,
    data: conceptIri,
    leaf: !hasChildren && !isRecordModel(conceptTypes),
    loading: false,
    children: [] as TreeNode[],
    order: order,
    parent: getParentNode(parent as any)
  };
}

async function onPropertyExpand(node: TreeNode) {
  const ttProperty: TTProperty = node.ttproperty;
  if (isArrayHasLength(ttProperty["http://www.w3.org/ns/shacl#node"])) {
    const shaclNode = ttProperty["http://www.w3.org/ns/shacl#node"]!;
    node.children!.push(createTreeNode(shaclNode[0].name as string, shaclNode[0]["@id"], [{ "@id": SHACL.NODESHAPE }], true, node));
  } else if (isArrayHasLength(ttProperty["http://www.w3.org/ns/shacl#class"])) {
    const shaclClass = ttProperty["http://www.w3.org/ns/shacl#class"]!;
    node.children!.push(createTreeNode(shaclClass[0].name as string, shaclClass[0]["@id"], [{ "@id": SHACL.CLASS }], true, node));
  }
}

async function onNodeExpand(node: TreeNode) {
  const iri = node.data;
  const entity = await EntityService.getPartialEntity(iri, [SHACL.PROPERTY]);
  const properties: TTProperty[] = entity[SHACL.PROPERTY];

  for (const prop of properties) {
    const child = createTreeNode(
      prop["http://www.w3.org/ns/shacl#path"][0].name as string,
      prop["http://www.w3.org/ns/shacl#path"][0]["@id"],
      [{ "@id": RDF.PROPERTY }],
      !isArrayHasLength(prop["http://www.w3.org/ns/shacl#datatype"]),
      node
    );
    child.ttproperty = prop;
    node.children!.push(child);
  }
}

async function onClassExpand(node: TreeNode) {
  node.children = [];
  if (isObjectHasKeys(node)) {
    node.loading = true;
    if (!isObjectHasKeys(expandedKeys.value, [node.key!])) expandedKeys.value[node.key!] = true;

    const children = await EntityService.getPagedChildren(node.data, 1, pageSize.value);
    if (children.totalCount === 0) node.leaf = true;
    children.result.forEach((child: any) => {
      if (!nodeHasChild(node, child)) node.children!.push(createTreeNode(child.name, child["@id"], child.type, child.hasChildren, node));
    });
    if (children.totalCount >= pageSize.value) {
      node.children!.push(createLoadMoreNode(node, 2, children.totalCount));
    }
    node.loading = false;
  }
}

function onNodeDblClick(node: any) {
  console.log(JSON.stringify(node));
  emit("addRule", node);
}

async function addParentFoldersToRoot() {
  let IMChildren: any[] = [];
  const results = await EntityService.getEntityChildren(IM.NAMESPACE + "InformationModel");
  if (results && isArray(results)) IMChildren = results;
  for (let [index, IMchild] of IMChildren.entries()) {
    const hasNode = !!root.value.find(node => node.data === IMchild["@id"]);
    if (!hasNode) {
      const node = createTreeNode(IMchild.name, IMchild["@id"], IMchild.type, IMchild.hasGrandChildren, undefined, IMchild.orderNumber);
      node.key = `${index}`;
      root.value.push(node);
    }
  }
  root.value.sort(byData);
}

function byData(a: any, b: any): number {
  // order by order number
  if (a.order && b.order) return a.order - b.order;
  else if (a.order && !b.order) return -1;
  else if (!a.order && b.order) return 1;
  // order alphabetically
  else if (a.data > b.data) return 1;
  else if (b.data > a.data) return -1;
  return 0;
}

async function onNodeContext(event: any, node: any) {
  event.preventDefault();
  items.value = [];
}

async function showOverlay(event: any, node: any): Promise<void> {
  if (node.data !== "loadMore" && node.data !== "http://endhealth.info/im#Favourites") {
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
