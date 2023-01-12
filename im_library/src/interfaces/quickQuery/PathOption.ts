import { Path } from "../../models/AutoGen";
import { TreeNode } from "../TreeNode";

export interface PathOption extends Path, TreeNode {
  label: string;
}
