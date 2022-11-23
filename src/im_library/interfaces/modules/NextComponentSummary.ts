import { ComponentType } from "../../enums/modules/ComponentType";

export interface NextComponentSummary {
  previousComponentType: ComponentType;
  previousPosition: number;
  parentGroup?: ComponentType;
  selectedOption: ComponentType;
}
