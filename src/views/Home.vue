<template>
  <Splitter stateKey="directoryMainSplitterHorizontal" stateStorage="local">
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
import { ref } from "vue";
import NavTree from "@/components/home/NavTree.vue";
const visibleRight = ref(true);</script>

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
