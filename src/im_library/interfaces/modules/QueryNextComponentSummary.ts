import { QueryComponentType } from "../../enums/Enums";

export interface QueryNextComponentSummary {
  previousComponentType: QueryComponentType;
  previousPosition: number;
  parentGroup?: QueryComponentType;
  selectedOption: QueryComponentType;
}
