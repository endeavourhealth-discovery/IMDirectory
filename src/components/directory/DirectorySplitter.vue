<template>
  <Splitter stateKey="directoryMainSplitterHorizontal" stateStorage="local" @resizeend="updateSplitter">
    <SplitterPanel :size="30" :minSize="10" style="overflow: auto" data-testid="splitter-left">
      <NavTree
        :allow-right-click="true"
        :selected-iri="findInTreeIri"
        :find-in-tree="findInTreeBoolean"
        @row-selected="routeToSelected"
        @found-in-tree="directoryStore.updateFindInTreeBoolean(false)"
      />
    </SplitterPanel>
    <SplitterPanel :size="70" :minSize="10" style="overflow: auto" data-testid="splitter-right">
      <div class="splitter-right">
        <div v-if="directoryLoading" class="loading-container flex flex-row items-center justify-center">
          <ProgressSpinner />
        </div>
        <router-view
          v-else
          v-slot="{ Component, route }"
          v-model:history="history"
          :searchTerm="searchTerm"
          :updateSearch="updateSearch"
          :selected-filter-options="selectedFilterOptions"
          :rows="50"
          :searchResults="searchResults"
          @selectedUpdated="routeToSelected"
          @navigateTo="navigateTo"
          @locateInTree="locateInTree"
          @selected-filters-updated="emit('selectedFiltersUpdated', $event)"
          @searchResultsUpdated="updateSearchResults"
          @goToSearchResults="goToSearchResults"
        >
          <transition :name="route?.meta?.transition || 'fade'" :mode="route?.meta?.mode || 'in-out'">
            <keep-alive>
              <component :key="route.fullPath" :style="{ transitionDelay: route?.meta?.transitionDelay || '0s' }" :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </SplitterPanel>
  </Splitter>
</template>

<script setup lang="ts">
import NavTree from "@/components/shared/NavTree.vue";
import { useDirectoryStore } from "@/stores/directoryStore";
import { DirectService } from "@/services";
import { Ref, computed, ref } from "vue";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { useRouter } from "vue-router";
import { useLoadingStore } from "@/stores/loadingStore";
import { FilterOptions } from "@/interfaces";
import { SearchResponse } from "@/interfaces/AutoGen";

interface Props {
  searchTerm: string;
  updateSearch: boolean;
  selectedFilterOptions: FilterOptions;
}

const props = defineProps<Props>();

const emit = defineEmits<{ selectedFiltersUpdated: [payload: FilterOptions] }>();

const router = useRouter();
const loadingStore = useLoadingStore();
const directoryStore = useDirectoryStore();
const directService = new DirectService();

const findInTreeIri = computed(() => directoryStore.findInTreeIri);
const findInTreeBoolean = computed(() => directoryStore.findInTreeBoolean);
const directoryLoading = computed(() => loadingStore.directoryLoading);

const history: Ref<string[]> = ref([]);
const searchResults: Ref<SearchResponse | undefined> = ref();

function updateSplitter(event: any) {
  directoryStore.updateSplitterRightSize(event.sizes[1]);
}

function routeToSelected(selected: any) {
  if (isObjectHasKeys(selected, ["key"])) directService.select(selected.key);
  else if (isObjectHasKeys(selected, ["iri"])) directService.select(selected.iri);
  else if (typeof selected === "string") directService.select(selected);
}

function navigateTo(iri: any) {
  if (iri.item?.icon.includes("fa-house")) {
    router.push("/");
  } else {
    directService.select(iri);
  }
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
