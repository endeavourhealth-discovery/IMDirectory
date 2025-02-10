<template>
  <div id="directory-main-container">
    <TopBar>
      <template #content>
        <div id="topbar-content-container">
          <SearchBar
            v-model:search-term="directorySearchTerm"
            :selected-filter-options="storeSelectedFilterOptions"
            :show-filters="true"
            @to-ecl-search="toEclSearch"
            @to-query-search="toQuerySearch"
            @to-search="toSearch"
            @selected-filters-updated="onSelectedFiltersUpdated"
          />
        </div>
      </template>
    </TopBar>
    <div id="app-content-container">
      <DirectorySplitter
        :searchTerm="directorySearchTerm"
        :updateSearch="updateSearch"
        :selected-filter-options="storeSelectedFilterOptions"
        @selected-filters-updated="onSelectedFiltersUpdated"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, onMounted, ref, Ref, watch } from "vue";
import TopBar from "@/components/shared/TopBar.vue";
import SearchBar from "@/components/shared/SearchBar.vue";
import DirectorySplitter from "@/components/directory/DirectorySplitter.vue";
import { useRouter } from "vue-router";
import { useFilterStore } from "@/stores/filterStore";
import { FilterOptions } from "@/interfaces";

const router = useRouter();
const filterStore = useFilterStore();
const directorySearchTerm: Ref<string> = ref("");
const updateSearch: Ref<boolean> = ref(false);
const storeSelectedFilterOptions: ComputedRef<FilterOptions> = computed(() => filterStore.selectedFilterOptions);

function onSelectedFiltersUpdated(filters: FilterOptions) {
  filterStore.updateSelectedFilterOptions(filters);
  if (directorySearchTerm.value && directorySearchTerm.value.length > 2) toSearch();
}

function toSearch() {
  router.push({ name: "Search" });
  updateSearch.value = !updateSearch.value;
}

function toEclSearch() {
  router.push({ name: "EclSearch" });
}

function toQuerySearch() {
  router.push({ name: "IMQuerySearch" });
}
</script>

<style scoped>
#directory-main-container {
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
}

#topbar-content-container {
  height: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
  align-items: center;
}

body {
  overflow: hidden;
}

.loading-container {
  width: 100%;
  height: 100%;
}

#app-content-container {
  flex: 1 1 auto;
  overflow: auto;
}

#topbar-container {
  height: 4rem;
  width: 100vw;
}
</style>
