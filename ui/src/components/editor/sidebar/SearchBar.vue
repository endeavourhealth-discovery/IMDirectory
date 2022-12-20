<template>
  <div>
    <InputText id="editor-search" v-model="searchText" placeholder="Search..." @keyup.enter="search" data-testid="editor-search-input" />
    <Button
      id="filter=button"
      icon="pi pi-sliders-h"
      class="p-button-rounded p-button-text p-button-plain p-button-lg"
      @click="openFiltersOverlay"
      data-testid="filters-open-button"
    />
    <OverlayPanel ref="filtersOP" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: '450px' }">
      <div class="p-fluid results-filter-container">
        <Filters :search="search" />
      </div>
    </OverlayPanel>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, watch, computed } from "vue";
import { useStore } from "vuex";
import Filters from "./Filters.vue";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { EntityReferenceNode, Namespace, SearchRequest, TTIriRef } from "@im-library/interfaces";
import { SortBy } from "@im-library/enums";
import { isObject } from "@im-library/helpers/DataTypeCheckers";
import { EntityService } from "@/services";
import { isArray } from "lodash";

const emit = defineEmits({
  openSearchPanel: () => true,
  searchLoading: (_payload: boolean) => true,
  searchResults: (payload: any[]) => isArray(payload)
});

const store = useStore();
const selectedFilters = computed(() => store.state.selectedFilters);

const controller: Ref<AbortController> = ref({} as AbortController);
const searchText = ref("");
const searchResults: Ref<any[]> = ref([]);

watch(searchText, async () => await search());

const filtersOP = ref();

function openFiltersOverlay(event: any) {
  filtersOP.value.toggle(event);
}

async function search(): Promise<void> {
  if (searchText.value) {
    emit("openSearchPanel");
    emit("searchLoading", true);
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
    searchResults.value = await EntityService.advancedSearch(searchRequest, controller.value);
    emit("searchResults", searchResults.value);
    emit("searchLoading", false);
  }
}
</script>

<style scoped></style>
