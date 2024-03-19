<template>
  <div class="search-container">
    <span class="p-input-icon-right search-group">
      <i v-if="loading" class="pi pi-spin pi-spinner"></i>
      <i v-else-if="speech" class="pi pi-microphone mic" :class="listening && 'listening'" @click="toggleListen"></i>
      <InputText
        id="autocomplete-search"
        v-model="searchText"
        :placeholder="searchPlaceholder"
        data-testid="search-input"
        autofocus
        v-on:keyup.enter="onEnter"
        v-on:keyup="select"
        @mouseover="selected?.iri != 'any' && showOverlay($event, selected?.iri)"
        @mouseleave="hideOverlay($event)"
        :disabled="disabled"
      />
    </span>
    <OverlayPanel ref="resultsOP" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: '450px' }" appendTo="body">
      <div v-if="loading" class="loading-container">
        <ProgressSpinner />
      </div>
      <div v-else class="p-fluid results-container">
        <Listbox v-if="results?.entities" v-model="selectedLocal" :options="results.entities">
          <template #option="slotProps">
            <div
              class="listbox-item"
              @mouseover="slotProps.option.iri != 'any' ? showOverlay($event, slotProps.option.iri) : null"
              @mouseleave="hideOverlay($event)"
            >
              <span>{{ slotProps.option.name }}</span>
            </div>
          </template>
        </Listbox>
        <div v-else class="loading-container">
          <ProgressSpinner />
        </div>

        <div class="advanced-search-container">
          <Button
            :disabled="advancedSearchLoading"
            :loading="advancedSearchLoading"
            label="Advanced search"
            class="advanced-search-button"
            @click="showAdvancedSearch"
          />
          <small>
            Showing {{ results?.entities?.length ? 1 : 0 }}-{{ results?.entities?.length ? results.entities.length : 0 }} of
            {{ results?.count ? results.count : 0 }} results
          </small>
        </div>
      </div>
    </OverlayPanel>
    <DirectorySearchDialog
      v-if="showDialog && !isAny && selected?.iri !== 'any'"
      v-model:show-dialog="showDialog"
      v-model:selected="selectedLocal"
      :search-by-query="searchByQuery"
      :searchByFunction="searchByFunction"
      :root-entities="rootEntities"
      :filterOptions="filterOptions"
      :filterDefaults="filterDefaults"
      :searchTerm="searchText"
    />
    <OverlaySummary ref="OS" />
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, ref, Ref, watch, onMounted } from "vue";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import { FilterOptions } from "@im-library/interfaces";
import { SearchRequest, TTIriRef, QueryRequest, SearchResultSummary, Match, SearchResponse, FunctionRequest } from "@im-library/interfaces/AutoGen";
import { SortDirection } from "@im-library/enums";
import { isArrayHasLength, isObjectHasKeys, isObject } from "@im-library/helpers/DataTypeCheckers";
import { IM } from "@im-library/vocabulary";
import setupSpeechToText from "@/composables/setupSpeechToText";
import EntityService from "@/services/EntityService";
import QueryService from "@/services/QueryService";
import _ from "lodash";
import { FunctionService } from "@/services";
import setupOverlay from "@/composables/setupOverlay";

interface Props {
  selected?: SearchResultSummary;
  searchByFunction?: FunctionRequest;
  searchByQuery?: QueryRequest;
  searchByMethod?: Function;
  allowAny?: boolean;
  getRootEntities?: Function;
  filterOptions?: FilterOptions;
  filterDefaults?: FilterOptions;
  disabled?: boolean;
  rootEntities?: string[];
}

const props = withDefaults(defineProps<Props>(), { rootEntities: () => [] as string[] });

const emit = defineEmits({
  "update:selected": _payload => true
});

watch(
  () => _.cloneDeep(props.filterDefaults),
  async newValue => {
    selectedFilters.value = newValue;
    await search();
  }
);

const resultsOP = ref();

