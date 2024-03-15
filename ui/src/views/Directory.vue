<template>
  <div id="directory-main-container">
    <TopBar>
      <template #content>
        <div id="topbar-content-container">
          <SearchBar
            v-model:search-results="searchResults"
            v-model:search-loading="searchLoading"
            v-model:search-term="directorySearchTerm"
            @to-ecl-search="toEclSearch"
            @to-query-search="toQuerySearch"
            @search="onSearch"
          />
        </div>
      </template>
    </TopBar>
    <div id="app-content-container">
      <div v-if="loading" class="flex flex-row justify-content-center align-items-center loading-container">
        <ProgressSpinner />
      </div>
      <DirectorySplitter v-else :searchTerm="directorySearchTerm" :searchLoading="searchLoading" :searchResults="searchResults" :updateSearch="updateSearch" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref, watch } from "vue";
import TopBar from "@/components/shared/TopBar.vue";
import SearchBar from "@/components/shared/SearchBar.vue";
import DirectorySplitter from "@/components/directory/DirectorySplitter.vue";
import { useRouter } from "vue-router";
import { useFilterStore } from "@/stores/filterStore";
import { useUserStore } from "@/stores/userStore";
import { SearchResponse } from "@im-library/interfaces/AutoGen";

const router = useRouter();
const filterStore = useFilterStore();
const userStore = useUserStore();
const loading = ref(true);
const searchLoading = ref(false);
const searchResults: Ref<SearchResponse | undefined> = ref();
const directorySearchTerm: Ref<string> = ref("");
const updateSearch: Ref<boolean> = ref(false);

watch(searchResults, newValue => {
  if (newValue) router.push({ name: "Search" });
});

onMounted(async () => {
  loading.value = true;
  await filterStore.fetchFilterSettings();
  await userStore.initFavourites();
  loading.value = false;
});

function onSearch() {
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
