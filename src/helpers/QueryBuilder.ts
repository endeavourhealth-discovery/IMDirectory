import { SHACL } from "../vocabulary";
import { TreeNode } from "../interfaces";
import { Match, Operator, Where, Query } from "../interfaces/AutoGen";
import { isFolder, isFunction, isProperty, isRecordModel } from "./ConceptTypeMethods";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";
import { cloneDeep } from "lodash-es";
import { v4 } from "uuid";

export function buildProperty(treeNode: TreeNode): Where | Match {
  const flatList: TreeNode[] = [];
  populateFlatListOfNodesRecursively(flatList, treeNode);
  let currentMatchOrProperty = {};
  for (const [index, treeNode] of flatList.entries()) {
    if (!index) {
      const parentProperty: any = buildPropertyFromTreeNode(treeNode);
      if (isObjectHasKeys(currentMatchOrProperty)) parentProperty.match = cloneDeep(currentMatchOrProperty);
      currentMatchOrProperty = parentProperty;
    } else if (isRecordModel(treeNode.conceptTypes)) {
      const parentMatch = { iri: v4(), typeOf: { iri: treeNode.data }, where: [cloneDeep(currentMatchOrProperty)] };
      currentMatchOrProperty = parentMatch;
    } else if (isProperty(treeNode.conceptTypes) || isFunction(treeNode.conceptTypes)) {
      const parentProperty: any = { iri: treeNode.data };
      if (isObjectHasKeys(currentMatchOrProperty)) parentProperty.match = cloneDeep(currentMatchOrProperty);
      currentMatchOrProperty = parentProperty;
    }
  }

  return currentMatchOrProperty as Where;
}

function populateFlatListOfNodesRecursively(flatList: TreeNode[], treeNode: TreeNode) {
  const isRoot = treeNode.parent ? treeNode.parent.key === "0" : true;
  if (!isFolder(treeNode.conceptTypes) && !isRoot) flatList.push(treeNode);
  if (treeNode.parent && !isRoot) populateFlatListOfNodesRecursively(flatList, treeNode.parent);
}

function buildPropertyFromTreeNode(treeNode: TreeNode) {
  if (treeNode.property) return treeNode.property;
  const property = { iri: treeNode.data } as Where;
  // string - is ""
  // boolean - is true
  // long - is true
  // DateTime - is today's date

  if (isObjectHasKeys(treeNode.ttproperty, [SHACL.DATATYPE])) {
    property.operator = Operator.eq;
    property.value = "";
  } else if (isObjectHasKeys(treeNode.ttproperty, [SHACL.CLASS])) {
    property.is = [];
  }
  (property as any).key = treeNode.key;
  return property as Where;
}
