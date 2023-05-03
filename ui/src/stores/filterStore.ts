import { defineStore } from "pinia";
import { FilterState } from "@/stores/types/filterState";
import { FilterOptions, Namespace } from "@im-library/interfaces";
import { SearchRequest } from "@im-library/interfaces/AutoGen";
import { EntityService } from "@/services";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
// import { getLogger } from "@im-library/logger/LogConfig";

// const log = getLogger("rootStore");

export const useFilterStore = defineStore("filter", {
    state: (): FilterState => ({
        filterOptions: {} as FilterOptions,
        filterDefaults: {} as FilterOptions,
        selectedFilters: {} as FilterOptions,
        quickFiltersStatus: new Map<string, boolean>(),
        hierarchySelectedFilters: [] as Namespace[]
    }),
    actions: {
        async fetchFilterSettings() {
            const filterOptions = await EntityService.getFilterOptions();
            const filterDefaults = await EntityService.getFilterDefaultOptions();
            if (
                isObjectHasKeys(filterOptions, ["status", "schemes", "types", "sortFields", "sortDirections"]) &&
                isObjectHasKeys(filterDefaults, ["status", "schemes", "types", "sortFields", "sortDirections"])
            ) {
                this.updateFilterDefaults(filterDefaults);
                this.updateFilterOptions(filterOptions);
                const selectedStatus = this.filterOptions.status.filter(item => filterDefaults.status.map(defaultOption => defaultOption["@id"]).includes(item["@id"]));
                const selectedSchemes = this.filterOptions.schemes.filter(item =>
                    filterDefaults.schemes.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
                );
                const selectedTypes = this.filterOptions.types.filter(item => filterDefaults.types.map(defaultOption => defaultOption["@id"]).includes(item["@id"]));
                const selectedField = this.filterOptions.sortFields.filter(item =>
                    filterDefaults.sortFields.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
                );
                const selectedDirection = this.filterOptions.sortDirections.filter(item =>
                    filterDefaults.sortDirections.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
                );

                this.updateSelectedFilters({
                    status: selectedStatus,
                    schemes: selectedSchemes,
                    types: selectedTypes,
                    sortFields: selectedField,
                    sortDirections: selectedDirection
                } as FilterOptions);
                this.updateHierarchySelectedFilters(selectedSchemes);
            }
        },
        updateFilterOptions(filters: any) {
            this.filterOptions = filters;
        },
        updateSelectedFilters(filters: any) {
            this.selectedFilters = filters;
        },
        updateQuickFiltersStatus(status: any) {
            this.quickFiltersStatus.set(status.key, status.value);
        },
        updateHierarchySelectedFilters(filters: any) {
            this.hierarchySelectedFilters = filters;
        },
        updateFilterDefaults(defaults: any) {
            this.filterDefaults = defaults;
        }
    }
});
