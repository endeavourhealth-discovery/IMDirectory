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
        v-on:focus="showResultsOverlay"
        v-on:blur="hideResultsOverlay"
      />
    </span>
    <OverlayPanel ref="resultsOP" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: '450px' }">
      <div v-if="loading">
        <ProgressSpinner />
      </div>
      <div v-else class="p-fluid results-container">
        <span>Showing 1-{{ results?.entities?.length }} of {{ results?.count }}</span>
        <Listbox v-if="results?.entities" v-model="selected" :options="results.entities">
          <template #option="slotProps">
            <div class="listbox-item">
              <span>{{ slotProps.option.name }}</span>
            </div>
          </template>
        </Listbox>
        <Button label="Advanced search" @click="() => (showDialog = true)" />
      </div>
    </OverlayPanel>
    <DirectorySearchDialog
      v-if="showDialog && !isAny && selected?.iri !== 'any'"
      v-model:show-dialog="showDialog"
      v-model:selected="selected"
      :search-by-query="searchByQuery"
      :searchByFunction="searchByFunction"
      :root-entities="['http://snomed.info/sct#138875005']"
      :filterOptions="filterOptions"
      :filterDefaults="filterDefaults"
      :searchTerm="searchText"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, ref, Ref, watch } from "vue";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
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

interface Props {
  selected?: SearchResultSummary;
  searchByFunction?: FunctionRequest;
  searchByQuery?: QueryRequest;
  allowAny?: boolean;
  rootEntities?: string[];
  filterOptions?: FilterOptions;
  filterDefaults?: FilterOptions;
}

const props = defineProps<Props>();

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
const searchPlaceholder = ref("Search");
const loading = ref(false);
const results: Ref<SearchResponse | undefined> = ref();
const selectedFilters: Ref<FilterOptions | undefined> = ref();
const showDialog = ref(false);
const selected: Ref<SearchResultSummary | undefined> = ref();
const { listening, speech, recog, toggleListen } = setupSpeechToText(searchText, searchPlaceholder);

const isAny: ComputedRef<boolean> = computed(() => selected.value?.iri === "any");

watch(
  () => selected.value,
  newValue => {
    searchText.value = newValue?.name ?? "";
  }
);

watch(searchText, async () => debounceForSearch());

const debounce = ref(0);

function debounceForSearch(): void {
  clearTimeout(debounce.value);
  debounce.value = window.setTimeout(() => {
    search();
  }, 600);
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

async function functionSearch() {
  if (searchText.value && searchText.value.length > 2 && props.searchByFunction) {
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
  }
}

async function querySearch() {
  if (searchText.value && searchText.value.length > 2 && props.searchByQuery) {
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
  }
}

function showResultsOverlay(event: any) {
  resultsOP.value.show(event);
}

function hideResultsOverlay() {
  resultsOP.value.hide();
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
</style>
