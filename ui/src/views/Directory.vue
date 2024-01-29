<template>
  <div id="directory-main-container">
    <TopBar>
      <template #content>
        <div id="topbar-content-container">
          <SearchBar
            v-model:search-results="searchResults"
            v-model:search-loading="searchLoading"
            @to-ecl-search="toEclSearch"
            @to-query-search="toQuerySearch"
            v-model:loadMore="loadMore"
            v-model:download="download"
          />
        </div>
      </template>
    </TopBar>
    <div id="app-content-container">
      <div v-if="loading" class="flex flex-row justify-content-center align-items-center loading-container">
        <ProgressSpinner />
      </div>
      <DirectorySplitter
        v-else
        @lazyLoadRequested="lazyLoadRequested"
        @downloadRequested="downloadRequested"
        :searchLoading="searchLoading"
        :searchResults="searchResults"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref, watch } from "vue";
import TopBar from "@/components/shared/TopBar.vue";
import SearchBar from "@/components/shared/SearchBar.vue";
import DirectorySplitter from "@/components/directory/DirectorySplitter.vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useFilterStore } from "@/stores/filterStore";
import { useUserStore } from "@/stores/userStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { SearchResponse } from "@im-library/interfaces/AutoGen";

const router = useRouter();
const toast = useToast();
const filterStore = useFilterStore();
const userStore = useUserStore();
const directoryStore = useDirectoryStore();

const currentUser = computed(() => userStore.currentUser);
const isLoggedIn = computed(() => userStore.isLoggedIn);

const loading = ref(true);
const searchLoading = ref(false);
const searchResults: Ref<SearchResponse | undefined> = ref();
const loadMore: Ref<{ page: number; rows: number } | undefined> = ref();
const download: Ref<{ term: string; count: number } | undefined> = ref();

watch(searchResults, newValue => {
  if (newValue) router.push({ name: "Search" });
});

onMounted(async () => {
  loading.value = true;
  await filterStore.fetchFilterSettings();
  await userStore.initFavourites();
  loading.value = false;
});

function toEclSearch() {
  router.push({ name: "EclSearch" });
}

function toQuerySearch() {
  router.push({ name: "IMQuerySearch" });
}

function lazyLoadRequested(event: any) {
  loadMore.value = event;
}

function downloadRequested(data: { term: string; count: number }) {
  download.value = data;
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
