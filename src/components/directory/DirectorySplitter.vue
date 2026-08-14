<template>
  <Splitter stateKey="directoryMainSplitterHorizontal" stateStorage="local" @resizeend="updateSplitter">
    <SplitterPanel :minSize="10" :size="30" data-testid="splitter-left" style="overflow: auto">
      <NavTree
        :allow-right-click="true"
        :find-in-tree="findInTreeBoolean"
        :selected-iri="findInTreeIri"
        @row-selected="routeToSelected"
        @found-in-tree="directoryStore.updateFindInTreeBoolean(false)"
      />
    </SplitterPanel>
    <SplitterPanel :minSize="10" :size="70" data-testid="splitter-right" style="overflow: auto">
      <div class="splitter-right">
        <div v-if="directoryLoading" class="loading-container flex flex-row items-center justify-center">
          <ProgressSpinner />
        </div>
        <router-view
          v-else
          v-slot="{ Component, route }"
          v-model:history="history"
          :rows="20"
          :searchResults="searchResults"
          :searchTerm="searchTerm"
          :selected-filter-options="selectedFilterOptions"
          :updateSearch="updateSearch"
          @goToSearchResults="goToSearchResults"
          @locateInTree="locateInTree"
          @navigateTo="navigateTo"
          @searchResultsUpdated="updateSearchResults"
          @selectedUpdated="routeToSelected"
          @selected-filters-updated="emit('selectedFiltersUpdated', $event)"
        >
          <transition :mode="route?.meta?.mode || 'in-out'" :name="route?.meta?.transition || 'fade'">
            <keep-alive>
              <component :is="Component" :key="route.fullPath" :style="{ transitionDelay: route?.meta?.transitionDelay || '0s' }" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </SplitterPanel>
  </Splitter>
</template>

<script lang="ts" setup>
import { Ref, computed, ref } from "vue";

import { isObjectHasKeys } from "@endeavour/vue-library/helpers";
import type { FilterOptions, SearchResponse } from "@endeavour/vue-library/models";

import { SplitterResizeEndEvent } from "primevue/splitter";
import { useRouter } from "vue-router";

import NavTree from "@/components/shared/NavTree.vue";
import { useDirectService } from "@/composables/useDirectService";
import { TreeNode } from "@/models";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useLoadingStore } from "@/stores/loadingStore";

defineProps<{
  searchTerm: string;
  updateSearch: boolean;
  selectedFilterOptions: FilterOptions;
}>();

const emit = defineEmits<{ selectedFiltersUpdated: [payload: FilterOptions] }>();

const router = useRouter();
const loadingStore = useLoadingStore();
const directoryStore = useDirectoryStore();
const directService = useDirectService();

const findInTreeIri = computed(() => directoryStore.findInTreeIri);
const findInTreeBoolean = computed(() => directoryStore.findInTreeBoolean);
const directoryLoading = computed(() => loadingStore.directoryLoading);

const history: Ref<string[]> = ref([]);
const searchResults: Ref<SearchResponse | undefined> = ref();

function updateSplitter(event: SplitterResizeEndEvent) {
  directoryStore.updateSplitterRightSize(event.sizes[1]);
}

async function routeToSelected(selected: TreeNode) {
  if (selected.key) await directService.select(selected.key);
  else if (selected.iri) await directService.select(selected.iri);
  else if (typeof selected === "string") await directService.select(selected);
}

async function navigateTo(iri: string) {
  if (iri === "home") await router.push("/directory");
  else await directService.select(iri);
}

function locateInTree(iri: string) {
  directoryStore.updateFindInTreeIri(iri);
}

function updateSearchResults(newSearchResults: SearchResponse | undefined) {
  searchResults.value = newSearchResults;
}

async function goToSearchResults() {
  await router.push({ name: "Search" });
}
</script>

<style scoped>
.p-splitter {
  height: 100%;
  width: 100%;
  border-radius: unset;
}

.splitter-right {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  overflow: auto;
}

.loading-container {
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
