<template>
  <div id="uprn-main-container">
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>UPRN</strong></span>
        </div>
      </template>
    </TopBar>
    <div id="uprn-content">
      <TabView v-model:activeIndex="active" :lazy="true">
        <TabPanel header="Single address lookup">
          <div class="uprn-panel-content">
            <AddressLookup />
          </div>
        </TabPanel>
        <TabPanel header="Address file workflow">
          <div class="uprn-panel-content">
            <FileWorkflow />
          </div>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from "@/components/shared/TopBar.vue";
import AddressLookup from "@/components/uprn/AddressLookup.vue";
import FileWorkflow from "@/components/uprn/FileWorkflow.vue";
import { ref } from "vue";
import { useUprnStore } from "@/stores/uprnStore";

const uprnStore = useUprnStore();

const active = ref(0);
</script>

<style scoped>
#uprn-main-container {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}
#uprn-content {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  background-color: var(--surface-a);
}
.topbar-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}
.title {
  font-size: 2rem;
}
</style>
