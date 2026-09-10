<template>
  <div ref="autocompleteRoot" class="search-container">
    <IconField class="autocomplete-search" iconPosition="right">
      <InputIcon v-if="!searchLoading && !listening" :class="{ listening }" class="pi pi-microphone mic" @click="toggleListen" />
      <InputIcon v-if="searchLoading" class="pi pi-spin pi-spinner" />
      <InputText
        id="autocomplete-search"
        ref="searchInput"
        v-model="searchText"
        :disabled="disabled"
        :placeholder="searchPlaceholder"
        :pt="{ root: { autocomplete: allowBrowserAutocomplete ? 'on' : 'off' } }"
        data-testid="search-input"
        @blur="editing = false"
        @focus="handleFocus"
        @input="debounceForSearch"
        @mouseleave="hideOverlay"
        @mouseover="selected?.iri != 'any' && showOverlay($event, selected?.iri)"
        @keydown.down="select"
        @keydown.enter="onEnter"
        @keydown.up="select"
      />
      <i v-if="editing" class="fa fa-times-circle clear-icon" @mousedown.prevent="clearSearch()"></i>
    </IconField>

    <Button
      v-tooltip="'Advanced search'"
      :disabled="disabled"
      data-testid="autocomplete-search-button"
      icon="pi pi-search"
      severity="info"
      @click="advancedSearch"
    />
    <Popover ref="resultsOP" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: '450px' }" appendTo="body">
      <div v-if="searchLoading" class="loading-container">
        <ProgressSpinner />
      </div>
      <div v-else :tabindex="0" class="results-container">
        <Listbox v-if="results?.entities" v-model="listBoxSelected" :options="results.entities">
          <template #option="slotProps">
            <div
              class="listbox-item"
              @click="onListBoxOptionClick(slotProps.option)"
              @mouseleave="hideOverlay"
              @mouseover="slotProps.option.iri != 'any' ? showOverlay($event, slotProps.option.iri) : null"
            >
              <span>{{ slotProps.option.bestMatch ? slotProps.option.bestMatch : slotProps.option.name }}</span>
            </div>
          </template>
        </Listbox>
        <div v-else>No results</div>

        <div class="advanced-search-container">
          <small>
            Showing {{ results?.entities?.length ? 1 : 0 }}-{{ results?.entities?.length ? results.entities.length : 0 }} of
            {{ results?.totalCount ? results.totalCount : 0 }} results
          </small>
        </div>
      </div>
    </Popover>
    <DirectorySearchDialog
      v-if="showDialog"
      v-model:selected="selectedLocal"
      v-model:show-dialog="showDialog"
      :imQuery="cloneDeep(imQuery)"
      :quick-type-filters-allowed="quickTypeFiltersAllowed"
      :root-entities="rootEntities"
      :searchTerm="searchText"
      :selected-filter-options="filterOptions"
      :selected-quick-type-filter="selectedQuickTypeFilter"
      :show-quick-type-filters="isArrayHasLength(quickTypeFiltersAllowed)"
      :validEntityQuery="validEntityQuery"
      @update-selected-filters="(filters: FilterOptions) => $emit('updateSelectedFilters', filters)"
    />
    <OverlaySummary ref="OS" />
  </div>
</template>

<script lang="ts" setup>
import { Ref, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { OverlaySummary } from "@endeavour/vue-library/components";
import { useOverlay, useSpeechToText } from "@endeavour/vue-library/composables";
import { TextSearchStyle } from "@endeavour/vue-library/enums";
import { isArrayHasLength } from "@endeavour/vue-library/helpers";
import { PageSchema, type QueryRequest, type SearchResponse, type SearchResultSummary } from "@endeavour/vue-library/models";

import { cloneDeep, debounce, isEqual } from "lodash-es";

import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import { useAutocompleteRegistry } from "@/composables/useAutocompleteRegistry";
import type { FilterOptions } from "@/models";
import { QueryService } from "@/services";

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
  validEntityQuery?: QueryRequest;
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
const selectedLocal: Ref<SearchResultSummary | undefined> = ref(props.selected);
const searchLoading: Ref<boolean> = ref(false);
const searchPlaceholder: Ref<string> = ref(props.searchPlaceholder ?? "Search");
const { listening, toggleListen } = useSpeechToText(searchText, searchPlaceholder);
const { registerAutocomplete, unregisterAutocomplete } = useAutocompleteRegistry();
const selectedIndex: Ref<number> = ref(-1);
const { OS, showOverlay, hideOverlay } = useOverlay();
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
      }
      emit("update:selected", newValue);
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
  if (listBoxSelected.value) onListBoxOptionClick(listBoxSelected.value);
  else await doSearch(event);
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
      imQueryCopy.page = PageSchema.parse({ pageNumber: 1, pageSize: 10 });
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

function onListBoxOptionClick(selected: SearchResultSummary) {
  selectedLocal.value = selected;
  hideOverlay();
  hideResultsOverlay();
  editing.value = false;
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
