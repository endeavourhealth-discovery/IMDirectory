<template>
  <Splitter stateKey="directoryMainSplitterHorizontal" stateStorage="local" @resizeend="updateSplitter">
    <SplitterPanel :size="30" :minSize="10" style="overflow: auto" data-testid="splitter-left">
      <NavTree :allow-right-click="true" :selected-iri="findInTreeIri" @row-selected="routeToSelected" />
    </SplitterPanel>
    <SplitterPanel :size="70" :minSize="10" style="overflow: auto" data-testid="splitter-right">
      <div class="splitter-right">
        <router-view
          @selectedUpdated="routeToSelected"
          :searchResults="searchResults"
          :searchLoading="searchLoading"
          @navigateTo="navigateTo"
          @locateInTree="locateInTree"
          v-model:history="history"
        />
      </div>
    </SplitterPanel>
  </Splitter>
</template>

<script setup lang="ts">
import NavTree from "@/components/shared/NavTree.vue";
import { useDirectoryStore } from "@/stores/directoryStore";
import { TreeNode } from "@im-library/interfaces";
import { DirectService } from "@/services";
import { Ref, computed, ref } from "vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

const directoryStore = useDirectoryStore();
const directService = new DirectService();

const searchResults = computed(() => directoryStore.searchResults);
const searchLoading = computed(() => directoryStore.searchLoading);
const findInTreeIri = computed(() => directoryStore.findInTreeIri);

const history: Ref<string[]> = ref([]);

function updateSplitter(event: any) {
  directoryStore.updateSplitterRightSize(event.sizes[1]);
}

function routeToSelected(selected: TreeNode) {
  if (isObjectHasKeys(selected, ["key"])) directService.select(selected.key, "Folder");
  else if (isObjectHasKeys(selected, ["iri"])) directService.select(selected.iri, "Folder");
}

function navigateTo(iri: string) {
  directService.select(iri, "Folder");
}

function locateInTree(iri: string) {
  directoryStore.updateFindInTreeIri(iri);
}
</script>

<style scoped>
.p-splitter {
  height: 100%;
  width: 100%;
}

.splitter-right {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  overflow: auto;
}
</style>
