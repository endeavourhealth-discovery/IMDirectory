<template>
  <div class="query-tree-wrapper">
    <div class="query-tree-nav" id="hierarchy-tree-bar-container">
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
          <div class="tree-row">
            <span v-if="!node.loading">
              <IMFontAwesomeIcon v-if="node.typeIcon" :style="'color:' + node.color" :icon="node.typeIcon" fixed-width />
            </span>
            <ProgressSpinner v-if="node.loading" />
            <span @mouseover="showOverlay($event, node)" @mouseleave="hideOverlay($event)">{{ node.label }}</span>
            <Checkbox v-if="isProperty(node.conceptTypes)" v-model="node.selected" :binary="true" @input="onInput(node, $event)" />
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
import { RDF, SHACL } from "@im-library/vocabulary";
import OverlaySummary from "@/components/directory/viewer/OverlaySummary.vue";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";
import setupTree from "@/composables/setupTree";
import setupQueryTree from "@/composables/setupQueryTree";
import { TreeNode } from "primevue/tree";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { isProperty, isRecordModel } from "@im-library/helpers/ConceptTypeMethods";
import { TTProperty } from "@im-library/interfaces";
import { getNameFromRef, resolveIri } from "@im-library/helpers/TTTransform";
import { Match } from "@im-library/interfaces/AutoGen";

interface Props {
  baseEntityMatch: Match;
}
const props = defineProps<Props>();

const emit = defineEmits({
  addProperty: (_payload: TreeNode) => true,
  removeProperty: (_payload: TreeNode) => true
});

const loading = ref(true);
const selectedProperties: Ref<TreeNode> = ref([]);
const { selectedKeys, selectedNode, root, expandedKeys, pageSize, createLoadMoreNode, nodeHasChild } = setupTree();
const { removeOverlay, OS, createTreeNode, hideOverlay, showOverlay } = setupQueryTree();

onMounted(async () => {
  loading.value = true;
  await addParentFoldersToRoot();
  loading.value = false;
});

onUnmounted(() => {
  removeOverlay();
});

function onInput(node: TreeNode, bool: boolean) {
  if (bool) {
    selectedProperties.value.push(node);
    emit("addProperty", node);
  } else {
    selectedProperties.value = selectedProperties.value.filter((selected: TreeNode) => selected.key !== node.key);
    emit("removeProperty", node);
  }
}

function onNodeSelect(node: any) {
  selectedNode.value = node;
}

async function handleTreeNodeExpand(node: any) {
  if (!isArrayHasLength(node.children))
    if (isRecordModel(node.conceptTypes)) {
      onNodeExpand(node);
    } else if (isProperty(node.conceptTypes)) {
      onPropertyExpand(node);
    } else {
      onClassExpand(node);
    }
}

async function onPropertyExpand(node: TreeNode) {
  const ttProperty: TTProperty = node.ttproperty;
  if (isArrayHasLength(ttProperty["http://www.w3.org/ns/shacl#node"])) {
    const shaclNode = ttProperty["http://www.w3.org/ns/shacl#node"]!;
    node.children!.push(createTreeNode(shaclNode[0].name as string, shaclNode[0]["@id"], [{ "@id": SHACL.NODESHAPE }], true, node));
  } else if (isArrayHasLength(ttProperty["http://www.w3.org/ns/shacl#class"])) {
    const shaclClass = ttProperty["http://www.w3.org/ns/shacl#class"]!;
    node.children!.push(createTreeNode(shaclClass[0].name as string, shaclClass[0]["@id"], [{ "@id": SHACL.CLASS }], false, node));
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
      !isArrayHasLength(prop["http://www.w3.org/ns/shacl#datatype"]) && !isArrayHasLength(prop["http://www.w3.org/ns/shacl#class"]),
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

async function addParentFoldersToRoot() {
  const iri = (props.baseEntityMatch["@id"] || props.baseEntityMatch["@set"] || props.baseEntityMatch["@type"]) as string;
  if (iri) {
    const resolvedIri = resolveIri(iri);
    await addBaseEntityToRoot(resolvedIri);
  }
}

async function addBaseEntityToRoot(iri: string) {
  const name = getNameFromRef({ "@id": iri });
  const parent = createTreeNode(name, iri, [{ "@id": SHACL.NODESHAPE }], true, undefined);
  root.value.push(parent);
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
