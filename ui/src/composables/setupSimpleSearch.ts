import { Ref, computed, ref } from "vue";
import setupDebounce from "./setupDebounce";
import { isObject } from "@im-library/helpers/DataTypeCheckers";
import { EntityService } from "@/services";
import { useFilterStore } from "@/stores/filterStore";
import { ConceptSummary, FilterOptions } from "@im-library/interfaces";

function setupSimpleSearch() {
  const filterStore = useFilterStore();
  const { debounceFunction } = setupDebounce();
  const controller: Ref<AbortController> = ref({} as AbortController);
  const filterDefaults: Ref<FilterOptions> = computed(() => filterStore.filterDefaults);
  const suggestions: Ref<ConceptSummary[]> = ref([]);

  async function simpleSearch(searchTerm: string, filters?: FilterOptions) {
    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();
    suggestions.value = await EntityService.simpleSearch(searchTerm, filters ?? filterDefaults.value, controller.value);
  }

  async function debounceSimpleSearch(searchTerm: any, filters?: FilterOptions): Promise<void> {
    await debounceFunction(simpleSearch, 600, [searchTerm, filters ?? filterDefaults.value, controller.value]);
  }

  return { suggestions, simpleSearch, debounceSimpleSearch };
}
export default setupSimpleSearch;
