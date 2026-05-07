import type { TreeNode } from "primevue/treenode";

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

export function findNodeByKey(nodes: TreeNode[], key: string): TreeNode | undefined {
  for (const node of nodes) {
    if (node.key === key) {
      return node;
    }
    if (node.children) {
      const found = findNodeByKey(node.children, key);
      if (found) return found;
    }
  }
  return undefined;
}
