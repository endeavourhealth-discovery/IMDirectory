<template>
  <side-nav />
  <div class="layout-main">
    <div id="uprn-home">
      <TabView v-model:activeIndex="active" :lazy="true">
        <TabPanel header="Single address lookup">
          <div class="uprn-panel-content" id="address-lookup-container" :style="contentHeight">
            <AddressLookup />
          </div>
        </TabPanel>
        <TabPanel header="Address file workflow">
          <div class="uprn-panel-content" id="file-workflow-container" :style="contentHeight">
            <FileWorkflow />
          </div>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SideNav from "@/components/home/SideNav.vue";
import AddressLookup from "@/components/uprn/AddressLookup.vue";
import FileWorkflow from "@/components/uprn/FileWorkflow.vue";
import { getContainerElementOptimalHeight } from "@/helpers/GetContainerElementOptimalHeight";

export default defineComponent({
  name: "Uprn",
  components: {
    SideNav,
    AddressLookup,
    FileWorkflow
  },
  data() {
    return {
      contentHeight: "",
      active: 0
    };
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
    this.setContentHeight();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    onResize(): void {
      this.setContentHeight();
    },

    setContentHeight(): void {
      const calcHeight = getContainerElementOptimalHeight("uprn-home", ["p-tabview-nav"], true, 2, 1);
      this.contentHeight = "height: " + calcHeight + "; max-height: " + calcHeight + ";";
    }
  }
});
</script>

<style scoped>
#uprn-home {
  height: 100%;
}

#address-lookup-container {
  position: relative;
}

@media screen and (max-width: 767px) {
  #file-workflow-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    grid-template-areas:
      "upload"
      "description"
      "examples"
      "refresh"
      "table";
  }
}

@media screen and (min-width: 768px) {
  #file-workflow-container {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto auto 1fr;
    grid-template-areas:
      "upload description examples"
      "refresh refresh refresh"
      "table table table";
  }
}

#file-workflow-container {
  width: 100%;
  display: grid;
  gap: 1rem 1rem;
  align-items: start;
  overflow: auto;
  background-color: #ffffff;
}

.p-tabview-panels {
  height: 100%;
}
</style>
