<template>
  <Splitter stateKey="directoryMainSplitterHorizontal" stateStorage="local" @resizeend="updateSplitter">
    <SplitterPanel :size="30" :minSize="10" style="overflow: auto" data-testid="splitter-left">
      <NavTree />
    </SplitterPanel>
    <SplitterPanel :size="70" :minSize="10" style="overflow: auto" data-testid="splitter-right">
      <div class="splitter-right">
        <router-view @selectedUpdated="routeToSelected" :searchResults="searchResults" />
      </div>
    </SplitterPanel>
  </Splitter>
</template>

<script setup lang="ts">
import NavTree from "@/components/directory/NavTree.vue";
import { useDirectoryStore } from "@/stores/directoryStore";
import { ConceptSummary } from "@im-library/interfaces";
import { DirectService } from "@/services";
import { computed } from "vue";

const directoryStore = useDirectoryStore();
const directService = new DirectService();

const searchResults = computed(() => directoryStore.searchResults);

function updateSplitter(event: any) {
  directoryStore.updateSplitterRightSize(event.sizes[1]);
}

function routeToSelected(selected: ConceptSummary) {
  directService.select(selected.iri, "Folder");
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
