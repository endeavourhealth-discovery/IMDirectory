<template>
  <Splitter class="main-grid">
    <SplitterPanel :size="30">
      <Navigator />
    </SplitterPanel>
    <SplitterPanel :size="70">
      <div class="grid grid-nogutter">
        <div v-if="visibleRight" class="col-7">
          <router-view @updateSelected="updateSelected" @openBar="visibleRight = true" />
        </div>
        <div v-if="!visibleRight" class="col-12">
          <router-view @updateSelected="updateSelected" @openBar="visibleRight = true" />
        </div>
        <div id="info-side-bar-wrapper" v-if="visibleRight" class="col-5">
          <InfoSideBar :selectedIri="selectedIri" @closeBar="visibleRight = false" />
        </div>
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
.header-grow {
  flex-grow: 1;
}
.user-menu {
  height: 100%;
  margin-left: 5px;
  width: 12.5rem;
}
.p-menubar {
  height: 100%;
}

#info-side-bar-wrapper {
  overflow-x: none;
  transition: 0.5s;
}
</style>
