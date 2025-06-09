<template>
  <div class="search-container" ref="autocompleteRoot">
    <IconField class="autocomplete-search" iconPosition="right">
      <InputIcon v-if="!searchLoading && !listening" class="pi pi-microphone mic" :class="{ listening }" @click="toggleListen" />
      <InputIcon v-if="searchLoading" class="pi pi-spin pi-spinner" />
      <InputText
        id="autocomplete-search"
        ref="searchInput"
        :disabled="disabled"
        v-model="searchText"
        :placeholder="searchPlaceholder"
        data-testid="search-input"
        @input="debounceForSearch"
        @keydown.down="select"
        @keydown.enter="onEnter"
        @keydown.up="select"
        @focus="handleFocus"
        @blur="editing = false"
        @mouseover="selected?.iri != 'any' && showOverlay($event, selected?.iri)"
        @mouseleave="hideOverlay"
        :pt="{ root: { autocomplete: allowBrowserAutocomplete ? 'on' : 'off' } }"
      />
      <i v-if="editing" class="fa fa-times-circle clear-icon" @mousedown.prevent="clearSearch()"></i>
    </IconField>

    <Button
      :disabled="disabled"
      severity="info"
      @click="advancedSearch"
      data-testid="autocomplete-search-button"
      icon="pi pi-search"
      v-tooltip="'Advanced search'"
    />
    <Popover ref="resultsOP" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: '450px' }" appendTo="body">
      <div v-if="searchLoading" class="loading-container">
        <ProgressSpinner />
      </div>
      <div v-else class="results-container" :tabindex="0">
        <Listbox v-if="results?.entities" v-model="listBoxSelected" :options="results.entities">
          <template #option="slotProps">
            <div
              class="listbox-item"
              @mouseover="slotProps.option.iri != 'any' ? showOverlay($event, slotProps.option.iri) : null"
              @mouseleave="hideOverlay"
              @click="onListboxOptionClick(slotProps.option)"
            >
              <span>{{ slotProps.option.bestMatch ? slotProps.option.bestMatch : slotProps.option.name }}</span>
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
import { onMounted, Ref, ref, watch, nextTick, computed, onBeforeUnmount } from "vue";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import { FilterOptions } from "@/interfaces";
import { QueryRequest, SearchResponse, SearchResultSummary, TextSearchStyle } from "@/interfaces/AutoGen";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import setupSpeechToText from "@/composables/setupSpeechToText";
import { cloneDeep, debounce, isEqual } from "lodash-es";
import setupOverlay from "@/composables/setupOverlay";
import { EntityService, QueryService } from "@/services";
import { registerAutocomplete, unregisterAutocomplete } from "@/composables/useAutocompleteRegistry";
interface Props {
  selected?: SearchResultSummary;
  filterOptions?: FilterOptions;
  disabled?: boolean;
  rootEntities?: string[];
  searchPlaceholder?: string;
  quickTypeFiltersAllowed?: string[];
  selectedQuickTypeFilter?: string;
  allowBrowserAutocomplete?: boolean;
  setupSearch?: () => Promise<QueryRequest>;
  setupRootEntities?: () => Promise<string[]>;
}

const props = withDefaults(defineProps<Props>(), { rootEntities: () => [] as string[], allowBrowserAutocomplete: false });

const emit = defineEmits<{
  "update:selected": [payload: SearchResultSummary | undefined];
  openDialog: [];
  updateSelectedFilters: [payload: FilterOptions];
}>();

const imQuery = defineModel<QueryRequest>("imQuery");
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
const listBoxSelected: Ref<SearchResultSummary | undefined> = ref();
const searchInput = ref<any>(null);
const localRootEntities = ref<string[]>([]);
let searchDebounce: any;
const editing = ref(false);
const autocompleteRoot = ref<HTMLElement | null>(null);
defineExpose({ searchText });
watch(showDialog, () => {
  if (showDialog.value) emit("openDialog");
});

