<template>
  <div class="search-container">
    <span class="p-input-icon-right search-group">
      <i v-if="loading" class="pi pi-spin pi-spinner"></i>
      <i v-else-if="speech" class="pi pi-microphone mic" :class="listening && 'listening'" @click="toggleListen"></i>
      <InputText
        id="autocomplete-search"
        v-model="searchText"
        :placeholder="searchPlaceholder"
        @complete="debounceForSearch"
        data-testid="search-input"
        autofocus
        v-on:keyup.enter="search()"
      />
    </span>
    <SplitButton class="search-button p-button-secondary" @click="search(false)" label="Search" :model="buttonActions" :loading="loading" />
    <Button
      v-if="!searchByFunction && !searchByQuery"
      v-tooltip.bottom="'Filters'"
      id="filter-button"
      icon="fa-duotone fa-sliders"
      class="p-button-rounded p-button-text p-button-plain p-button-lg"
      @click="openFiltersOverlay"
      data-testid="filters-open-button"
    />
    <OverlayPanel ref="filtersOP" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: '450px' }">
      <div v-if="!(searchByFunction || searchByQuery)" class="p-fluid results-filter-container">
        <Filters
          :search="search"
          data-testid="filters"
          :filterOptions="filterOptions"
          :filterDefaults="filterDefaults"
          @selectedFiltersUpdated="handleSelectedFiltersUpdated"
        />
      </div>
    </OverlayPanel>
  </div>
</template>

<script setup lang="ts">
import Filters from "@/components/shared/Filters.vue";

import { computed, ComputedRef, ref, Ref, watch, onMounted } from "vue";
import { FilterOptions } from "@im-library/interfaces";
import { SearchRequest, TTIriRef, QueryRequest, SearchResultSummary, Match, SearchResponse, FunctionRequest } from "@im-library/interfaces/AutoGen";
import { SortDirection } from "@im-library/enums";
import { isArrayHasLength, isObjectHasKeys, isObject } from "@im-library/helpers/DataTypeCheckers";
import { IM } from "@im-library/vocabulary";
import setupSpeechToText from "@/composables/setupSpeechToText";
import { useFilterStore } from "@/stores/filterStore";
import { useSharedStore } from "@/stores/sharedStore";
import EntityService from "@/services/EntityService";
import QueryService from "@/services/QueryService";
import _ from "lodash";
import setupDownloadFile from "@/composables/downloadFile";
import { useDialog } from "primevue/usedialog";
import LoadingDialog from "./dynamicDialogs/LoadingDialog.vue";
import { FunctionService } from "@/services";

interface Props {
  searchTerm?: string;
  showFilters: boolean;
  selectedFilterOptions?: FilterOptions;
  selected?: SearchResultSummary;
  filterOptions?: FilterOptions;
  loadMore: { page: number; rows: number } | undefined;
  filterDefaults?: FilterOptions;
  download: { term: string; count: number } | undefined;
  searchByFunction?: FunctionRequest;
  searchByQuery?: QueryRequest;
  searchTerm?: string;
}

const props = defineProps<Props>();

watch(
  () => _.cloneDeep(props.loadMore),
  async newValue => {
    if (isObjectHasKeys(newValue)) {
      await search(true);
      emit("update:loadMore", undefined);
    }
  }
);

watch(
  () => _.cloneDeep(props.download),
  async newValue => {
    if (newValue) {
      await downloadAll(newValue);
      emit("update:download", undefined);
    }
  }
);

const emit = defineEmits({
  "update:searchResults": _payload => true,
  "update:searchLoading": payload => typeof payload === "boolean",
  toEclSearch: () => true,
  toQuerySearch: () => true,
  "update:download": _payload => undefined,
  "update:loadMore": _payload => true
});

const filterStore = useFilterStore();
const dynamicDialog = useDialog();

const { downloadFile } = setupDownloadFile(window, document);

const storeSelectedFilters: ComputedRef<FilterOptions> = computed(() => filterStore.selectedFilters);

