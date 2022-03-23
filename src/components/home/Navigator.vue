<template>
  <Splitter id="side-bar" layout="vertical" stateKey="directoryMainSplitterVertical" stateStorage="local">
    <SplitterPanel :size="50" style="overflow: auto;">
      <NavTree />
    </SplitterPanel>
    <SplitterPanel :size="50" style="overflow: auto;">
      <FavTree />
    </SplitterPanel>
  </Splitter>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";
import NavTree from "@/components/home/NavTree.vue";
import FavTree from "@/components/home/FavTree.vue";

export default defineComponent({
  name: "Navigator",
  components: {
    NavTree,
    FavTree
  },
  methods: {
    tabChange(event: any): void {
      this.$store.commit("updateSidebarControlActivePanel", event.index);
    }
  }
});
</script>

<style scoped>
#side-bar {
  height: 100%;
  overflow: auto;
}
</style>
