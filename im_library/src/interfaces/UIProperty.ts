import { TTIriRef } from "./TTIriRef";
import { TTProperty } from "./TTProperty";

export interface UIProperty {
  label: string;
  tooltip: string;
  description: string;
  property: TTProperty;
  componentType: string;
  valueType: TTIriRef;
  value: any;
  logic: string;
}