watch(
  () => cloneDeep(props.selected),
  (newValue, oldValue) => {
    if (!isEqual(newValue, oldValue)) {
      searchLoading.value = true;
      if (newValue && (newValue.name || newValue.bestMatch)) {
        searchText.value = newValue.bestMatch ? newValue.bestMatch : newValue.name!;
        selectedLocal.value = newValue;
      } else {
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
    if (newValue?.iri !== oldValue?.iri) {
      if (newValue?.name) {
        searchText.value = newValue!.name ? newValue!.name : "";
        emit("update:selected", newValue);
      }
    }
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
  if (props.selected?.name) {
    searchText.value = props.selected.name;
    selectedLocal.value = props.selected;
  }
  if (autocompleteRoot.value) {
    registerAutocomplete({
      element: autocompleteRoot.value,
      reset: () => {
        searchText.value = props.selected && props.selected.name ? props.selected.name : "";
      }
    });
  }
  searchLoading.value = false;
});

onBeforeUnmount(() => {
  if (autocompleteRoot.value) {
    unregisterAutocomplete(autocompleteRoot.value);
  }
});

function handleGlobalFocus(event: FocusEvent) {
  const root = autocompleteRoot.value;
  if (!root) return;
  const target = event.target as Node;
  if (!root.contains(target)) {
    if (props.selected && props.selected.name) searchText.value = props.selected.name;
    else searchText.value = "";
  }
}
function clearSearch() {
  searchText.value = "";
  selectedLocal.value = undefined;
  nextTick(() => {
    searchInput.value.$el.focus();
  });
}
function handleFocus(event: FocusEvent) {
  if (!editing.value) {
    editing.value = true;
    (event.target as HTMLInputElement).select();
  }
}
async function advancedSearch() {
  if (!props.rootEntities || props.rootEntities.length === 0) {
    if (props.setupRootEntities) {
      localRootEntities.value = await props.setupRootEntities();
    } else localRootEntities.value = [];
  } else localRootEntities.value = props.rootEntities;
  if (!imQuery.value) {
    if (props.setupSearch) {
      imQuery.value = await props.setupSearch();
    }
  }
  showDialog.value = true;
}

function debounceForSearch(event: Event): void {
  if (!searchText.value) {
    selectedLocal.value = undefined;
    editing.value = false;
  } else if (!searchLoading.value && searchText.value != props.selected?.name) {
    editing.value = true;
    if (searchDebounce) searchDebounce.cancel();
    searchDebounce = debounce(async () => {
      await doSearch(event);
    }, 600);
    searchDebounce();
  }
}

async function doSearch(event: any) {
  results.value = await search();
  showResultsOverlay(event);
}

async function onEnter(event: KeyboardEvent) {
  if (listBoxSelected.value) onListboxOptionClick(listBoxSelected.value);
}
function select(event: KeyboardEvent) {
  if (isArrayHasLength(results.value?.entities))
    if (event.key === "ArrowDown") {
      if (selectedIndex.value < results.value!.entities!.length - 1) listBoxSelected.value = results.value?.entities?.[++selectedIndex.value];
      else {
        selectedIndex.value = 0;
        listBoxSelected.value = results.value?.entities?.[selectedIndex.value];
      }
    } else if (event.key === "ArrowUp") {
      if (selectedIndex.value > 0) listBoxSelected.value = results.value?.entities?.[--selectedIndex.value];
      else {
        selectedIndex.value = results.value!.entities!.length - 1;
        listBoxSelected.value = results.value?.entities?.[selectedIndex.value];
      }
    }
}

async function search() {
  if (searchText.value && searchText.value.length > 2) {
    let imQueryCopy: QueryRequest | undefined = undefined;
    if (imQuery.value) {
      imQueryCopy = cloneDeep(imQuery.value);
    }
    if (!imQueryCopy) {
      if (props.setupSearch) imQueryCopy = await props.setupSearch();
    }
    if (imQueryCopy) {
      searchLoading.value = true;
      imQueryCopy.textSearch = searchText.value;
      imQueryCopy.page = { pageNumber: 1, pageSize: 10 };
      imQueryCopy.textSearchStyle = TextSearchStyle.autocomplete;
      const response = await QueryService.queryIMSearch(imQueryCopy);
      searchLoading.value = false;
      return response;
    }
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
  editing.value = false;
  emit("update:selected", selectedLocal.value);
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
.listbox-item:focus {
  outline: none;
}

.clear-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  cursor: pointer;
  font-size: 1.1rem;
  z-index: 10;
  pointer-events: auto;
}

.clear-icon:hover {
  color: #555;
}
</style>
