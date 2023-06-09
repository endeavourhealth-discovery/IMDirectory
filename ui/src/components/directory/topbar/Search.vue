<template>
  <div class="search-container">
    <span class="p-input-icon-right">
      <i class="pi pi-microphone" @mousedown="startListen" @mouseup="endListen"></i>
      <InputText id="autocomplete-search" v-model="searchText" placeholder="Search" @keyup.enter="search" data-testid="search-input" />
    </span>
    <SplitButton class="search-button p-button-secondary" label="Search" :model="buttonActions">
      <Button @click="search" class="search-button p-button-secondary" label="Search" />
    </SplitButton>
    <Button
      v-tooltip.bottom="'Filters'"
      id="filter-button"
      :icon="fontAwesomePro ? 'fa-duotone fa-sliders' : 'pi pi-sliders-h'"
      class="p-button-rounded p-button-text p-button-plain p-button-lg"
      @click="openFiltersOverlay"
      data-testid="filters-open-button"
    />
    <OverlayPanel ref="filtersOP" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: '450px' }">
      <div class="p-fluid results-filter-container">
        <Filters :search="search" data-testid="filters" />
      </div>
    </OverlayPanel>
  </div>
</template>

<script setup lang="ts">
import Filters from "./Filters.vue";

import { computed, ComputedRef, onMounted, ref, Ref, watch } from "vue";
import { FilterOptions } from "@im-library/interfaces";
import { SearchRequest, TTIriRef } from "@im-library/interfaces/AutoGen";
import { SortDirection } from "@im-library/enums";
import { DataTypeCheckers } from "@im-library/helpers";
import { useRouter } from "vue-router";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { IM } from "@im-library/vocabulary";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useFilterStore } from "@/stores/filterStore";
import { useSharedStore } from "@/stores/sharedStore";
const { isObject } = DataTypeCheckers;

const router = useRouter();
const directoryStore = useDirectoryStore();
const sharedStore = useSharedStore();
const filterStore = useFilterStore();
const selectedFilters: ComputedRef<FilterOptions> = computed(() => filterStore.selectedFilters);
const fontAwesomePro = computed(() => sharedStore.fontAwesomePro);
const speech = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let recog: any = false;

const controller: Ref<AbortController> = ref({} as AbortController);
const searchText = ref("");

watch(searchText, async () => await search());

const filtersOP = ref();

const buttonActions = ref([
  {
    label: "ECL",
    command: () => toEclSearch()
  },
  {
    label: "IMQuery",
    command: () => toIMQuerySearch()
  }
]);


onMounted(() => {
  if (speech) {
    recog = new speech();
    recog.addEventListener("result", (ev: any) => {
      searchText.value = ev.results[0][0].transcript;
    })
  }
})
function openFiltersOverlay(event: any) {
  filtersOP.value.toggle(event);
}

function toEclSearch() {
  router.push({ name: "EclSearch" });
}

function toIMQuerySearch() {
  router.push({ name: "IMQuerySearch" });
}

async function search(): Promise<void> {
  if (searchText.value) {
    router.push({
      name: "Search"
    });
    directoryStore.updateSearchLoading(true);
    const searchRequest = {} as SearchRequest;
    searchRequest.termFilter = searchText.value;
    searchRequest.sortField = "weighting";
    searchRequest.page = 1;
    searchRequest.size = 100;
    searchRequest.schemeFilter = selectedFilters.value.schemes.map(scheme => scheme["@id"]);

    searchRequest.statusFilter = [];
    selectedFilters.value.status.forEach((status: TTIriRef) => {
      searchRequest.statusFilter!.push(status["@id"]);
    });

    searchRequest.typeFilter = [];
    selectedFilters.value.types.forEach((type: TTIriRef) => {
      searchRequest.typeFilter!.push(type["@id"]);
    });

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
    await directoryStore.fetchSearchResults({
      searchRequest: searchRequest,
      controller: controller.value
    });
    directoryStore.updateSearchLoading(false);
  }
}
function startListen() {
  if (recog)
    recog.start();
}

function endListen() {
  if (recog)
    recog.stop();
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

#autocomplete-search {
  font-size: 1rem;
  border: none;
  max-width: 25rem;
  height: 2.25rem;
  flex: 1 1 auto;
}

.fa-icon {
  padding-right: 0.25rem;
}

.search-button {
  height: 2.25rem;
}
</style>
