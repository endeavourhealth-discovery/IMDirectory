import { SortDirection } from "../enums/SortDirection";
import { Query } from "../models/AutoGen";
import { TTIriRef } from "./TTIriRef";

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