watch(storeSelectedFilters, async newValue => {
  if (!props.filterDefaults && !props.filterOptions) {
    selectedFilters.value = newValue;
    await search();
  }
});

const controller: Ref<AbortController> = ref({} as AbortController);
const searchText = ref("");
const searchPlaceholder = ref("Search");
const loading = ref(false);
const results: Ref<SearchResponse | undefined> = ref();
const buttonActions = ref([
  { label: "ECL", command: () => emit("toEclSearch") },
  { label: "IMQuery", command: () => emit("toQuerySearch") }
]);
const selectedFilters: Ref<FilterOptions> = ref({ ...storeSelectedFilters.value });

const { listening, speech, recog, toggleListen } = setupSpeechToText(searchText, searchPlaceholder);

watch(searchText, async () => debounceForSearch());
watch(results, newValue => emit("update:searchResults", newValue));
watch(loading, newValue => emit("update:searchLoading", newValue));

const filtersOP = ref();

onMounted(() => {
  if (props.searchTerm) searchText.value = props.searchTerm;
});

function handleSelectedFiltersUpdated(updatedSelectedFilters: FilterOptions) {
  selectedFilters.value = updatedSelectedFilters;
}

function openFiltersOverlay(event: any) {
  filtersOP.value.toggle(event);
}

const debounce = ref(0);

function debounceForSearch(): void {
  clearTimeout(debounce.value);
  debounce.value = window.setTimeout(() => {
    search();
  }, 600);
}

async function search(loadMore: boolean = false, downloadAll: boolean = false, downloadData?: { term: string; count: number }): Promise<void | SearchResponse> {
  if (props.searchByFunction) {
    await functionSearch(loadMore, downloadAll, downloadData);
    return;
  }
  if (props.searchByQuery) {
    await querySearch(loadMore, downloadAll, downloadData);
    return;
  }
  searchPlaceholder.value = "Search";
  if (downloadData?.term) searchText.value = downloadData.term;
  if (searchText.value && searchText.value.length > 2) {
    if (!downloadAll) loading.value = true;
    const searchRequest = {} as SearchRequest;
    searchRequest.termFilter = searchText.value;
    searchRequest.sortField = "weighting";
    if (loadMore && props.loadMore) {
      searchRequest.page = props.loadMore.page + 1;
      searchRequest.size = props.loadMore.rows;
    } else {
      searchRequest.page = 1;
      searchRequest.size = 100;
    }
    if (downloadAll && downloadData) {
      searchRequest.page = 1;
      searchRequest.size = downloadData.count;
    }

    searchRequest.schemeFilter = [];
    const schemes =
      isObjectHasKeys(props.filterOptions, ["schemes"]) && isArrayHasLength(props.filterOptions!.schemes)
        ? props.filterOptions!.schemes
        : selectedFilters.value.schemes;
    for (const scheme of schemes) {
      searchRequest.schemeFilter!.push(scheme["@id"]);
    }

    searchRequest.statusFilter = [];
    const statusList =
      isObjectHasKeys(props.filterOptions, ["status"]) && isArrayHasLength(props.filterOptions!.status)
        ? props.filterOptions!.status
        : selectedFilters.value.status;
    for (const status of statusList) {
      searchRequest.statusFilter!.push(status["@id"]);
    }

    searchRequest.typeFilter = [];
    const types =
      isObjectHasKeys(props.filterOptions, ["types"]) && isArrayHasLength(props.filterOptions!.types)
        ? props.filterOptions!.types
        : selectedFilters.value.types;
    for (const type of types) {
      searchRequest.typeFilter!.push(type["@id"]);
    }

    if (isArrayHasLength(selectedFilters.value.sortFields) && isObjectHasKeys(selectedFilters.value.sortFields[0])) {
      const sortField = selectedFilters.value.sortFields[0];
      if (sortField["@id"] === IM.NAMESPACE + "Usage") searchRequest.sortField = "weighting";

      if (isArrayHasLength(selectedFilters.value.sortDirections) && isObjectHasKeys(selectedFilters.value.sortDirections[0])) {
        const sortDirection = selectedFilters.value.sortDirections[0];
        if (sortDirection["@id"] === IM.NAMESPACE + "Descending") searchRequest.sortDirection = SortDirection.DESC;
        if (sortDirection["@id"] === IM.NAMESPACE + "Ascending") searchRequest.sortDirection = SortDirection.ASC;
      }
    }

    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();
    const result = await EntityService.advancedSearch(searchRequest, controller.value);
    if (downloadAll) return result;
    loading.value = false;
    if (result?.entities) results.value = result;
    else results.value = undefined;
  }
}

