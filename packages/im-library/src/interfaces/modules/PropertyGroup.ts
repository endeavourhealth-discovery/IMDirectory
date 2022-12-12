import { PropertyShape } from "./PropertyShape.js";
import { TTIriRef } from "./TTIriRef.js";
import { Argument } from "./query/Argument.js";

export interface PropertyGroup {
  label: string;
  comment: string;
  name: string;
  order: number;
  minCount: number;
  maxCount: number;
  property: PropertyShape[];
  componentType: TTIriRef;
  subGroup: PropertyGroup[];
  path: TTIriRef;
  validation: TTIriRef;
  validationErrorMessage: string;
  function: TTIriRef;
  builderChild: boolean;
  argument: Argument[];
}
