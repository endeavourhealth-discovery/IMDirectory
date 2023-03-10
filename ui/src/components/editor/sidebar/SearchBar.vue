<template>
  <div class="p-inputgroup">
    <InputText id="editor-search" v-model="searchText" placeholder="Search..." @keyup.enter="search" data-testid="editor-search-input" />
    <Button
      id="filter=button"
      icon="pi pi-sliders-h"
      class="p-button-rounded p-button-text p-button-plain p-button-lg"
      @click="openFiltersOverlay"
      data-testid="filters-open-button"
    />
  </div>
  <OverlayPanel ref="filtersOP" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: '450px' }">
    <div class="p-fluid results-filter-container">
      <Filters :search="search" />
    </div>
  </OverlayPanel>
</template>

<script setup lang="ts">
import { Ref, ref, watch, computed, ComputedRef } from "vue";
import { useStore } from "vuex";
import Filters from "@/components/directory/topbar/Filters.vue";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { FilterOptions } from "@im-library/interfaces";
import { SearchRequest, TTIriRef } from "@im-library/interfaces/AutoGen";
import { SortDirection } from "@im-library/enums";
import { isArrayHasLength, isObject, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { EntityService } from "@/services";
import { isArray } from "lodash";
import { IM } from "@im-library/vocabulary";

const emit = defineEmits({
  openSearchPanel: () => true,
  searchLoading: (_payload: boolean) => true,
  searchResults: (payload: any[]) => isArray(payload)
});

const store = useStore();
const selectedFilters: ComputedRef<FilterOptions> = computed(() => store.state.selectedFilters);

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
    searchRequest.sortField = "weighting";
    searchRequest.page = 1;
    searchRequest.size = 100;
    searchRequest.schemeFilter = selectedFilters.value.schemes.map(scheme => scheme["@id"]);

    searchRequest.statusFilter = [];
    selectedFilters.value.status.forEach(status => {
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
    searchResults.value = await EntityService.advancedSearch(searchRequest, controller.value);
    emit("searchResults", searchResults.value);
    emit("searchLoading", false);
  }
}
</script>

<style scoped></style>
