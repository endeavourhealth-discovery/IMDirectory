<template>
  <div class="sidebar">
    <SearchBar
      :search-results="searchResults"
      @update:search-loading="updateSearchLoading"
      :search-loading="searchLoading"
      @update:search-results="updateSearchResults"
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
        />
      </TabPanel>
      <TabPanel header="JSON viewer">
        <VueJsonPretty class="json" :path="'res'" :data="editorEntity" @click="handleClick" />
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref, Ref } from "vue";
import VueJsonPretty from "vue-json-pretty";
import NavTree from "@/components/shared/NavTree.vue";
import SearchBar from "@/components/shared/SearchBar.vue";
import SearchResults from "@/components/shared/SearchResults.vue";
import { ConceptSummary } from "@im-library/interfaces";

interface Props {
  editorEntity: any;
}

const props = defineProps<Props>();

const searchResults: Ref<any[]> = ref([]);
const searchLoading = ref(false);
const activeIndex = ref(0);
const selectedResult: Ref<ConceptSummary | undefined> = ref();
const findInTreeIri = ref("");

function openSearchPanel() {
  activeIndex.value = 1;
}

function openTreePanel() {
  activeIndex.value = 0;
}

function updateSearchLoading(data: boolean) {
  searchLoading.value = data;
}

function updateSearchResults(data: any[]) {
  searchResults.value = data;
  openSearchPanel();
}

function handleSearchResultSelected(data: ConceptSummary) {
  selectedResult.value = data;
  findInTreeIri.value = data.iri;
  openTreePanel();
}

function locateInTree(event: any, iri: string) {
  findInTreeIri.value = iri;
  if (activeIndex.value !== 0) openTreePanel();
}

function handleClick(data: any) {
  console.log("click");
  console.log(data);
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
