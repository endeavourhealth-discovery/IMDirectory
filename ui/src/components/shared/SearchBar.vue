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
    <SplitButton class="search-button p-button-secondary" @click="search()" label="Search" :model="buttonActions" :loading="loading" />
    <Button
      v-if="!OSQuery && !IMQuery"
      v-tooltip.bottom="'Filters'"
      id="filter-button"
      icon="fa-duotone fa-sliders"
      class="p-button-rounded p-button-text p-button-plain p-button-lg"
      @click="openFiltersOverlay"
      data-testid="filters-open-button"
    />
    <OverlayPanel ref="filtersOP" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: '450px' }">
      <div v-if="!(OSQuery || IMQuery)" class="p-fluid results-filter-container">
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
import { SearchRequest, QueryRequest, SearchResultSummary, SearchResponse } from "@im-library/interfaces/AutoGen";
import { isObjectHasKeys, isObject } from "@im-library/helpers/DataTypeCheckers";
import setupSpeechToText from "@/composables/setupSpeechToText";
import { useFilterStore } from "@/stores/filterStore";
import EntityService from "@/services/EntityService";
import QueryService from "@/services/QueryService";
import _ from "lodash";
import setupDownloadFile from "@/composables/downloadFile";
import { useDialog } from "primevue/usedialog";
import LoadingDialog from "./dynamicDialogs/LoadingDialog.vue";

interface Props {
  searchResults: SearchResponse | undefined;
  searchLoading: boolean;
  selected?: SearchResultSummary;
  filterOptions?: FilterOptions;
  loadMore: { page: number; rows: number } | undefined;
  filterDefaults?: FilterOptions;
  download: { term: string; count: number } | undefined;
  IMQuery?: QueryRequest;
  OSQuery?: SearchRequest;
  searchTerm?: string;
}

const props = defineProps<Props>();

watch(
  () => _.cloneDeep(props.loadMore),
  async newValue => {
    if (isObjectHasKeys(newValue)) {
      await search();
      emit("update:loadMore", undefined);
    }
  }
);

watch(
  () => _.cloneDeep(props.download),
  async newValue => {
    if (newValue) {
      await downloadAll();
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

async function search(paged = true): Promise<void | SearchResponse> {
  if (searchText.value && searchText.value.length > 2) {
    loading.value = true;
    searchPlaceholder.value = "Search";
    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();

    if (props.IMQuery) {
      results.value = await searchByIMQuery(controller.value);
    } else if (props.OSQuery) {
      results.value = await searchByOSQuery(controller.value);
    } else {
      const response = await EntityService.simpleSearch(searchText.value, selectedFilters.value, controller.value, paged);
      results.value = response?.entities ? response : undefined;
    }
    loading.value = false;
  }
}

async function searchByOSQuery(controller: AbortController) {
  const osQuery: SearchRequest = _.cloneDeep(props.OSQuery!);
  osQuery.termFilter = searchText.value;
  const result = await EntityService.advancedSearch(osQuery, controller);
  return result?.entities ? result : undefined;
}

async function searchByIMQuery(controller: AbortController) {
  const imQuery: QueryRequest = _.cloneDeep(props.IMQuery!);
  imQuery.textSearch = searchText.value;
  const result = await QueryService.queryIMSearch(imQuery, controller);
  return result?.entities ? result : undefined;
}

async function downloadAll() {
  const downloadDialog = dynamicDialog.open(LoadingDialog, {
    props: { modal: true, closable: false, closeOnEscape: false, style: { width: "50vw" } },
    data: { title: "Downloading", text: "Preparing your download..." }
  });
  await search(false);
  const heading = ["name", "iri", "code"].join(",");
  const body = results.value?.entities?.map((row: any) => '"' + [row.name, row.iri, row.code].join('","') + '"').join("\n");
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
