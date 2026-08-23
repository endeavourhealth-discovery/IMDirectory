import  type { TTIriRef} from "@endeavour/vue-library/models";

export type PropertyTreeNode = {
  key: string;
  name: string | undefined;
  iri?: string;
  as?: string;
  type: string;
  iconType: string;
  typeOf?: string;
  range?: string | undefined;
  rangeType?: string | undefined;
  path?: string | undefined;
  parentKey?: string;
  ascending?: string;
  descending?: string;
  returnType?: string;
  inversePath?: TTIriRef;
  minCount?: number;
  maxCount?: number;
  nodeRef?: string;
};
