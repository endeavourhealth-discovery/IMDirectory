import type { GenericObject, TTIriRef } from "@endeavour/vue-library/interfaces";

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
