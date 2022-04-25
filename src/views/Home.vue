<template>
  <Splitter stateKey="directoryMainSplitterHorizontal" stateStorage="local">
    <SplitterPanel :size="30" :minSize="10" style="overflow: auto;">
      <NavTree />
    </SplitterPanel>
    <SplitterPanel :size="70" :minSize="10" style="overflow: auto;">
      <div class="splitter-right" v-if="visibleRight">
        <router-view @openBar="visibleRight = true" />
        <div id="info-side-bar-wrapper" v-if="visibleRight">
          <InfoSideBar @closeBar="visibleRight = false" />
        </div>
      </div>

      <div class="splitter-right" v-else>
        <router-view @openBar="visibleRight = true" @closeBar="visibleRight = false" />
      </div>
    </SplitterPanel>
  </Splitter>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NavTree from "@/components/home/NavTree.vue";
import InfoSideBar from "@/components/home/InfoSideBar.vue";
import { Helpers } from "im-library";
import { mapState } from "vuex";
const {
  DataTypeCheckers: { isArrayHasLength }
} = Helpers;

export default defineComponent({
  name: "Home",
  components: {
    NavTree,
    InfoSideBar
  },
  computed: mapState(["filterOptions", "filterDefaults"]),

  data() {
    return {
      visibleRight: false,
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

#info-side-bar-wrapper {
  transition: 0.5s;
  width: 40%;
}

.splitter-right {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  overflow: auto;
}
</style>
