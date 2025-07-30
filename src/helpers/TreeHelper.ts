import { TreeNode } from "../interfaces/TreeNode";

export function getKey(parent: TreeNode | undefined) {
  if (!parent) return "0";
  return parent.key + "-" + parent.children?.length;
}

export function getParentNode(parent: TreeNode | undefined) {
  if (parent) {
    const parentNode = { ...parent };
    if (parentNode.children) delete parentNode.children;
    return parentNode;
  }
}
