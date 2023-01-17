<template>
  <div class="search-container">
    <InputText id="autocomplete-search" v-model="searchText" placeholder="Search" @keyup.enter="search" data-testid="search-input" />
    <SplitButton class="search-button p-button-secondary" label="Search" :model="buttonActions">
      <Button @click="search" class="search-button p-button-secondary" label="Search" />
    </SplitButton>
    <Button
      id="filter-button"
      icon="pi pi-sliders-h"
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

import { computed, ComputedRef, ref, Ref, watch } from "vue";
import { useStore } from "vuex";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { TTIriRef, Namespace, EntityReferenceNode, SearchRequest, FilterOptions } from "@im-library/interfaces";
import { SortBy, SortDirection } from "@im-library/enums";
import { DataTypeCheckers } from "@im-library/helpers";
import { useRouter } from "vue-router";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { IM } from "@im-library/vocabulary";
const { isObject } = DataTypeCheckers;

const router = useRouter();
const store = useStore();
const selectedFilters: ComputedRef<FilterOptions> = computed(() => store.state.selectedFilters);

const controller: Ref<AbortController> = ref({} as AbortController);
const searchText = ref("");

watch(searchText, async () => await search());

const filtersOP = ref();

const buttonActions = ref([
  {
    label: "ECL",
    command: () => toEclSearch()
  }
]);

function openFiltersOverlay(event: any) {
  filtersOP.value.toggle(event);
}

function toEclSearch() {
  router.push({ name: "EclSearch" });
}

async function search(): Promise<void> {
  if (searchText.value) {
    router.push({
      name: "Search"
    });
    store.commit("updateSearchLoading", true);
    const searchRequest = {} as SearchRequest;
    searchRequest.termFilter = searchText.value;
    searchRequest.sortBy = SortBy.Usage;
    searchRequest.page = 1;
    searchRequest.size = 100;
    searchRequest.schemeFilter = selectedFilters.value.schemes.map(scheme => scheme["@id"]);

    searchRequest.statusFilter = [];
    selectedFilters.value.status.forEach((status: EntityReferenceNode) => {
      searchRequest.statusFilter.push(status["@id"]);
    });

    searchRequest.typeFilter = [];
    selectedFilters.value.types.forEach((type: TTIriRef) => {
      searchRequest.typeFilter.push(type["@id"]);
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
    await store.dispatch("fetchSearchResults", {
      searchRequest: searchRequest,
      controller: controller.value
    });
    store.commit("updateSearchLoading", false);
  }
}
</script>

<style scoped>
#filter-button {
  height: 2.25rem;
}

.search-container {
  padding: 0 0.2rem;
  display: flex;
  flex-flow: row nowrap;
  gap: 0.2rem;
}

#autocomplete-search {
  font-size: 1rem;
  background: #dee2e6;
  border: none;
  width: 30rem;
  height: 2.25rem;
}

.fa-icon {
  padding-right: 0.25rem;
}

.search-button {
  height: 2.25rem;
}
</style>
