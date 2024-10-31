import { ComponentType } from "../enums/ComponentType";

export interface NextComponentSummary {
  previousComponentType: ComponentType;
  previousPosition: number;
  parentGroup?: ComponentType;
  selectedOption: ComponentType;
}
