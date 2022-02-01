import { SortBy } from "./SortBy";

export class SearchRequest {
  termFilter!: string;
  statusFilter!: string[];
  typeFilter!: string[];
  schemeFilter!: string[];
  descendentFilter!: string[];
  markIfDescendentOf!: string[];
  sortBy!: SortBy;
  page!: number;
  size!: number;
}
