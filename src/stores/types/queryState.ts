import { SelectedMatch } from "@/interfaces";
import { QueryRequest,Match } from "@/interfaces/AutoGen";

export interface QueryState {
  queryIri: string;
  selectedMatches: SelectedMatch[];
  variableMap: Map<string, any>;
  returnType: string;
  returnMap: Map<string, Match>;
  validationQueryRequest: QueryRequest;
}
