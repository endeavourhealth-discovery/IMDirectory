import { QueryComponentType } from "../../enums/index.js";

export interface QueryNextComponentSummary {
  previousComponentType: QueryComponentType;
  previousPosition: number;
  parentGroup?: QueryComponentType;
  selectedOption: QueryComponentType;
}
