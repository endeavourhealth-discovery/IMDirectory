import { TTIriRef } from "./AutoGen";

export interface PropertyDisplay {
  order?: number;
  group?: TTIriRef;
  property: TTIriRef[]; // path
  type?: TTIriRef[]; // class/datatype/node
  cardinality?: string;
  isOr?: boolean;
  isType?: boolean;
}