const controller: Ref<AbortController> = ref({} as AbortController);
const searchText = ref("");
const searchPlaceholder = ref("Search or press Enter to show options");
const loading = ref(false);
const results: Ref<SearchResponse | undefined> = ref();
const selectedFilters: Ref<FilterOptions | undefined> = ref();
const showDialog = ref(false);
const selectedLocal: Ref<SearchResultSummary | undefined> = ref();
const advancedSearchLoading = ref(false);
const { listening, speech, recog, toggleListen } = setupSpeechToText(searchText, searchPlaceholder);
const selectedIndex: Ref<number> = ref(-1);

const isAny: ComputedRef<boolean> = computed(() => selectedLocal.value?.iri === "any");
const { OS, showOverlay, hideOverlay } = setupOverlay();

watch(
  () => _.cloneDeep(props.selected),
  (newValue, oldValue) => {
    if (!_.isEqual(newValue, oldValue)) {
      loading.value = true;
      if (newValue && newValue.name && newValue.name != searchText.value) {
        searchText.value = newValue.name;
        selectedLocal.value = newValue;
      } else if (!newValue) {
        searchText.value = "";
        selectedLocal.value = undefined;
      }
      loading.value = false;
    }
  }
);

watch(
  selectedLocal,
  (newValue,oldValue) => {
    if (!_.isEqual(newValue,oldValue)) emit("update:selected", newValue);
  },
  { deep: true }
);

watch(searchText, newValue => {
  if (!newValue) {
    selectedLocal.value = undefined;
  } else if (!loading.value && newValue != props.selected?.name) debounceForSearch();
});

const debounce = ref(0);

onMounted(() => {
  loading.value = true;
  if (props.selected?.name) {
    searchText.value = props.selected.name;
    selectedLocal.value = props.selected;
  }
  loading.value = false;
});

function debounceForSearch(): void {
  clearTimeout(debounce.value);
  debounce.value = window.setTimeout(() => {
    search();
  }, 600);
  showResultsOverlay(event);
}

function select(event: KeyboardEvent) {
  if (isArrayHasLength(results.value?.entities))
    if (event.key === "ArrowDown") {
      if (selectedIndex.value < results.value!.entities!.length - 1) selectedLocal.value = results.value?.entities?.[++selectedIndex.value];
      else {
        selectedIndex.value = 0;
        selectedLocal.value = results.value?.entities?.[selectedIndex.value];
      }
    } else if (event.key === "ArrowUp") {
      if (selectedIndex.value > 0) selectedLocal.value = results.value?.entities?.[--selectedIndex.value];
      else {
        selectedIndex.value = results.value!.entities!.length - 1;
        selectedLocal.value = results.value?.entities?.[selectedIndex.value];
      }
    }
}

async function onEnter(event: any) {
  if (resultsOP.value) resultsOP.value.toggle(event);
  await search();
}

