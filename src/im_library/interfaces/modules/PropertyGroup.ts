import { PropertyShape } from "./PropertyShape";
import { TTIriRef } from "./TTIriRef";

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
}
