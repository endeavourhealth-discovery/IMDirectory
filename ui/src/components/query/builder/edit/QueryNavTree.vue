<template>
  <div class="query-tree-wrapper">
    <div class="query-tree-nav" id="hierarchy-tree-bar-container">
      <Tree :value="root" :expandedKeys="expandedKeys" @node-expand="handleTreeNodeExpand" class="tree-root" :loading="loading">
        <template #default="{ node }: any">
          <div class="tree-row">
            <span v-if="node.selectable"><Checkbox v-model="node.selected" :binary="true" @input="onCheckInput($event, node)" /></span>
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
import { onMounted, onUnmounted, ref, Ref, watch } from "vue";
import { EntityService } from "@/services";
import { IM, RDF, SHACL } from "@im-library/vocabulary";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import setupTree from "@/composables/setupTree";
import setupQueryTree from "@/composables/setupQueryTree";
import { TreeNode } from "primevue/tree";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { isProperty, isRecordModel } from "@im-library/helpers/ConceptTypeMethods";
import { TTProperty } from "@im-library/interfaces";
import { getNameFromRef, resolveIri } from "@im-library/helpers/TTTransform";
import { Match } from "@im-library/interfaces/AutoGen";
import _ from "lodash";

interface Props {
  baseType: string;
  editMatch: Match;
}
const props = defineProps<Props>();

const emit = defineEmits({
  onSelectedUpdate: (_payload: TreeNode[]) => true
});

const loading = ref(true);
const { root, expandedKeys, pageSize, createLoadMoreNode, nodeHasChild } = setupTree();
const { removeOverlay, OS, createTreeNode, hideOverlay, showOverlay, select, unselect, selectedNodes } = setupQueryTree();

onMounted(async () => {
  loading.value = true;
  await addParentFoldersToRoot();
  await populateCheckBoxes(props.editMatch);
  loading.value = false;
});

onUnmounted(() => {
  removeOverlay();
});

async function onCheckInput(check: boolean, node: TreeNode) {
  if (check) onSelect(node);
  else onUnselect(node);
  emit("onSelectedUpdate", selectedNodes.value);
}

async function populateCheckBoxes(match: Match) {}

async function selectByKey(key: string) {
  const keys = key.split("-");
  const lastKey = keys.length;
  let nodes = root.value;
  for (const [index, keySplit] of keys.entries()) {
    if (index !== lastKey - 1) {
      const parentNode = nodes[+keySplit];
      expandedKeys.value[parentNode.key!] = true;
      if (!isArrayHasLength(parentNode.children)) await handleTreeNodeExpand(parentNode);
      if (isArrayHasLength(parentNode.children)) nodes = parentNode.children!;
    } else {
      select(nodes[+keySplit]);
    }
  }
}

async function selectByIri(iri: string, nodes: TreeNode[]) {
  let found = nodes.find(node => node.data === iri);
  if (found) {
    select(found);
  } else {
    found = nodes.find(node => node.children!.some(grandChild => grandChild.data === iri));
    if (found) {
      expandedKeys.value[found.key!] = true;
      if (isArrayHasLength(found.children)) {
        await handleTreeNodeExpand(found);
        if (isArrayHasLength(found.children)) selectByIri(iri, found.children!);
      }
    }
  }
}

async function selectByPath(path: any, propertyIri: string, nodes: TreeNode[], nodeKeys: string[]) {
  const iriUnresolved = path["@id"] ?? path["@type"];
  const iri = resolveIri(iriUnresolved);
  let foundLeafProperty = nodes.find(node => node.data === propertyIri);
  let found = nodes.find(node => node.data === iri);
  let foundNested = nodes.find(node => node.children!.some(grandChild => grandChild.data === iri));

  if (foundLeafProperty) {
    select(foundLeafProperty);
  } else if (found) {
    expandedKeys.value[found.key!] = true;
    if (!isArrayHasLength(found)) await handleTreeNodeExpand(found);
    if (isArrayHasLength(found.children)) {
      if (path.path || path.node) await selectByPath(path.node ?? path.path, propertyIri, found.children!, nodeKeys);
      else {
        foundLeafProperty = found.children!.find(node => node.data === propertyIri);
        if (foundLeafProperty) {
          select(foundLeafProperty);
          nodeKeys.push(foundLeafProperty.key!);
        }
      }
    }
  } else if (foundNested) {
    expandedKeys.value[foundNested.key!] = true;
    if (!isArrayHasLength(foundNested.children)) await handleTreeNodeExpand(found);
    if (isArrayHasLength(foundNested.children) && (path.path || path.node)) {
      await selectByPath(path, propertyIri, foundNested.children!, nodeKeys);
    }
  }
}

