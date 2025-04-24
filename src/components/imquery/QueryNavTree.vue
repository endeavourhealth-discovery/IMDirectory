<template>
  <div class="query-tree-wrapper">
    <div class="query-tree-nav" id="hierarchy-tree-bar-container">
      <Tree
        v-model:selection-keys="selectedKeys"
        selectionMode="single"
        :value="root"
        :expandedKeys="expandedKeys"
        :loading="loading"
        class="tree-root"
        @node-expand="handleTreeNodeExpand"
        @node-select="onSelect"
      >
        <template #default="{ node }: any">
          <div class="tree-row">
            <span v-if="!node.loading">
              <IMFontAwesomeIcon v-if="node.typeIcon" :style="'color:' + node.color" :icon="node.typeIcon" fixed-width />
            </span>
            <ProgressSpinner v-if="node.loading" />
            <span @mouseover="showOverlay($event, node.data)" @mouseleave="hideOverlay">{{ node.label }}</span>
          </div>
        </template>
      </Tree>
      <OverlaySummary ref="OS" />
    </div>
  </div>
</template>

<script async setup lang="ts">
import { Ref, inject, onMounted, onUnmounted, ref, watch } from "vue";
import { EntityService } from "@/services";
import { IM, RDF, SHACL } from "@/vocabulary";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import setupTree from "@/composables/setupTree";
import type { TreeNode } from "primevue/treenode";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { isFolder, isFunction, isProperty, isRecordModel } from "@/helpers/ConceptTypeMethods";
import { TTProperty } from "@/interfaces";
import { getNameFromRef, resolveIri } from "@/helpers/TTTransform";
import { Match, TTIriRef, Where } from "@/interfaces/AutoGen";
import setupOverlay from "@/composables/setupOverlay";
import { getKey, getParentNode } from "@/helpers";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";

interface Props {
  editMatch: Match;
  showVariableOptions: boolean;
  dmIri: string;
}
const props = defineProps<Props>();
const modelSelectedProperty = defineModel<TreeNode | undefined>("selectedProperty");
const variableMap = inject("variableMap") as Ref<{ [key: string]: any }>;
const selectedNode = ref();

const loading = ref(true);
const { root, expandedKeys, pageSize, createLoadMoreNode, nodeHasChild, selectedKeys } = setupTree();
const { OS, showOverlay, hideOverlay } = setupOverlay();

watch(
  () => props.dmIri,
  async () => await init()
);

onMounted(async () => await init());

async function init() {
  loading.value = true;
  await addParentFoldersToRoot();
  if (isArrayHasLength(props.editMatch.where)) await populateCheckBoxes(props.editMatch);
  loading.value = false;
}

async function populateCheckBoxes(match: Match) {
  if (isArrayHasLength(match.where)) {
    for (const property of match.where!) {
      selectByIri(property, property["@id"]!, root.value);
    }
  }
}

async function selectByIri(property: Where, iri: string, nodes: TreeNode[]) {
  let found = nodes.find(node => node.data === iri);
  if (found) {
    found.property = property;
    select(found);
  } else {
    found = nodes.find(node =>
      node.children!.some(grandChild => {
        if (grandChild.data === iri) return true;
        else
          return (
            isFolder(grandChild.conceptTypes) &&
            isArrayHasLength(grandChild.children) &&
            grandChild.children!.some(grandGrandChild => grandGrandChild.data === iri)
          );
      })
    );
    if (found) {
      expandedKeys.value[found.key!] = true;
      if (isArrayHasLength(found.children)) {
        await handleTreeNodeExpand(found);
        if (isArrayHasLength(found.children)) selectByIri(property, iri, found.children!);
      }
    }
  }
}

function createTreeNode(
  conceptName: string,
  conceptIri: string,
  conceptTypes: TTIriRef[],
  hasChildren: boolean,
  selectable: boolean,
  parent?: TreeNode,
  hasVariable?: string,
  order?: number
): TreeNode {
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
    parent: getParentNode(parent as any),
    order: order,
    selectable: selectable,
    hasVariable: hasVariable
  };
}

function select(node: TreeNode) {
  selectedNode.value = node;
}

