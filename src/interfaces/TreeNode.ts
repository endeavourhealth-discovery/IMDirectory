import { TTIriRef } from "./AutoGen";
import { GenericObject } from "./GenericObject";

export interface TreeNode extends GenericObject {
  key: string;
  label: string;
  iri: string;
  conceptTypes: TTIriRef[];
  type: string;
  icon: string[];
  children?: TreeNode[];
  selectable: boolean;
  leaf: boolean;
  data: any;
  parent?: TreeNode;
  hasVariable: string;
}
