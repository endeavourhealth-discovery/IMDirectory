import { IM } from "../vocabulary";
import { TreeNode } from "../interfaces";
import { Match } from "../interfaces/AutoGen";
import { isFolder, isProperty, isQuery, isRecordModel, isValueSet } from "./ConceptTypeMethods";
import { describeMatch } from "./QueryDescriptor";
import { isArrayHasLength, isObjectHasKeys } from "./DataTypeCheckers";

export function buildMatchFromTreeNode(treeNode: TreeNode): Match {
  if (isFolder(treeNode.conceptTypes)) {
    const match = {
      where: [{ "@id": IM.IS_CONTAINED_IN, in: [{ "@id": IM.NAMESPACE + "HealthDataModel" }] }]
    } as Match;
    describeMatch([match], "match");
    return match;
  } else if (isRecordModel(treeNode.conceptTypes)) {
    const match = {
      "@type": treeNode.data
    } as Match;
    describeMatch([match], "match");
    return match;
  } else if (isValueSet(treeNode.conceptTypes) || isQuery(treeNode.conceptTypes)) {
    const match = {
      "@set": treeNode.data
    } as Match;
    describeMatch([match], "match");
    return match;
  } else if (isProperty(treeNode.conceptTypes)) {
    const match = {
      path: buildPath(treeNode),
      where: [{ "@id": treeNode.data, in: [{ "@id": "http://endhealth.info/im#ExampleConcept" }] }]
    };
    describeMatch([match], "match");
    return match;
  }
  const match = {
    "@id": treeNode.data
  } as Match;
  describeMatch([match], "match");
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
    populatedPath = path.node;
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
