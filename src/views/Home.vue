<template>
  <Splitter stateKey="directoryMainSplitterHorizontal" stateStorage="local" @resizeend="setSplitterContainerHoriz">
    <SplitterPanel :size="30" :minSize="10" style="overflow: auto;">
      <NavTree />
    </SplitterPanel>
    <SplitterPanel :size="70" :minSize="10" style="overflow: auto;">
      <div class="splitter-right" v-if="visibleRight" :style="splitterContentWidth">
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
  mounted() {
    this.setSplitterContainerHoriz({ sizes: localStorage.getItem("directoryMainSplitterHorizontal") });
  },
  data() {
    return {
      visibleRight: false,
      selectedIri: "",
      splitterContentWidth: ""
    };
  },
  methods: {
    setSplitterContainerHoriz(event: any) {
      let leftWidth;
      if (isArrayHasLength(event.sizes) && event.sizes[0] > 0) {
        leftWidth = event.sizes[0];
      } else if (typeof event.sizes === "string") {
        const parsed = JSON.parse(event.sizes);
        if (isArrayHasLength(parsed) && parsed[0] > 0) {
          leftWidth = parsed[0];
        } else {
          leftWidth = 30;
        }
      } else {
        leftWidth = 30;
      }
      const calcWidth = 100 - leftWidth;
      this.splitterContentWidth = "width: calc(" + calcWidth + "vw - 0.5rem);" + "max-width: calc(" + calcWidth + "vw - 0.5rem);";
    }
  }
});
</script>

<style scoped>
.p-splitter {
  height: 100%;
  width: 100%;
}

#info-side-bar-wrapper {
  overflow-x: none;
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
