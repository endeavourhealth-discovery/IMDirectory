import { TreeNode } from "../TreeNode";

export interface WhereClauseUI {
  whereProperty: TreeNode;
  whereType: string;
  whereValue: any;
  whereEntailment: string[];
}