async function functionSearch(loadMore: boolean = false, downloadAll: boolean = false, downloadData?: { term: string; count: number }) {
  if (downloadData) searchText.value = downloadData.term;
  if (searchText.value && searchText.value.length > 2 && props.searchByFunction) {
    if (!downloadAll) loading.value = true;
    const functionRequest: FunctionRequest = _.cloneDeep(props.searchByFunction);
    functionRequest.arguments?.push({ parameter: "searchIri", valueData: searchText.value });
    if (loadMore && props.loadMore) {
      functionRequest.page = { pageNumber: props.loadMore.page + 1, pageSize: props.loadMore.rows };
    } else {
      functionRequest.page = { pageNumber: 1, pageSize: 100 };
    }
    if (downloadAll && downloadData) {
      functionRequest.page = { pageNumber: 1, pageSize: downloadData.count };
    }

    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();
    const result = await FunctionService.runSearchFunction(functionRequest, controller.value);
    if (downloadAll) return result;
    loading.value = false;
    if (result?.entities) results.value = result;
    else results.value = undefined;
  }
}

async function querySearch(loadMore: boolean = false, downloadAll: boolean = false, downloadData?: { term: string; count: number }) {
  if (downloadData) searchText.value = downloadData.term;
  if (searchText.value && searchText.value.length > 2 && props.searchByQuery) {
    if (!downloadAll) loading.value = true;
    const queryRequest: QueryRequest = _.cloneDeep(props.searchByQuery);
    queryRequest.textSearch = searchText.value;
    if (loadMore && props.loadMore) {
      queryRequest.page = { pageNumber: props.loadMore.page + 1, pageSize: props.loadMore.rows };
    } else {
      queryRequest.page = { pageNumber: 1, pageSize: 100 };
    }
    if (downloadAll && downloadData) {
      queryRequest.page = { pageNumber: 1, pageSize: downloadData.count };
    }

    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();
    const result = await QueryService.queryIMSearch(queryRequest, controller.value);
    if (downloadAll) return result;
    loading.value = false;
    if (result?.entities) results.value = result;
    else results.value = undefined;
  }
}

async function downloadAll(data: { term: string; count: number }) {
  const downloadDialog = dynamicDialog.open(LoadingDialog, {
    props: { modal: true, closable: false, closeOnEscape: false, style: { width: "50vw" } },
    data: { title: "Downloading", text: "Preparing your download..." }
  });
  const results = await search(undefined, true, data);
  const heading = ["name", "iri", "code"].join(",");
  const body = results?.entities?.map((row: any) => '"' + [row.name, row.iri, row.code].join('","') + '"').join("\n");
  const csv = [heading, body].join("\n");
  downloadFile(csv, "results.csv");
  downloadDialog.close();
}
</script>

<style scoped>
#filter-button {
  height: 2.25rem;
}

.search-container {
  flex: 1 0 auto;
  padding: 0 0.2rem;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 0.2rem;
  overflow: auto;
}

.search-group {
  width: 30%;
}

.mic {
  cursor: pointer;
}

.listening {
  color: red !important;
}

#autocomplete-search {
  font-size: 1rem;
  border: none;
  height: 2.25rem;
  flex: 1 1 auto;
  width: 100%;
}

.fa-icon {
  padding-right: 0.25rem;
}

.search-button {
  height: 2.25rem;
}
</style>
