import { FilterOptions, Namespace } from "@/interfaces";

export interface FilterState {
  filterOptions: FilterOptions;
  defaultFilterOptions: FilterOptions;
  selectedFilterOptions: FilterOptions;
  hierarchySelectedFilters: Namespace[];
  coreSchemes: string[];
}
