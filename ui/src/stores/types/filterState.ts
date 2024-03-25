import { FilterOptions, Namespace } from "@im-library/interfaces";

export interface FilterState {
    filterOptions: FilterOptions;
    filterDefaults: FilterOptions;
    selectedFilters: FilterOptions;
    quickFiltersStatus: any;
    hierarchySelectedFilters: Namespace[];
}