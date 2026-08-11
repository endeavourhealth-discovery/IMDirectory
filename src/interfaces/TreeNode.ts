import type { GenericObject, SearchResultSummary, TTIriRef } from "@endeavour/vue-library/models";

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
  data: SearchResultSummary;
  parent?: TreeNode;
  hasVariable: string;
}
