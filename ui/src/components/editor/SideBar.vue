<template>
  <div class="sidebar">
    <SearchBar
      :search-results="searchResults"
      @update:search-loading="updateSearchLoading"
      :search-loading="searchLoading"
      @update:search-results="updateSearchResults"
      v-model:loadMore="loadMore"
    />
    <TabView :lazy="true" v-model:activeIndex="activeIndex">
      <TabPanel header="NavTree">
        <NavTree :selected-iri="findInTreeIri" :allow-drag-and-drop="true" />
      </TabPanel>
      <TabPanel header="Search results">
        <SearchResults
          :search-loading="searchLoading"
          :search-results="searchResults"
          @selected-updated="handleSearchResultSelected"
          @open-tree-panel="openTreePanel"
          :locateInTreeFunction="locateInTree"
          @lazy-load-requested="lazyLoadRequested"
          :lazy-loading="true"
          :rows="100"
        />
      </TabPanel>
      <TabPanel header="JSON viewer">
        <VueJsonPretty class="json" :path="'res'" :data="editorEntityDisplay" />
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref, watch } from "vue";
import VueJsonPretty from "vue-json-pretty";
import NavTree from "@/components/shared/NavTree.vue";
import SearchBar from "@/components/shared/SearchBar.vue";
import SearchResults from "@/components/shared/SearchResults.vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { IM } from "@im-library/vocabulary";
import { cloneDeep } from "lodash";
import { SearchResponse, SearchResultSummary } from "@im-library/interfaces/AutoGen";

interface Props {
  editorEntity: any;
}

const props = defineProps<Props>();

const searchResults: Ref<SearchResponse | undefined> = ref();
const searchLoading = ref(false);
const activeIndex = ref(0);
const selectedResult: Ref<SearchResultSummary | undefined> = ref();
const findInTreeIri = ref("");
const editorEntityDisplay = ref();
const loadMore: Ref<{ page: number; rows: number } | undefined> = ref();

watch(
  () => cloneDeep(props.editorEntity),
  () => setEditorEntityDisplay()
);

onMounted(() => {
  setEditorEntityDisplay();
});

function setEditorEntityDisplay() {
  editorEntityDisplay.value = { ...props.editorEntity };
  if (isObjectHasKeys(editorEntityDisplay.value, [IM.DEFINITION]) && typeof editorEntityDisplay.value[IM.DEFINITION] === "string") {
    editorEntityDisplay.value[IM.DEFINITION] = JSON.parse(editorEntityDisplay.value[IM.DEFINITION]);
  }
}

function openSearchPanel() {
  activeIndex.value = 1;
}

function openTreePanel() {
  activeIndex.value = 0;
}

function updateSearchLoading(data: boolean) {
  searchLoading.value = data;
}

function updateSearchResults(data: SearchResponse) {
  searchResults.value = data;
  openSearchPanel();
}

function handleSearchResultSelected(data: SearchResultSummary) {
  selectedResult.value = data;
  findInTreeIri.value = data.iri;
  openTreePanel();
}

function locateInTree(event: any, iri: string) {
  findInTreeIri.value = iri;
  if (activeIndex.value !== 0) openTreePanel();
}

function lazyLoadRequested(event: any) {
  loadMore.value = event;
}
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-flow: column nowrap;
  overflow-y: hidden;
  padding-top: 0.75rem;
  gap: 0.5rem;
}

.p-tabview {
  height: 97%;
  display: flex;
  flex-flow: column nowrap;
}

.p-tabview:deep(.p-tabview-panels) {
  flex: 1 1 auto;
  overflow: auto;
}

.json:deep(.vjs-value__string) {
  word-break: break-all;
}

.json:deep(.vjs-value) {
  font-size: 1rem;
}

.json:deep(.vjs-key) {
  font-size: 1rem;
}

.json {
  flex: 0 1 auto;
  width: 100%;
  overflow: auto;
  border: 1px var(--surface-border) solid;
  border-radius: 3px;
}
</style>
