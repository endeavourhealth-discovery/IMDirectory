import { IM, SHACL } from "../vocabulary";
import { TreeNode } from "../interfaces";
import { Match, Property } from "../interfaces/AutoGen";
import { isFolder, isProperty, isQuery, isRecordModel, isValueSet } from "./ConceptTypeMethods";
import { describeMatch, describeProperty } from "./QueryDescriptor";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";

export function buildMatchFromTreeNode(treeNode: TreeNode): Match {
  if (isFolder(treeNode.conceptTypes)) {
    const match = {
      key: treeNode.key,
      where: [{ "@id": IM.IS_CONTAINED_IN, in: [{ "@id": IM.NAMESPACE + "HealthDataModel" }] }]
    } as Match;
    describeMatch([match]);
    return match;
  } else if (isRecordModel(treeNode.conceptTypes)) {
    const match = {
      key: treeNode.key,
      "@type": treeNode.data
    } as Match;
    describeMatch([match]);
    return match;
  } else if (isValueSet(treeNode.conceptTypes) || isQuery(treeNode.conceptTypes)) {
    const match = {
      key: treeNode.key,
      "@set": treeNode.data
    } as Match;
    describeMatch([match]);
    return match;
  } else if (isProperty(treeNode.conceptTypes)) {
    return buildMatchFromProperty(treeNode);
  }
  const match = {
    key: treeNode.key,
    "@id": treeNode.data
  } as Match;
  describeMatch([match]);
  return match;
}

export function buildWhereFromProperty(treeNode: TreeNode) {
  const property = { "@id": treeNode.data } as Property;
  // string - is ""
  // boolean - is true
  // long - is true
  // DateTime - is today's date

  if (isObjectHasKeys(treeNode.ttproperty, [SHACL.DATATYPE])) {
    property.operator = "=";
    property.value = "";
  }
  describeProperty([property]);
  (property as any).key = treeNode.key;
  (property as any).path = buildPath(treeNode);
  return property;
}

export function buildMatchFromProperty(treeNode: TreeNode) {
  const property = { "@id": treeNode.data } as Property;
  // string - is ""
  // boolean - is true
  // long - is true
  // DateTime - is today's date

  if (isObjectHasKeys(treeNode.ttproperty, [SHACL.DATATYPE])) {
    property.operator = "=";
    property.value = "";
  }
  describeProperty([property]);

  const match = {
    key: treeNode.key,
    path: buildPath(treeNode),
    property: [property]
  } as Match;
  describeMatch([match]);
  return match;
}

export function buildPath(treeNode: TreeNode) {
  const pathList = [] as any[];
  if (isObjectHasKeys(treeNode.parent)) findPathsRecursively(pathList, treeNode.parent);
  let path = {} as any;
  buildPathRecursively(path, pathList);
  return path.path;
}

function buildPathRecursively(path: any, pathList: any[]) {
  const pathItem = pathList.shift();
  let populatedPath;
  if (isObjectHasKeys(pathItem, ["@id"])) {
    path.path = pathItem;
    populatedPath = path.path;
  } else if (isObjectHasKeys(pathItem, ["@type"])) {
    path.node = pathItem;
    populatedPath = path.match;
  }
  if (isArrayHasLength(pathList)) {
    buildPathRecursively(populatedPath, pathList);
  }
}

function findPathsRecursively(pathList: any[], treeNode: TreeNode) {
  if (isRecordModel(treeNode.conceptTypes) && isObjectHasKeys(treeNode.parent) && isProperty(treeNode.parent.conceptTypes)) {
    pathList.unshift({ "@type": treeNode.data });
  } else if (isProperty(treeNode.conceptTypes)) {
    pathList.unshift({ "@id": treeNode.data });
  }

  if (treeNode.parent && (isProperty(treeNode.parent.conceptTypes) || isRecordModel(treeNode.parent.conceptTypes)))
    findPathsRecursively(pathList, treeNode.parent);
}

export default {
  buildMatchFromTreeNode
};