function onUnselect(node: any) {
  unselect(node);
}

function onSelect(node: any) {
  select(node);
}

async function handleTreeNodeExpand(node: any) {
  if (!isArrayHasLength(node.children))
    if (isRecordModel(node.conceptTypes)) {
      await onNodeExpand(node);
    } else if (isProperty(node.conceptTypes)) {
      await onPropertyExpand(node);
    } else {
      await onClassExpand(node);
    }
}

async function onPropertyExpand(node: TreeNode) {
  const ttProperty: TTProperty = node.ttproperty;
  if (isArrayHasLength(ttProperty["http://www.w3.org/ns/shacl#node"])) {
    const shaclNode = ttProperty["http://www.w3.org/ns/shacl#node"]!;
    node.children!.push(createTreeNode(shaclNode[0].name as string, shaclNode[0]["@id"], [{ "@id": SHACL.NODESHAPE }], true, false, node));
  } else if (isArrayHasLength(ttProperty["http://www.w3.org/ns/shacl#class"])) {
    const shaclClass = ttProperty["http://www.w3.org/ns/shacl#class"]!;
    node.children!.push(createTreeNode(shaclClass[0].name as string, shaclClass[0]["@id"], [{ "@id": SHACL.CLASS }], false, false, node));
  }
}

async function onNodeExpand(node: TreeNode) {
  const iri = node.data;
  const entity = await EntityService.getPartialEntity(iri, [SHACL.PROPERTY]);
  const properties: TTProperty[] = entity[SHACL.PROPERTY];

  for (const prop of properties) {
    if (isObjectHasKeys(prop, ["http://www.w3.org/ns/shacl#group"])) {
      const groupRef = prop["http://www.w3.org/ns/shacl#group"]![0];
      let groupNode = node.children?.find(child => child.data === groupRef["@id"]);
      if (!groupNode) {
        groupNode = createTreeNode(getNameFromRef(groupRef), groupRef["@id"], [{ "@id": IM.FOLDER }], true, false, node, groupRef.order);
        node.children?.push(groupNode);
      }
      const propertyNode = buildTreeNodeFromTTProperty(prop, groupNode);
      groupNode.children?.push(propertyNode);
    } else {
      const propertyNode = buildTreeNodeFromTTProperty(prop, node);
      node.children!.push(propertyNode);
    }
  }
}

function buildTreeNodeFromTTProperty(property: TTProperty, parent?: TreeNode) {
  const child = createTreeNode(
    property["http://www.w3.org/ns/shacl#path"][0].name as string,
    property["http://www.w3.org/ns/shacl#path"][0]["@id"],
    [{ "@id": RDF.PROPERTY }],
    !isArrayHasLength(property["http://www.w3.org/ns/shacl#datatype"]) && !isArrayHasLength(property["http://www.w3.org/ns/shacl#class"]),
    true,
    parent
  );
  child.ttproperty = property;
  return child;
}

async function onClassExpand(node: TreeNode) {
  node.children = [];
  if (isObjectHasKeys(node)) {
    node.loading = true;
    if (!isObjectHasKeys(expandedKeys.value, [node.key!])) expandedKeys.value[node.key!] = true;
    const children = await EntityService.getPagedChildren(node.data, 1, pageSize.value);
    if (children.totalCount === 0) node.leaf = true;
    children.result.forEach((child: any) => {
      if (!nodeHasChild(node, child)) node.children!.push(createTreeNode(child.name, child["@id"], child.type, child.hasChildren, false, node));
    });
    if (children.totalCount >= pageSize.value) {
      node.children!.push(createLoadMoreNode(node, 2, children.totalCount));
    }
    node.loading = false;
  }
}

async function addParentFoldersToRoot() {
  if (props.baseType) {
    const resolvedIri = resolveIri(props.baseType);
    await addBaseEntityToRoot(resolvedIri);
  }
}

async function addBaseEntityToRoot(iri: string) {
  const name = getNameFromRef({ "@id": iri });
  const parent = createTreeNode(name, iri, [{ "@id": SHACL.NODESHAPE }], true, false, undefined);
  expandedKeys.value[parent.key!] = true;
  await onNodeExpand(parent);
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
