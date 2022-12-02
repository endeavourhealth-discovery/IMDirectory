import { TreeNode } from "primevue/tree";
import { TTIriRef } from "./TTIriRef";

export interface IMTreeNode extends TreeNode {
  key: string;
  label: string;
  data: string;
  typeIcon: Array<string>;
  color: string;
  leaf: boolean;
  children: Array<IMTreeNode>;
  loading: boolean;
  parentNode?: IMTreeNode | null;
  order?: number | undefined;
  conceptTypes: TTIriRef[];
}
