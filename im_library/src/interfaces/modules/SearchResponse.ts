import { ConceptSummary } from "./ConceptSummary.js";

export interface SearchResponse {
  entities: ConceptSummary[];
  page: number;
  count: number;
}
