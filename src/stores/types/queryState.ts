import { SelectedMatch } from "@/interfaces";
import { QueryRequest } from "@/interfaces/AutoGen";

export interface QueryState {
  queryIri: string;
  selectedMatches: SelectedMatch[];
  variableMap: Map<string, any>;
  returnType: string;
  validationQueryRequest: QueryRequest;
}
