import { SortDirection } from "../enums/SortDirection";
import { Query, TTIriRef } from "../interfaces/AutoGen";

export interface EclSearchRequest {
  eclQuery: Query;
  includeLegacy: boolean;
  limit: number;
  statusFilter?: TTIriRef[];
  select?: string[];
  sortField?: string;
  sortDirection?: SortDirection;
  page?: number;
  size?: number;
}
