<template>
  <div class="search-container">
    <IconField class="autocomplete-search" iconPosition="right">
      <InputIcon v-if="!searchLoading && !listening" class="pi pi-microphone mic" :class="listening && 'listening'" @click="toggleListen" />
      <InputIcon v-if="searchLoading" class="pi pi-spin pi-spinner" />
      <InputText
        id="autocomplete-search"
        v-model="searchText"
        :placeholder="searchPlaceholder"
        data-testid="search-input"
        autofocus
        @input="debounceForSearch"
        v-on:keyup.enter="onEnter"
        v-on:keyup="select"
        @mouseover="selected?.iri != 'any' && showOverlay($event, selected?.iri)"
        @mouseleave="hideOverlay"
        :disabled="disabled"
        :pt="{ root: { autocomplete: allowBrowserAutocomplete ? 'on' : 'off' } }"
      />
    </IconField>
    <Button
      :disabled="disabled"
      severity="info"
      @click="showDialog = true"
      data-testid="autocomplete-search-button"
      icon="pi pi-search"
      v-tooltip="'Advanced search'"
    />
    <Popover ref="resultsOP" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: '450px' }" appendTo="body">
      <div v-if="searchLoading" class="loading-container">
        <ProgressSpinner />
      </div>
      <div v-else class="results-container">
        <Listbox v-if="results?.entities" v-model="selectedLocal" :options="results.entities">
          <template #option="slotProps">
            <div
              class="listbox-item"
              @mouseover="slotProps.option.iri != 'any' ? showOverlay($event, slotProps.option.iri) : null"
              @mouseleave="hideOverlay"
              @click="onListboxOptionClick(slotProps.option)"
            >
              <span>{{ slotProps.option.name }}</span>
            </div>
          </template>
        </Listbox>
        <div v-else>No results</div>

        <div class="advanced-search-container">
          <small>
            Showing {{ results?.entities?.length ? 1 : 0 }}-{{ results?.entities?.length ? results.entities.length : 0 }} of
            {{ results?.count ? results.count : 0 }} results
          </small>
        </div>
      </div>
    </Popover>
    <DirectorySearchDialog
      v-if="showDialog"
      v-model:show-dialog="showDialog"
      v-model:selected="selectedLocal"
      :imQuery="cloneDeep(imQuery)"
      :root-entities="rootEntities"
      :selected-filter-options="filterOptions"
      :searchTerm="searchText"
      :quick-type-filters-allowed="quickTypeFiltersAllowed"
      :show-quick-type-filters="isArrayHasLength(quickTypeFiltersAllowed)"
      :selected-quick-type-filter="selectedQuickTypeFilter"
      @update-selected-filters="(filters: FilterOptions) => $emit('updateSelectedFilters', filters)"
    />
    <OverlaySummary ref="OS" />
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, watch, onMounted } from "vue";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import { FilterOptions } from "@/interfaces";
import { QueryRequest, SearchResultSummary, SearchResponse } from "@/interfaces/AutoGen";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import setupSpeechToText from "@/composables/setupSpeechToText";
import { cloneDeep, debounce, isEqual } from "lodash-es";
import setupOverlay from "@/composables/setupOverlay";
import { EntityService, QueryService } from "@/services";

interface Props {
  selected?: SearchResultSummary;
  imQuery?: QueryRequest;
  filterOptions?: FilterOptions;
  disabled?: boolean;
  rootEntities?: string[];
  searchPlaceholder?: string;
  quickTypeFiltersAllowed?: string[];
  selectedQuickTypeFilter?: string;
  allowBrowserAutocomplete?: boolean;
}

const props = withDefaults(defineProps<Props>(), { rootEntities: () => [] as string[], allowBrowserAutocomplete: false });

const emit = defineEmits<{
  "update:selected": [payload: SearchResultSummary | undefined];
  openDialog: [];
  updateSelectedFilters: [payload: FilterOptions];
}>();

