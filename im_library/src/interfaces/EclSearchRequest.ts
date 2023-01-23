import { SortBy } from "../enums/SortBy";
import { SortDirection } from "../enums/SortDirection";
import { TTIriRef } from "./TTIriRef";

export interface EclSearchRequest {
  ecl: string;
  includeLegacy: boolean;
  limit: number;
  statusFilter?: TTIriRef[];
  select?: string[];
  sortField?: string;
  sortDirection?: SortDirection;
  page?: number;
  size?: number;
}
