import { Path } from "../AutoGen";
import { TreeNode } from "../TreeNode";

export interface WhereClauseUI {
  path: Path;
  whereProperty: TreeNode;
  whereType: string;
  whereValue: any;
  whereEntailment: string[];
}