const resultsOP = ref();
const searchText = ref("");
const results: Ref<SearchResponse | undefined> = ref();
const showDialog = ref(false);
const selectedLocal: Ref<SearchResultSummary | undefined> = ref();
const searchLoading: Ref<boolean> = ref(false);
const searchPlaceholder: Ref<string> = ref(props.searchPlaceholder ?? "Search");
const { listening, toggleListen } = setupSpeechToText(searchText, searchPlaceholder);
const selectedIndex: Ref<number> = ref(-1);
const { OS, showOverlay, hideOverlay } = setupOverlay();
let searchDebounce: any;
defineExpose({ searchText });
watch(showDialog, () => {
  if (showDialog.value) emit("openDialog");
});

watch(
  () => cloneDeep(props.selected),
  (newValue, oldValue) => {
    if (!isEqual(newValue, oldValue)) {
      searchLoading.value = true;
      if (newValue && newValue.name && newValue.name != searchText.value) {
        searchText.value = newValue.name;
        selectedLocal.value = newValue;
      } else if (!newValue || !newValue.name) {
        searchText.value = "";
        selectedLocal.value = undefined;
      }
      searchLoading.value = false;
    }
  }
);

watch(
  selectedLocal,
  (newValue, oldValue) => {
    if (newValue?.iri !== oldValue?.iri) emit("update:selected", newValue);
  },
  { deep: true }
);

watch(searchText, newValue => {
  if (!newValue) {
    selectedLocal.value = undefined;
  }
});

onMounted(async () => {
  searchLoading.value = true;
  if (props.selected && !props.selected.name && props.selected.iri) props.selected.name = await EntityService.getName(props.selected.iri);
  if (props.selected?.name) {
    searchText.value = props.selected.name;
    selectedLocal.value = props.selected;
  }
  searchLoading.value = false;
});

function debounceForSearch(event: Event): void {
  if (!searchText.value) {
    selectedLocal.value = undefined;
  } else if (!searchLoading.value && searchText.value != props.selected?.name) {
    if (searchDebounce) searchDebounce.cancel();
    searchDebounce = debounce(async () => {
      await doSearch(event);
    }, 600);
    searchDebounce();
  }
}

async function doSearch(event: any) {
  results.value = await search();
  await showResultsOverlay(event);
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

async function onEnter(event: KeyboardEvent) {
  if (resultsOP.value) resultsOP.value.show(event);
  if (searchText.value) {
    results.value = await search();
  }
}

async function search() {
  if (searchText.value && searchText.value.length > 2) {
    searchLoading.value = true;
    const imQueryCopy = props.imQuery ? cloneDeep(props.imQuery) : { query: {} };
    imQueryCopy.textSearch = searchText.value;
    imQueryCopy.page = { pageNumber: 1, pageSize: 10 };
    const response = await QueryService.queryIMSearch(imQueryCopy);
    searchLoading.value = false;
    return response;
  }
}

function showResultsOverlay(event: any) {
  if (resultsOP.value) resultsOP.value.show(event, event.target);
}

function hideResultsOverlay() {
  if (resultsOP.value) resultsOP.value.hide();
}

function onListboxOptionClick(selected: SearchResultSummary) {
  selectedLocal.value = selected;
  hideOverlay();
  hideResultsOverlay();
}
</script>

<style scoped>
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

.mic {
  cursor: pointer;
}

#autocomplete-search {
  font-size: 1rem;
  height: 2.25rem;
  flex: 1 1 auto;
  width: 100%;
}

.autocomplete-search {
  font-size: 1rem;
  height: 2.25rem;
  flex: 1 1 auto;
  width: 100%;
}

.results-container {
  display: flex;
  flex-flow: column nowrap;
  gap: 0.5rem;
}

.advanced-search-container {
  display: flex;
  flex-flow: row;
  align-items: baseline;
  justify-content: space-between;
}

.loading-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}

.listbox-item {
  width: 100%;
}
</style>
