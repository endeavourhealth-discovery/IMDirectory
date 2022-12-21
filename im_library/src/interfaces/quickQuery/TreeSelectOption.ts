import { TreeNode } from "../TreeNode";
import { TreeSelectOptionData } from "./TreeSelectOptionData";

export interface TreeSelectOption extends TreeNode {
  data: TreeSelectOptionData;
  children: TreeSelectOption[];
}
