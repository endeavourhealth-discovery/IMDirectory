<template>
  <div class="sidebar">
    <SearchBar @open-search-panel="openSearchPanel" @search-loading="updateSearchLoading" @search-results="updateSearchResults" />
    <TabView :lazy="true" v-model:activeIndex="activeIndex">
      <TabPanel header="NavTree">
        <NavTree />
      </TabPanel>
      <TabPanel header="Search results">
        <SearchResults :search-loading="searchLoading" :search-results="searchResults" @open-tree-panel="openTreePanel" />
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
import NavTree from "./sidebar/NavTree.vue";
import SearchBar from "./sidebar/SearchBar.vue";
import SearchResults from "./sidebar/SearchResults.vue";

const props = defineProps({
  editorEntity: { type: Object as PropType<any>, required: true }
});

const searchResults: Ref<any[]> = ref([]);
const searchLoading = ref(false);
const activeIndex = ref(0);

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
