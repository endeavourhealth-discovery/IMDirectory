<template>
  <div class="search-container">
    <InputGroup class="search-group">
      <InputGroupAddon @click="toggleListen" class="mic">
        <IMFontAwesomeIcon :icon="listening ? 'fa-duotone fa-microphone-slash' : 'fa-duotone fa-microphone'" />
      </InputGroupAddon>
      <InputText
        id="autocomplete-search"
        v-model="searchText"
        :placeholder="searchPlaceholder"
        @complete="debounceForSearch"
        data-testid="search-input"
        autofocus
        v-on:keyup.enter="onSearch"
        :loading="searchLoading"
        :pt="{ root: { autocomplete: allowAutocomplete ? 'on' : 'off' } }"
      />
    </InputGroup>
    <SplitButton
      class="search-button p-button-secondary"
      @click="onSearch"
      label="Search"
      :model="buttonActions"
      :loading="searchLoading"
      data-testid="topbar-search-button"
    />
    <Button
      v-if="showFilters"
      v-tooltip.bottom="'Filters'"
      id="filter-button"
      icon="fa-duotone fa-sliders"
      class="p-button-rounded p-button-text p-button-plain p-button-lg"
      @click="openFiltersOverlay"
      data-testid="filters-open-button"
    />
    <Popover ref="filtersOP" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: '450px' }">
      <div v-if="showFilters" class="results-filter-container">
        <Filters
          :search="onSearch"
          data-testid="filters"
          :selected-filter-options="selectedFilterOptions"
          @selectedFiltersUpdated="emit('selectedFiltersUpdated', $event)"
        />
      </div>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import Filters from "@/components/shared/Filters.vue";
import { ref, watch, onMounted } from "vue";
import { FilterOptions } from "@/interfaces";
import { SearchResultSummary } from "@/interfaces/AutoGen";
import setupSpeechToText from "@/composables/setupSpeechToText";
import { Ref } from "vue";
import InputGroupAddon from "primevue/inputgroupaddon";
import IMFontAwesomeIcon from "./IMFontAwesomeIcon.vue";

interface Props {
  searchTerm?: string;
  showFilters: boolean;
  selectedFilterOptions?: FilterOptions;
  selected?: SearchResultSummary;
  allowAutocomplete?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  showFilters: false,
  allowAutocomplete: true
});

const emit = defineEmits<{
  "update:searchTerm": [payload: string];
  selectedFiltersUpdated: [payload: FilterOptions];
  toSearch: [];
  toEclSearch: [];
  toQuerySearch: [];
}>();

const searchText = ref("");
const buttonActions = ref([
  { label: "ECL", command: () => emit("toEclSearch") },
  { label: "IMQuery", command: () => emit("toQuerySearch") }
]);
const searchPlaceholder: Ref<string> = ref("Search");
const searchLoading: Ref<boolean> = ref(false);
const { listening, toggleListen } = setupSpeechToText(searchText, searchPlaceholder);
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

.results-filter-container {
  display: flex;
  flex-flow: column nowrap;
}

.search-group {
  width: 30%;
  height: 2.25rem;
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

.search-button {
  height: 2.25rem;
}
</style>
