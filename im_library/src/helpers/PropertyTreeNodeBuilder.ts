import { TreeNode } from "../interfaces/TreeNode";
import { TTIriRef, TTProperty } from "../interfaces";
import { IM, SHACL } from "../vocabulary";
import { getFAIconFromType } from "./ConceptTypeMethods";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";
import { getNameFromRef } from "./TTTransform";

export function getTreeNodes(entity: any, parent: TreeNode): TreeNode[] {
  const dataModelProperties = entity[SHACL.PROPERTY];
  const groupMap = new Map<string, TreeNode>();
  for (const property of dataModelProperties) {
    if (isObjectHasKeys(property, [SHACL.GROUP])) {
      addGroup(groupMap, property, parent.children!);
    } else {
      const propertyTreeNode = buildPropertyTreeNode(property, parent);
      addDataModel(property, propertyTreeNode);
      if (!isArrayHasLength(parent.children)) parent.children = [];
      parent.children.push(propertyTreeNode);
    }
  }

  return parent.children;
}

export function buildPropertyTreeNode(property: TTProperty, parent?: TreeNode) {
  // "http://www.w3.org/ns/shacl#datatype" "http://www.w3.org/ns/shacl#class" "http://www.w3.org/ns/shacl#node"
  const imtype = { "@id": IM.NAMESPACE + "Property" } as TTIriRef;
  let type;
  if (isObjectHasKeys(property, [SHACL.DATATYPE])) type = "datatype";
  else if (isObjectHasKeys(property, [SHACL.CLASS])) type = "class";
  else if (isObjectHasKeys(property, [SHACL.NODE])) type = "node";

  return {
    key: getKey(parent),
    label: getNameFromRef(property[SHACL.PATH][0]),
    data: property,
    type: type,
    icon: getFAIconFromType([imtype]),
    leaf: "node" === type ? false : true,
    children: [] as TreeNode[],
    parent: parent
  } as TreeNode;
}

function getKey(parent: TreeNode | undefined) {
  if (!parent) return "0";
  return parent.key! + parent.children!.length;
}

function addGroup(groupMap: Map<string, TreeNode>, property: TTProperty, treeNodes: TreeNode[]) {
  const group = property[SHACL.GROUP][0];
  const treeNode = groupMap.get(group["@id"]);
  if (treeNode) {
    const propertyTreeNode = buildPropertyTreeNode(property, treeNode);
    addDataModel(property, propertyTreeNode);
    if (!isArrayHasLength(treeNode.children)) treeNode.children = [];
    treeNode.children.push(propertyTreeNode);
  } else {
    const newGroup = buildGroupTreeNode(group.name, String(treeNodes.length), {} as TreeNode);
    const propertyTreeNode = buildPropertyTreeNode(property, newGroup);
    addDataModel(property, propertyTreeNode);
    if (!isArrayHasLength(newGroup.children)) newGroup.children = [];
    newGroup.children.push(propertyTreeNode);
    treeNodes.push(newGroup);
    groupMap.set(group["@id"], newGroup);
  }
}

function addDataModel(property: TTProperty, propertyTreeNode: TreeNode) {
  if ("node" === propertyTreeNode.type) {
    const dataModelTreeNode = buildDataModelTreeNode(property, propertyTreeNode);
    propertyTreeNode.children?.push(dataModelTreeNode);
  }
}

function buildDataModelTreeNode(property: TTProperty, parent: TreeNode) {
  const imtype = { "@id": SHACL.NODESHAPE } as TTIriRef;

  return {
    key: getKey(parent),
    label: property[SHACL.NODE][0].name,
    data: property,
    type: "dataModel",
    icon: getFAIconFromType([imtype]),
    leaf: false,
    children: [],
    selectable: false,
    parent: parent
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
