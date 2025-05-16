import { TreeNode } from "@/interfaces/TreeNode";
import { TTProperty } from "@/interfaces";
import { RDF, SHACL } from "@/vocabulary";
import { getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { getNameFromRef } from "@/helpers/TTTransform";
import { TTIriRef } from "@/interfaces/AutoGen";
import { getParentNode } from "@/helpers/TreeHelper";

export function getTreeNodes(entity: any, parent: TreeNode): TreeNode[] {
  const dataModelProperties = entity[SHACL.PROPERTY];
  const groupMap = new Map<string, TreeNode>();
  for (const property of dataModelProperties) {
    if (isObjectHasKeys(property, [SHACL.GROUP]) && parent.children) {
      addGroup(groupMap, property, parent.children);
    } else {
      const propertyTreeNode = buildPropertyTreeNode(property, parent);
      addDataModel(property, propertyTreeNode);
      if (!isArrayHasLength(parent.children)) parent.children = [];
      parent.children?.push(propertyTreeNode);
    }
  }

  return parent.children!;
}

export function buildPropertyTreeNode(property: TTProperty, parent?: TreeNode) {
  // "http://www.w3.org/ns/shacl#datatype" "http://www.w3.org/ns/shacl#class" "http://www.w3.org/ns/shacl#node"
  const imtype = { iri: RDF.PROPERTY } as TTIriRef;
  let type;
  if (isObjectHasKeys(property, [SHACL.DATATYPE])) type = "datatype";
  else if (isObjectHasKeys(property, [SHACL.CLASS])) type = "class";
  else if (isObjectHasKeys(property, [SHACL.NODE])) type = "node";

  return {
    key: getKey(parent),
    label: getNameFromRef(property[SHACL.PATH][0]),
    iri: property[SHACL.PATH][0].iri,
    data: property,
    type: type,
    icon: getFAIconFromType([imtype]),
    leaf: "node" === type,
    children: [] as TreeNode[],
    parent: getParentNode(parent)
  } as TreeNode;
}

function getKey(parent: TreeNode | undefined) {
  if (!parent) return "0";
  return parent.key + parent.children!.length;
}

function addGroup(groupMap: Map<string, TreeNode>, property: TTProperty, treeNodes: TreeNode[]) {
  const group = property[SHACL.GROUP]![0];
  const treeNode = groupMap.get(group.iri);
  if (treeNode) {
    const propertyTreeNode = buildPropertyTreeNode(property, treeNode);
    addDataModel(property, propertyTreeNode);
    if (!isArrayHasLength(treeNode.children)) treeNode.children = [];
    treeNode.children?.push(propertyTreeNode);
  } else {
    const newGroup = buildGroupTreeNode(group.name, String(treeNodes.length), {} as TreeNode);
    const propertyTreeNode = buildPropertyTreeNode(property, newGroup);
    addDataModel(property, propertyTreeNode);
    if (!isArrayHasLength(newGroup.children)) newGroup.children = [];
    newGroup.children?.push(propertyTreeNode);
    treeNodes.push(newGroup);
    groupMap.set(group.iri, newGroup);
  }
}

function addDataModel(property: TTProperty, propertyTreeNode: TreeNode) {
  if ("node" === propertyTreeNode.type) {
    const dataModelTreeNode = buildDataModelTreeNode(property, propertyTreeNode);
    propertyTreeNode.children?.push(dataModelTreeNode);
  }
}

function buildDataModelTreeNode(property: TTProperty, parent: TreeNode) {
  const imtype = { iri: SHACL.NODESHAPE } as TTIriRef;

  return {
    key: getKey(parent),
    label: property[SHACL.NODE]![0].name,
    iri: property[SHACL.PATH][0].iri,
    data: property,
    conceptTypes: [imtype],
    type: "dataModel",
    icon: getFAIconFromType([imtype]),
    leaf: false,
    children: [],
    selectable: false,
    parent: getParentNode(parent),
    hasVariable: ""
  } as TreeNode;
}

function buildGroupTreeNode(label: string, key: string, parent: TreeNode) {
  return {
    key: key,
    label: label,
    type: "group",
    icon: ["fa-solid", "fa-layer-group"],
    children: [] as TreeNode[],
    selectable: false,
    parent: parent
  } as TreeNode;
}

export default {
  getTreeNodes,
  buildPropertyTreeNode
};
