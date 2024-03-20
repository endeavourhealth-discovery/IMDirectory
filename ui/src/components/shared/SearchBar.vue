<template>
  <div class="search-container">
    <span class="p-input-icon-right search-group">
      <i v-if="searchLoading" class="pi pi-spin pi-spinner"></i>
      <i v-else-if="speech" class="pi pi-microphone mic" :class="listening && 'listening'" @click="toggleListen"></i>
      <InputText
        id="autocomplete-search"
        v-model="searchText"
        :placeholder="searchPlaceholder"
        @complete="debounceForSearch"
        data-testid="search-input"
        autofocus
        v-on:keyup.enter="onSearch"
      />
    </span>
    <SplitButton class="search-button p-button-secondary" @click="onSearch" label="Search" :model="buttonActions" :loading="searchLoading" />
    <Button
      v-if="showFilters"
      v-tooltip.bottom="'Filters'"
      id="filter-button"
      icon="fa-duotone fa-sliders"
      class="p-button-rounded p-button-text p-button-plain p-button-lg"
      @click="openFiltersOverlay"
      data-testid="filters-open-button"
    />
    <OverlayPanel ref="filtersOP" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: '450px' }">
      <div v-if="showFilters" class="p-fluid results-filter-container">
        <Filters
          :search="onSearch"
          data-testid="filters"
          :selected-filter-options="selectedFilterOptions"
          @selectedFiltersUpdated="emit('selectedFiltersUpdated', $event)"
        />
      </div>
    </OverlayPanel>
  </div>
</template>

<script setup lang="ts">
import Filters from "@/components/shared/Filters.vue";
import { ref, Ref, watch, onMounted } from "vue";
import { FilterOptions } from "@im-library/interfaces";
import { SearchRequest, QueryRequest, SearchResultSummary, SearchResponse } from "@im-library/interfaces/AutoGen";
import setupSpeechToText from "@/composables/setupSpeechToText";
import _ from "lodash";
import setupSearch from "@/composables/setupSearch";

interface Props {
  searchTerm: string;
  showFilters: boolean;
  selectedFilterOptions?: FilterOptions;
  selected?: SearchResultSummary;
}

const props = defineProps<Props>();
const emit = defineEmits({
  "update:searchTerm": _payload => true,
  selectedFiltersUpdated: (_payload: FilterOptions) => true,
  toSearch: () => true,
  toEclSearch: () => true,
  toQuerySearch: () => true
});

const searchText = ref("");
const buttonActions = ref([
  { label: "ECL", command: () => emit("toEclSearch") },
  { label: "IMQuery", command: () => emit("toQuerySearch") }
]);
const { searchPlaceholder, searchLoading, search } = setupSearch();
const { listening, speech, recog, toggleListen } = setupSpeechToText(searchText, searchPlaceholder);
const filtersOP = ref();
const debounce = ref(0);

watch(searchText, async () => {
  emit("update:searchTerm", searchText.value);
  debounceForSearch();
});

onMounted(() => {
  if (props.searchTerm) searchText.value = props.searchTerm;
});

function openFiltersOverlay(event: any) {
  filtersOP.value.toggle(event);
}

function debounceForSearch(): void {
  clearTimeout(debounce.value);
  debounce.value = window.setTimeout(() => {
    onSearch();
  }, 600);
}

async function onSearch() {
  emit("toSearch");
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
