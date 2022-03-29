<template>
  <div id="side-bar">
    <NavTree />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";
import NavTree from "@/components/home/NavTree.vue";

export default defineComponent({
  name: "Navigator",
  components: {
    NavTree
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
  display: flex;
  flex-flow: column nowrap;
}
</style>
