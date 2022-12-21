export interface TreeNode {
  key?: string;
  label?: string;
  data?: any;
  type?: string;
  icon?: string;
  children?: TreeNode[];
  style?: any;
  styleClass?: string;
  selectable?: boolean;
  leaf?: boolean;
  [key: string]: any;
}
