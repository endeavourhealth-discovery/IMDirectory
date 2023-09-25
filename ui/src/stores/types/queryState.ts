import { SelectedMatch } from "@im-library/interfaces";
import { QueryRequest } from "@im-library/interfaces/AutoGen";

export interface QueryState {
  selectedMatches: SelectedMatch[];
  variableMap: Map<string, any>;
  returnType: string;
  validationQueryRequest: QueryRequest;
}
