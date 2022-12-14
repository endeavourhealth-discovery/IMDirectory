import { QueryComponentType } from "../enums";

export interface QueryNextComponentSummary {
  previousComponentType: QueryComponentType;
  previousPosition: number;
  parentGroup?: QueryComponentType;
  selectedOption: QueryComponentType;
}
