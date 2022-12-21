import { TreeNode } from "../TreeNode";
import { TreeTableItemData } from "./TreeTableItemData";

export interface TreeTableItem extends TreeNode {
  data: TreeTableItemData;
  children: TreeTableItem[];
  parent: string;
}
