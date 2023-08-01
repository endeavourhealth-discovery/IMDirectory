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
import { onMounted, onUnmounted, ref } from "vue";
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
import { Match, Property } from "@im-library/interfaces/AutoGen";
import _ from "lodash";

interface Props {
  baseType: string;
  editMatch: Match;
  variableMap: Map<string, any>;
  addMode: "editProperty" | "addBefore" | "addAfter";
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
  if (props.addMode === "editProperty") await populateCheckBoxes(props.editMatch);
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

async function populateCheckBoxes(match: Match) {
  if (isArrayHasLength(match.property)) {
    for (const property of match.property!) {
      selectByIri(property, property["@id"]!, root.value);
    }
  }
}

async function selectByIri(property: Property, iri: string, nodes: TreeNode[]) {
  let found = nodes.find(node => node.data === iri);
  if (found) {
    found.property = property;
    select(found);
  } else {
    found = nodes.find(node => node.children!.some(grandChild => grandChild.data === iri));
    if (found) {
      expandedKeys.value[found.key!] = true;
      if (isArrayHasLength(found.children)) {
        await handleTreeNodeExpand(found);
        if (isArrayHasLength(found.children)) selectByIri(property, iri, found.children!);
      }
    }
  }
}

function onUnselect(node: any) {
  if (node.property) delete node.property;
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
  const resolvedIri = resolveIri(props.baseType);
  if (resolvedIri) await addBaseEntityToRoot(resolvedIri);
  if (props.variableMap && props.variableMap.size) addVariableNodes();
}

function addVariableNodes() {
  for (const [key, object] of props.variableMap.entries()) {
    const types: string[] = [];
    getVariableTypesFromMatch(object, types);
    for (const typeIri of types) {
      const name = key + " (" + getNameFromRef({ "@id": typeIri }) + ")";
      const treeNode = createTreeNode(name, typeIri, [{ "@id": SHACL.NODESHAPE }], true, false, { key: "" + root.value.length, children: [] }, key);
      root.value.push(treeNode);
    }
  }
}

function getVariableTypesFromMatch(match: Match, types: string[]) {
  const type = resolveIri(match["@type"] || "");
  if (type && !types.includes(type)) types.push(type);
  if (isArrayHasLength(match.match))
    for (const nestedMatch of match.match!) {
      getVariableTypesFromMatch(nestedMatch, types);
    }

  if (isArrayHasLength(match.property))
    for (const property of match.property!) {
      getVariableTypesFromProperty(property, types);
    }

  if (match.nodeRef && props.variableMap.has(match.nodeRef)) {
    const nodeRefMatch = props.variableMap.get(match.nodeRef);
    getVariableTypesFromMatch(nodeRefMatch, types);
  }
}

function getVariableTypesFromProperty(property: Property, types: string[]) {
  if (isObjectHasKeys(property, ["match"])) getVariableTypesFromMatch(property.match!, types);

  if (isArrayHasLength(property.property))
    for (const nestedProperty of property.property!) {
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
