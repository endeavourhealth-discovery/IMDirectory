import { SortBy } from "../enums/SortBy";
import { SortDirection } from "../enums/SortDirection";

export interface SearchRequest {
  termFilter: string;
  statusFilter: string[];
  typeFilter: string[];
  schemeFilter: string[];
  descendentFilter: string[];
  markIfDescendentOf: string[];
  isA: string[];
  select: string[];
  sortBy: SortBy;
  sortField: string;
  sortDirection: SortDirection;
  page: number;
  size: number;
}
