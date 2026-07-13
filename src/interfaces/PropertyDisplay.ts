import type { TTIriRef } from "@endeavour/vue-library/models";

export interface PropertyDisplay {
  order?: number;
  group?: TTIriRef;
  property: TTIriRef[]; // path
  type?: TTIriRef[]; // class/datatype/node
  cardinality?: string;
  reverseCardinality?: string;
  isOr?: boolean;
  isType?: boolean;
  node?: boolean;
}
