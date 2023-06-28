export interface TreeNode {
  key: string;
  label: string;
  iri: string;
  type: string;
  icon: string[];
  children: TreeNode[];
  selectable: boolean;
  leaf: boolean;
  data: any;
  parent: TreeNode;
  [key: string]: any;
}
