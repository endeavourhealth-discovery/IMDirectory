import { ref } from "vue";

import { isObjectHasKeys } from "@endeavour/vue-library/helpers";

import { defineStore } from "pinia";

import { type FilterOptions, FilterOptionsSchema, type Namespace, isFilterOptions } from "@/models";
import { EntityService } from "@/services";

export const useFilterStore = defineStore("filter", () => {
  const filterOptions = ref<FilterOptions>({} as FilterOptions);
  const defaultFilterOptions = ref<FilterOptions>({} as FilterOptions);
  const selectedFilterOptions = ref<FilterOptions>({} as FilterOptions);
  const hierarchySelectedFilters = ref<Namespace[]>([]);
  const coreSchemes = ref<string[]>([]);

  async function fetchFilterSettings() {
    const apiFilterOptions = await EntityService.getFilterOptions();
    const filterDefaults = await EntityService.getFilterDefaultOptions();
    const coreSchemes = await EntityService.getCoreSchemes();
    if (isFilterOptions(apiFilterOptions) && isFilterOptions(filterDefaults)) {
      updateDefaultFilterOptions(filterDefaults);
      updateFilterOptions(apiFilterOptions);
      const selectedStatus = filterOptions.value.status.filter(item => filterDefaults.status.map(defaultOption => defaultOption.iri).includes(item.iri));
      const selectedSchemes = filterOptions.value.schemes.filter(item => filterDefaults.schemes.map(defaultOption => defaultOption.iri).includes(item.iri));
      const selectedTypes = filterOptions.value.types.filter(item => filterDefaults.types.map(defaultOption => defaultOption.iri).includes(item.iri));

      updateSelectedFilterOptions(
        FilterOptionsSchema.parse({
          status: selectedStatus,
          schemes: selectedSchemes,
          types: selectedTypes
        })
      );
      updateHierarchySelectedFilters(selectedSchemes as unknown as Namespace[]);
      updateCoreSchemes(coreSchemes);
    }
  }

  function updateFilterOptions(filters: FilterOptions) {
    filterOptions.value = filters;
  }

  function updateDefaultFilterOptions(filters: FilterOptions) {
    defaultFilterOptions.value = filters;
  }

  function updateSelectedFilterOptions(filters: FilterOptions) {
    selectedFilterOptions.value = filters;
  }

  function updateWithDefaultFilterOptions(oldFilters: FilterOptions, filters: FilterOptions) {
    const oldTypes = new Set(oldFilters.types.map(t => t.iri));
    const oldScheme = new Set(oldFilters.schemes.map(s => s.iri));
    const typeSchemes = defaultFilterOptions.value.typeSchemes;
    if (!typeSchemes) return;
    for (const type of filters.types) {
      if (!oldTypes.has(type.iri)) {
        const schemes = typeSchemes[type.iri];
        if (!schemes) continue;
        for (const newScheme of schemes) {
          if (!oldScheme.has(newScheme.iri)) {
            filters.schemes.push(newScheme);
          }
        }
      }
    }
    selectedFilterOptions.value = filters;
  }

  function updateHierarchySelectedFilters(filters: Namespace[]) {
    hierarchySelectedFilters.value = filters;
  }

  function updateCoreSchemes(schemes: string[]) {
    coreSchemes.value = schemes;
  }

  return {
    filterOptions,
    defaultFilterOptions,
    selectedFilterOptions,
    hierarchySelectedFilters,
    coreSchemes,
    updateCoreSchemes,
    updateDefaultFilterOptions,
    updateFilterOptions,
    updateHierarchySelectedFilters,
    updateSelectedFilterOptions,
    fetchFilterSettings,
    updateWithDefaultFilterOptions
  };
});
