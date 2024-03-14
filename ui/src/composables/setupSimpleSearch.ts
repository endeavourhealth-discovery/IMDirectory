import { Ref, computed, ref } from "vue";
import setupDebounce from "./setupDebounce";
import { isObject } from "@im-library/helpers/DataTypeCheckers";
import { EntityService } from "@/services";
import { useFilterStore } from "@/stores/filterStore";
import { FilterOptions } from "@im-library/interfaces";
import { SearchResultSummary } from "@im-library/interfaces/AutoGen";

function setupSimpleSearch() {
  const filterStore = useFilterStore();
  const { debounceFunction } = setupDebounce();
  const controller: Ref<AbortController> = ref({} as AbortController);
  const filterDefaults: Ref<FilterOptions> = computed(() => filterStore.filterDefaults);
  const suggestions: Ref<SearchResultSummary[]> = ref([]);

  async function simpleSearch(searchTerm: string, filters?: FilterOptions) {
    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();
    const response = await EntityService.simpleSearch(searchTerm, filters ?? filterDefaults.value, controller.value);
    suggestions.value = response.entities ? response.entities : [];
  }

  async function debounceSimpleSearch(searchTerm: any, filters?: FilterOptions): Promise<void> {
    await debounceFunction(simpleSearch, 600, [searchTerm, filters ?? filterDefaults.value, controller.value]);
  }

  return { suggestions, simpleSearch, debounceSimpleSearch };
}
export default setupSimpleSearch;