function onSelect(node: any) {
  select(node);
  modelSelectedProperty.value = selectedNode.value;
}

async function handleTreeNodeExpand(node: any) {
  if (!isArrayHasLength(node.children))
    if (isRecordModel(node.conceptTypes)) {
      await onNodeExpand(node);
    } else if (isProperty(node.conceptTypes) || isFunction(node.conceptTypes)) {
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
  let properties: TTProperty[] = entity[SHACL.PROPERTY];

  // filter out inherited-duplicated properties
  if (isArrayHasLength(node.inheritedProps)) {
    properties = properties.filter(
      prop => !(node.inheritedProps as TreeNode[]).some(inherited => inherited.data === prop["http://www.w3.org/ns/shacl#path"][0]["@id"])
    );
  }

  // add properties
  for (const prop of properties) {
    if (isObjectHasKeys(prop, ["http://www.w3.org/ns/shacl#group"])) {
      const groupRef = prop["http://www.w3.org/ns/shacl#group"]![0];
      let groupNode = node.children?.find(child => child.data === groupRef["@id"]);
      if (!groupNode) {
        groupNode = createTreeNode(getNameFromRef(groupRef), groupRef["@id"], [{ "@id": IM.FOLDER }], true, false, node, undefined, groupRef.order);
        node.children?.push(groupNode);
      }
      const propertyNode = buildTreeNodeFromTTProperty(prop, groupNode);
      groupNode.children?.push(propertyNode);
    } else {
      const propertyNode = buildTreeNodeFromTTProperty(prop, node);
      node.children!.push(propertyNode);
    }
  }

  // add subTypes
  const subTypes = await EntityService.getEntityChildren(iri);
  for (const subType of subTypes) {
    const subTypeNode = createTreeNode(subType.name, subType["@id"], subType.type, true, false, node);
    subTypeNode.inheritedProps = [...node.children!];
    node.children!.push(subTypeNode);
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
  const resolvedIri = resolveIri(props.dmIri);
  if (resolvedIri) await addBaseEntityToRoot(resolvedIri);
  if (props.showVariableOptions && variableMap.value && variableMap.value.size) addVariableNodes();
}

function addVariableNodes() {
  for (const key of Object.keys(variableMap.value)) {
    const types: string[] = [];
    getVariableTypesFromMatch(variableMap.value[key], types);
    for (const typeIri of types) {
      const name = key + " (" + getNameFromRef({ "@id": typeIri }) + ")";
      const treeNode = createTreeNode(name, typeIri, [{ "@id": SHACL.NODESHAPE }], true, false, { key: "" + root.value.length, children: [] }, key);
      root.value.push(treeNode);
    }
  }
}

function getVariableTypesFromMatch(match: Match, types: string[]) {
  const type = isObjectHasKeys(match.typeOf, ["@id"]) ? resolveIri(match.typeOf!["@id"]!) : resolveIri("");

  if (type && !types.includes(type)) types.push(type);
  if (isArrayHasLength(match.match))
    for (const nestedMatch of match.match!) {
      getVariableTypesFromMatch(nestedMatch, types);
    }

  if (isArrayHasLength(match.where))
    for (const property of match.where!) {
      getVariableTypesFromProperty(property, types);
    }

  if (match.nodeRef && variableMap.value[match.nodeRef]) {
    const nodeRefMatch = variableMap.value[match.nodeRef];
    getVariableTypesFromMatch(nodeRefMatch, types);
  }
}

function getVariableTypesFromProperty(property: Where, types: string[]) {
  if (isObjectHasKeys(property, ["match"])) getVariableTypesFromMatch(property.match!, types);

  if (isArrayHasLength(property.where))
    for (const nestedProperty of property.where!) {
      getVariableTypesFromProperty(nestedProperty, types);
    }
}

async function addBaseEntityToRoot(iri: string) {
  const name = getNameFromRef({ "@id": iri });
  const parent = createTreeNode(name, iri, [{ "@id": SHACL.NODESHAPE }], true, false, { key: "" + root.value.length, children: [] });
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

.tree-row .p-progressspinner {
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
  justify-content: space-between;
}
</style>
