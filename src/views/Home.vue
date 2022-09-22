<template>
  <Splitter stateKey="directoryMainSplitterHorizontal" stateStorage="local">
    <SplitterPanel :size="30" :minSize="10" style="overflow: auto">
      <NavTree />
    </SplitterPanel>
    <SplitterPanel :size="70" :minSize="10" style="overflow: auto">
      <div class="splitter-right">
        <router-view @openBar="visibleRight = true" @closeBar="visibleRight = false" />
        <InfoSideBar :visible="visibleRight" @closeBar="visibleRight = false" />
      </div>
    </SplitterPanel>
  </Splitter>
</template>

<script setup lang="ts">
import { defineComponent, ref } from "vue";
import NavTree from "@/components/home/NavTree.vue";
import InfoSideBar from "@/components/home/InfoSideBar.vue";
import { mapState } from "vuex";

let visibleRight = ref(true);
let selectedIri = ref("");
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
