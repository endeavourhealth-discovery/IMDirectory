import { TreeNode } from "../interfaces/TreeNode";

export function getKey(parent: TreeNode | undefined) {
  if (!parent) return "0";
  return parent.key + "-" + parent.children.length;
}
