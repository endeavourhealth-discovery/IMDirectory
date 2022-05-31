<template>
  <Splitter stateKey="directoryMainSplitterHorizontal" stateStorage="local">
    <SplitterPanel :size="30" :minSize="10" style="overflow: auto;">
      <NavTree />
    </SplitterPanel>
    <SplitterPanel :size="70" :minSize="10" style="overflow: auto;">
      <div class="splitter-right">
        <router-view @openBar="visibleRight = true" @closeBar="visibleRight = false" />
        <InfoSideBar :visible="visibleRight" @closeBar="visibleRight = false" />
      </div>
    </SplitterPanel>
  </Splitter>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NavTree from "@/components/home/NavTree.vue";
import InfoSideBar from "@/components/home/InfoSideBar.vue";
import { mapState } from "vuex";

export default defineComponent({
  name: "Home",
  components: {
    NavTree,
    InfoSideBar
  },
  computed: mapState(["filterOptions", "filterDefaults"]),

  data() {
    return {
      visibleRight: true,
      selectedIri: ""
    };
  }
});
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
