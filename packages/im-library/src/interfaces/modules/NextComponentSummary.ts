import { ComponentType } from "../../enums/modules/ComponentType.js";

export interface NextComponentSummary {
  previousComponentType: ComponentType;
  previousPosition: number;
  parentGroup?: ComponentType;
  selectedOption: ComponentType;
}
