import { TTIriRef } from "../TTIriRef";
import { TreeSelectOption } from "./TreeSelectOption";

export interface TreeTableItemData {
  operator: string;
  property: TTIriRef;
  propertyOptions: TreeSelectOption[];
  propertyDisplay: any;
  value: any;
  valueOptions: TreeSelectOption[];
  valueDisplay: any;
  valueType: TTIriRef;
  showValueOptions: boolean;
}
