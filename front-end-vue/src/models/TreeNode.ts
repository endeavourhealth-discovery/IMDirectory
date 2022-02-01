export interface TreeNode {
  key: string;
  label: string;
  data: string;
  typeIcon: Array<string>;
  color: string;
  leaf: boolean;
  children: Array<TreeNode>;
  loading: boolean;
}
