<template>
  <Splitter stateKey="directoryMainSplitterHorizontal" stateStorage="local" @resizeend="updateSplitter">
    <SplitterPanel :size="30" :minSize="10" style="overflow: auto" data-testid="splitter-left">
      <NavTree />
    </SplitterPanel>
    <SplitterPanel :size="70" :minSize="10" style="overflow: auto" data-testid="splitter-right">
      <div class="splitter-right">
        <router-view />
      </div>
    </SplitterPanel>
  </Splitter>
</template>

<script setup lang="ts">
import NavTree from "@/components/directory/NavTree.vue";
import { useRootStore } from "@/stores/rootStore";
const rootStore = useRootStore();

function updateSplitter(event: any) {
  rootStore.updateSplitterRightSize(event.sizes[1]);
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
