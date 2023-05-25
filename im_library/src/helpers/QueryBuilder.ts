import { IM } from "../vocabulary";
import { TreeNode } from "../interfaces";
import { Match } from "../interfaces/AutoGen";
import { isFolder, isProperty, isQuery, isRecordModel, isValueSet } from "./ConceptTypeMethods";
import { describeMatch } from "./QueryDescriptor";

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
  }
  const match = {
    "@id": treeNode.data
  } as Match;
  describeMatch([match], "match");
  return match;
}

// export function buildPath() {}

export default {
  buildMatchFromTreeNode
};
