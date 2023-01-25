import { Argument } from "../models/AutoGen";
import { TTIriRef } from "./TTIriRef";

export interface PropertyShape {
  label: string;
  comment: string;
  name: string;
  order: number;
  minCount: number;
  maxCount: number;
  path: TTIriRef;
  datatype: TTIriRef;
  clazz: TTIriRef;
  node: TTIriRef;
  function: TTIriRef;
  isIri: TTIriRef;
  isNumericValue: string;
  isTextValue: string;
  componentType: TTIriRef;
  validation: TTIriRef;
  validationErrorMessage: string;
  search: TTIriRef;
  argument: Argument[];
  valueVariable: string;
  select: TTIriRef[];
  builderChild: boolean;
  subProperty: PropertyShape[];
  forceIsValue: boolean;
}
