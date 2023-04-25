import { ConceptSummary } from "../ConceptSummary";

export interface ClauseUI {
  clauseType: { name: string; prop: string };
  typeValue: ConceptSummary;
  entailmentOptions: string[];
  propertyValue: { value: any; type: string };
}
