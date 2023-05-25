import { IM } from "../vocabulary";
import { TreeNode } from "../interfaces";
import { Match } from "../interfaces/AutoGen";
import { isFolder } from "./ConceptTypeMethods";
import { describeMatch } from "./QueryDescriptor";

export function buildMatchFromTreeNode(treeNode: TreeNode): Match {
  if (isFolder(treeNode.conceptTypes)) {
    const match = {
      where: [{ "@id": IM.IS_CONTAINED_IN, in: [{ "@id": IM.NAMESPACE + "HealthDataModel" }] }]
    };
    describeMatch([match], "match");
    return match;
  }
  return {};
}

export default {
  buildMatchFromTreeNode
};
