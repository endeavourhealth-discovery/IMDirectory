<template>
  <div class="search-container">
    <span class="p-input-icon-right search-group">
      <i v-if="searchLoading" class="pi pi-spin pi-spinner"></i>
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
      <div v-if="searchLoading" class="loading-container">
        <ProgressSpinner />
      </div>
      <div v-else class="p-fluid results-container">
        <Listbox v-if="results?.entities" v-model="selectedLocal" :options="results.entities">
          <template #option="slotProps">
            <div
              class="listbox-item"
              @mouseover="slotProps.option.iri != 'any' ? showOverlay($event, slotProps.option.iri) : null"
              @mouseleave="hideOverlay($event)"
              @click="onListboxOptionClick($event, slotProps.option)"
            >
              <span>{{ slotProps.option.name }}</span>
            </div>
          </template>
        </Listbox>
        <div v-else>No results</div>

        <div class="advanced-search-container">
          <Button label="Advanced search" class="advanced-search-button" @click="showDialog = true" />
          <small>
            Showing {{ results?.entities?.length ? 1 : 0 }}-{{ results?.entities?.length ? results.entities.length : 0 }} of
            {{ results?.count ? results.count : 0 }} results
          </small>
        </div>
      </div>
    </OverlayPanel>
    <DirectorySearchDialog
      v-if="showDialog"
      v-model:show-dialog="showDialog"
      v-model:selected="selectedLocal"
      :imQuery="imQuery"
      :osQuery="osQuery"
      :root-entities="rootEntities"
      :selected-filter-options="filterOptions"
      :searchTerm="searchText"
    />
    <OverlaySummary ref="OS" />
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, watch, onMounted } from "vue";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import { FilterOptions } from "@im-library/interfaces";
import { SearchRequest, QueryRequest, SearchResultSummary, SearchResponse } from "@im-library/interfaces/AutoGen";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import setupSpeechToText from "@/composables/setupSpeechToText";
import setupSearch from "@/composables/setupSearch";
import _ from "lodash";
import setupOverlay from "@/composables/setupOverlay";

interface Props {
  selected?: SearchResultSummary;
  imQuery?: QueryRequest;
  osQuery?: SearchRequest;
  filterOptions?: FilterOptions;
  disabled?: boolean;
  rootEntities?: string[];
  searchPlaceholder?: string;
}

const props = withDefaults(defineProps<Props>(), { rootEntities: () => [] as string[] });

const emit = defineEmits({
  "update:selected": _payload => true,
  openDialog: () => true
});

const resultsOP = ref();
const searchText = ref("");
const results: Ref<SearchResponse | undefined> = ref();
const showDialog = ref(false);
const selectedLocal: Ref<SearchResultSummary | undefined> = ref();
const { searchLoading, searchPlaceholder, search } = setupSearch(props.searchPlaceholder);
const { listening, speech, recog, toggleListen } = setupSpeechToText(searchText, searchPlaceholder);
const selectedIndex: Ref<number> = ref(-1);
const { OS, showOverlay, hideOverlay } = setupOverlay();
const debounce = ref(0);

watch(showDialog, () => {
  if (showDialog.value) emit("openDialog");
});

watch(
  () => _.cloneDeep(props.selected),
  (newValue, oldValue) => {
    if (!_.isEqual(newValue, oldValue)) {
      searchLoading.value = true;
      if (newValue && newValue.name && newValue.name != searchText.value) {
        searchText.value = newValue.name;
        selectedLocal.value = newValue;
      } else if (!newValue) {
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
    if (!_.isEqual(newValue, oldValue)) emit("update:selected", newValue);
  },
  { deep: true }
);

watch(searchText, newValue => {
  if (!newValue) {
    selectedLocal.value = undefined;
  } else if (!searchLoading.value && newValue != props.selected?.name) debounceForSearch();
});

onMounted(() => {
  searchLoading.value = true;
  if (props.selected?.name) {
    searchText.value = props.selected.name;
    selectedLocal.value = props.selected;
  }
  searchLoading.value = false;
});

function debounceForSearch(): void {
  clearTimeout(debounce.value);
  debounce.value = window.setTimeout(async () => {
    results.value = await search(searchText.value, undefined, { pageNumber: 1, pageSize: 10 }, props.osQuery, props.imQuery);
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
}

async function showResultsOverlay(event: any) {
  if (resultsOP.value) resultsOP.value.show(event);
}

function hideResultsOverlay() {
  if (resultsOP.value) resultsOP.value.hide();
}

function onListboxOptionClick(event: any, selected: SearchResultSummary) {
  selectedLocal.value = selected;
  hideOverlay(event);
  hideResultsOverlay();
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
