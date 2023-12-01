import { TTIriRef } from "./AutoGen";

export interface TreeNode {
  key: string;
  label: string;
  iri: string;
  conceptTypes: TTIriRef[];
  type: string;
  icon: string[];
  children: TreeNode[];
  selectable: boolean;
  leaf: boolean;
  data: any;
  parent?: TreeNode;
  hasVariable: string;
  [key: string]: any;
}
