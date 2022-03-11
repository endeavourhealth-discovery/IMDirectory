<template>
  <Splitter class="main-grid">
    <SplitterPanel :size="30">
      <Navigator />
    </SplitterPanel>
    <SplitterPanel :size="70">
      <div v-if="visibleRight" class="grid grid-nogutter">
        <div class="col-7">
          <router-view @updateSelected="updateSelected" @openBar="visibleRight = true" />
        </div>
        <div id="info-side-bar-wrapper" v-if="visibleRight" class="col-5">
          <InfoSideBar :selectedIri="selectedIri" @closeBar="visibleRight = false" />
        </div>
      </div>

      <div v-else>
        <router-view @updateSelected="updateSelected" @openBar="visibleRight = true" />
      </div>
    </SplitterPanel>
  </Splitter>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Navigator from "@/components/home/Navigator.vue";
import InfoSideBar from "@/components/infobar/InfoSideBar.vue";

export default defineComponent({
  name: "Home",
  components: {
    Navigator,
    InfoSideBar
  },
  data() {
    return {
      visibleRight: false,
      selectedIri: ""
    };
  },
  methods: {
    updateSelected(iri: string) {
      this.selectedIri = iri;
    }
  }
});
</script>

<style scoped>
.main-grid {
  height: 100%;
  width: 100%;
}

#info-side-bar-wrapper {
  overflow-x: none;
  transition: 0.5s;
}
</style>
