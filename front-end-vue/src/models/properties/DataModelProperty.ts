import { TTIriRef } from "../TripleTree";

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

export interface ProcessedDataModelProperty {
  propertyId: string;
  propertyName: string;
  propertyDisplay: string;
  typeId: string;
  typeName: string;
  typeDisplay: string;
  inheritedId: string;
  inheritedName: string;
  inheritedDisplay: string;
  cardinality: string;
}
