import { defineStore } from "pinia";
import { FilterState } from "@/stores/types/filterState";
import { FilterOptions, Namespace } from "@/interfaces";
import { EntityService } from "@/services";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";

export const useFilterStore = defineStore("filter", {
  state: (): FilterState => ({
    filterOptions: {} as FilterOptions,
    defaultFilterOptions: {} as FilterOptions,
    selectedFilterOptions: {} as FilterOptions,
    hierarchySelectedFilters: [] as Namespace[],
    coreSchemes: [] as string[]
  }),
  actions: {
    async fetchFilterSettings() {
      const filterOptions = await EntityService.getFilterOptions();
      const filterDefaults = await EntityService.getFilterDefaultOptions();
      const coreSchemes = await EntityService.getCoreSchemes();
      if (isObjectHasKeys(filterOptions, ["status", "schemes", "types"]) && isObjectHasKeys(filterDefaults, ["status", "schemes", "types"])) {
        this.updateDefaultFilterOptions(filterDefaults);
        this.updateFilterOptions(filterOptions);
        const selectedStatus = this.filterOptions.status.filter(item => filterDefaults.status.map(defaultOption => defaultOption.iri).includes(item.iri));
        const selectedSchemes = this.filterOptions.schemes.filter(item => filterDefaults.schemes.map(defaultOption => defaultOption.iri).includes(item.iri));
        const selectedTypes = this.filterOptions.types.filter(item => filterDefaults.types.map(defaultOption => defaultOption.iri).includes(item.iri));

        this.updateSelectedFilterOptions({
          status: selectedStatus,
          schemes: selectedSchemes,
          types: selectedTypes,
          includeLegacy: false
        } as FilterOptions);
        this.updateHierarchySelectedFilters(selectedSchemes as unknown as Namespace[]);
        this.updateCoreSchemes(coreSchemes);
      }
    },
    updateFilterOptions(filters: FilterOptions) {
      this.filterOptions = filters;
    },

    updateDefaultFilterOptions(filters: FilterOptions) {
      this.defaultFilterOptions = filters;
    },

    updateSelectedFilterOptions(filters: FilterOptions) {
      this.selectedFilterOptions = filters;
    },

    updateHierarchySelectedFilters(filters: Namespace[]) {
      this.hierarchySelectedFilters = filters;
    },
    updateCoreSchemes(schemes: string[]) {
      this.coreSchemes = schemes;
    }
  }
});
