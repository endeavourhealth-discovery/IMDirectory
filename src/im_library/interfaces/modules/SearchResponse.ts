import { ConceptSummary } from "./ConceptSummary";

export interface SearchResponse {
  entities: ConceptSummary[];
  page: number;
  count: number;
}
