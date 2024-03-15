import { FilterOptions, Namespace } from "@im-library/interfaces";

export interface FilterState {
  filterOptions: FilterOptions;
  defaultFilterOptions: FilterOptions;
  selectedFilterOptions: FilterOptions;
  hierarchySelectedFilters: Namespace[];
}