async function search(): Promise<void | SearchResponse> {
  if (props.searchByFunction) {
    await functionSearch();
    return;
  }
  if (props.searchByQuery) {
    await querySearch();
    return;
  }
  if (props.searchByMethod) {
    await methodSearch();
    return;
  }
  searchPlaceholder.value = "Search";
  if (searchText.value && searchText.value.length > 2) {
    loading.value = true;
    const searchRequest = {} as SearchRequest;
    searchRequest.termFilter = searchText.value;
    searchRequest.sortField = "weighting";
    searchRequest.page = 1;
    searchRequest.size = 10;
    if (props.allowAny && searchText.value.toLocaleLowerCase() === "any") {
      searchRequest.size = 9;
    }
    if (props.filterDefaults) {
      if (props.filterDefaults.schemes) {
        searchRequest.schemeFilter = props.filterDefaults.schemes.map(s => s["@id"]);
      }
      if (props.filterDefaults.status) {
        searchRequest.statusFilter = props.filterDefaults.status.map(s => s["@id"]);
      }
      if (props.filterDefaults.types) {
        searchRequest.typeFilter = props.filterDefaults.types.map(s => s["@id"]);
      }
      if (props.filterDefaults.sortDirections) {
        searchRequest.sortDirection = props.filterDefaults.sortDirections[0]?.["@id"] === IM.DESCENDING ? SortDirection.DESC : SortDirection.ASC;
      }
      if (props.filterDefaults.sortFields) {
        if (props.filterDefaults.sortFields[0]?.["@id"] === IM.USAGE) searchRequest.sortField = "weighting";
        else searchRequest.sortField = props.filterDefaults.sortFields[0]?.["@id"];
      }
    }

    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();
    const result = await EntityService.advancedSearch(searchRequest, controller.value);
    loading.value = false;
    if (result?.entities) results.value = result;
    else results.value = undefined;
    if (props.allowAny && searchText.value.toLocaleLowerCase() === "any") {
      results.value?.entities?.unshift({ iri: "any", name: "ANY" } as SearchResultSummary);
    }
  }
}

async function methodSearch() {
  searchPlaceholder.value = "Search";
  if (searchText.value && searchText.value.length > 2) {
    loading.value = true;

    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();
    loading.value = false;
    const result = await props.searchByMethod!(searchText.value, controller.value);
    results.value = result?.entities ? result : undefined;
  }
}

async function functionSearch() {
  if (searchText.value && searchText.value.length > 2 && props.searchByFunction) {
    loading.value = true;
    const functionRequest: FunctionRequest = _.cloneDeep(props.searchByFunction);
    functionRequest.arguments?.push({ parameter: "searchIri", valueData: searchText.value });
    functionRequest.page = { pageNumber: 1, pageSize: 10 };
    if (props.allowAny && searchText.value.toLocaleLowerCase() === "any") {
      functionRequest.page.pageSize = 9;
    }

    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();
    const result = await FunctionService.runSearchFunction(functionRequest, controller.value);
    loading.value = false;
    if (result?.entities) results.value = result;
    else results.value = undefined;
    if (props.allowAny && searchText.value.toLocaleLowerCase() === "any") {
      results.value?.entities?.unshift({ iri: "any", name: "ANY" } as SearchResultSummary);
    }
    loading.value = false;
  }
}

async function querySearch() {
  if (searchText.value && searchText.value.length > 2 && props.searchByQuery) {
    loading.value = true;
    const queryRequest: QueryRequest = _.cloneDeep(props.searchByQuery);
    queryRequest.textSearch = searchText.value;
    queryRequest.page = { pageNumber: 1, pageSize: 10 };
    if (props.allowAny && searchText.value.toLocaleLowerCase() === "any") {
      queryRequest.page.pageSize = 9;
    }

    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();
    const result = await QueryService.queryIMSearch(queryRequest, controller.value);
    loading.value = false;
    if (result?.entities) results.value = result;
    else results.value = undefined;
    if (props.allowAny && searchText.value.toLocaleLowerCase() === "any") {
      results.value?.entities?.unshift({ iri: "any", name: "ANY" } as SearchResultSummary);
    }
    loading.value = false;
  }
}

async function showResultsOverlay(event: any) {
  if (resultsOP.value) resultsOP.value.show(event);
  if (props.selected && !results.value) await search();
}

function hideResultsOverlay() {
  if (resultsOP.value) resultsOP.value.hide();
}

async function showAdvancedSearch() {
  advancedSearchLoading.value = true;
  if (props.getRootEntities) await props.getRootEntities();
  showDialog.value = true;
  advancedSearchLoading.value = false;
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
  flex: 1 1 auto;
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

.results-container {
  display: flex;
  flex-flow: column nowrap;
  gap: 0.5rem;
}

.advanced-search-container {
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: baseline;
  justify-content: space-between;
}

.advanced-search-button {
  width: fit-content;
}

.loading-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}
</style>
