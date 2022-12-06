import { TTIriRef } from "./TTIriRef.js";

export interface DataModelProperty {
  property: TTIriRef;
  type: TTIriRef;
  minInclusive: string;
  minExclusive: string;
  maxInclusive: string;
  maxExclusive: string;
  pattern: string;
  inheritedFrom: TTIriRef;
}
