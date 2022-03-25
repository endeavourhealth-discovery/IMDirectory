<template>
  <div id="side-bar">
    <NavTree />
    <FavTree />
  </div>
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
  /* overflow: auto; */
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
}
</style>
