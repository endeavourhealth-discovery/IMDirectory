<template>
  <div class="search-container">
    <InputText id="autocomplete-search" v-model="searchText" placeholder="Search" @keyup.enter="search" />

    <Button id="filter-button" icon="pi pi-sliders-h" class="p-button-rounded p-button-text p-button-plain p-button-lg" @click="openFiltersOverlay" />
    <OverlayPanel ref="filtersOP" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: '450px' }">
      <div class="p-fluid results-filter-container">
        <Filters :search="search" />
      </div>
    </OverlayPanel>
  </div>
</template>

<script setup lang="ts">
import Filters from "@/components/topbar/search/Filters.vue";

import { computed, ref, Ref, watch } from "vue";
import { useStore } from "vuex";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { TTIriRef, Namespace, EntityReferenceNode, SearchRequest } from "im-library/dist/types/interfaces/Interfaces";
import { Enums, Helpers } from "im-library";
import { useRouter } from "vue-router";
const { SortBy } = Enums;
const {
  DataTypeCheckers: { isObject }
} = Helpers;

const router = useRouter();
const store = useStore();
const selectedFilters = computed(() => store.state.selectedFilters);

const controller: Ref<AbortController> = ref({} as AbortController);
const searchText = ref("");

watch(searchText, async () => await search());

const filtersOP = ref();

function openFiltersOverlay(event: any) {
  filtersOP.value.toggle(event);
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
    searchRequest.schemeFilter = selectedFilters.value.schemes.map((scheme: Namespace) => scheme.iri);

    searchRequest.statusFilter = [];
    selectedFilters.value.status.forEach((status: EntityReferenceNode) => {
      searchRequest.statusFilter.push(status["@id"]);
    });

    searchRequest.typeFilter = [];
    selectedFilters.value.types.forEach((type: TTIriRef) => {
      searchRequest.typeFilter.push(type["@id"]);
    });

    if (selectedFilters.value.sortField) {
      searchRequest.sortField = selectedFilters.value.sortField;
      searchRequest.sortDirection = selectedFilters.value.sortDirection;
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
</style>
