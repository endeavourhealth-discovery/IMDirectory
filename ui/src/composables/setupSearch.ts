import { EntityService, QueryService } from "@/services";
import { useFilterStore } from "@/stores/filterStore";
import { SortDirection } from "@im-library/enums";
import { isObject } from "@im-library/helpers/DataTypeCheckers";
import { FilterOptions } from "@im-library/interfaces";
import { Page, QueryRequest, SearchRequest } from "@im-library/interfaces/AutoGen";
import { IM } from "@im-library/vocabulary";
import { computed, ComputedRef, ref, Ref } from "vue";

function setupSearch(searchPlaceholderValue?: string) {
  const searchLoading: Ref<boolean> = ref(false);
  const searchPlaceholder: Ref<string> = ref(searchPlaceholderValue ?? "Search");
  const controller: Ref<AbortController> = ref({} as AbortController);
  const filterStore = useFilterStore();
  const filterStoreDefaults: ComputedRef<FilterOptions> = computed(() => filterStore.defaultFilterOptions);

  async function search(searchTerm: string, selectedFilters?: FilterOptions, page?: Page, osQuery?: SearchRequest, imQuery?: QueryRequest) {
    let response = undefined;
    if (searchTerm && searchTerm.length > 2) {
      searchLoading.value = true;
      if (!isObject(controller.value)) {
        controller.value.abort();
      }
      controller.value = new AbortController();
      if (imQuery) response = await searchByIMQuery(searchTerm, imQuery, page);
      else if (osQuery) response = await searchByOSQuery(searchTerm, osQuery, page);
      else response = await searchByDefaultOSQuery(searchTerm, selectedFilters ?? filterStoreDefaults.value, page);
      searchLoading.value = false;
    }

    return response?.entities ? response : undefined;
  }

  async function searchByIMQuery(searchTerm: string, imQuery: QueryRequest, page?: Page) {
    console.log("searchByIMQuery");
    imQuery.textSearch = searchTerm;
    if (page) imQuery.page = page;
    return await QueryService.queryIMSearch(imQuery, controller.value);
  }

  async function searchByOSQuery(searchTerm: string, osQuery: SearchRequest, page?: Page) {
    console.log("searchByOSQuery");
    osQuery.termFilter = searchTerm;
    if (page) {
      osQuery.page = page.pageNumber;
      osQuery.size = page.pageSize;
    }
    return await EntityService.advancedSearch(osQuery, controller.value);
  }

  async function searchByDefaultOSQuery(searchTerm: string, filters: FilterOptions, page?: Page) {
    console.log("searchByDefaultOSQuery");
    const osQuery = prepareOSQueryRequest(searchTerm, filters, page);
    return await EntityService.advancedSearch(osQuery, controller.value);
  }

  function prepareOSQueryRequest(searchTerm: string, filterOptions: FilterOptions, page?: Page) {
    const osQuery = {} as SearchRequest;
    osQuery.termFilter = searchTerm;
    if (page) {
      osQuery.page = page.pageNumber;
      osQuery.size = page.pageSize;
    }
    if (filterOptions.types) osQuery.typeFilter = filterOptions.types.map(filterOption => filterOption["@id"]);
    if (filterOptions.status) osQuery.statusFilter = filterOptions.status.map(filterOption => filterOption["@id"]);
    if (filterOptions.schemes) osQuery.schemeFilter = filterOptions.schemes.map(filterOption => filterOption["@id"]);
    if (filterOptions.sortFields) osQuery.sortField = filterOptions.sortFields[0]["@id"] === IM.USAGE ? "weighting" : filterOptions.sortFields[0]["@id"];
    if (filterOptions.sortDirections) osQuery.sortDirection = filterOptions.sortDirections[0]["@id"] === IM.DESCENDING ? SortDirection.DESC : SortDirection.ASC;
    return osQuery;
  }

  return { searchLoading, searchPlaceholder, search, prepareOSQueryRequest };
}

export default setupSearch;
