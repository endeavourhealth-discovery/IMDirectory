import { ECLType } from "../expressionConstraintsLanguage/ECLType";

export interface NextComponentSummary {
  previousComponentType: ECLType;
  previousPosition: number;
  parentGroup?: ECLType;
}
