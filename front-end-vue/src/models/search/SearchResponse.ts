import { SearchRequest } from "./SearchRequest";
import { ConceptSummary } from "./ConceptSummary";

export class SearchResponse {
  pageStart!: number;
  pageEnd!: number;
  pageSize!: number;
  totalSize!: number;
  concepts!: ConceptSummary[];
  request?: SearchRequest;
}
