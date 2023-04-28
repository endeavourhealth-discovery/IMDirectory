import { Relationship } from "../AutoGen";
import { TreeNode } from "../TreeNode";

export interface WhereClauseUI {
  path: Relationship;
  whereProperty: TreeNode;
  whereType: string;
  whereValue: any;
  whereEntailment: string[];
}
