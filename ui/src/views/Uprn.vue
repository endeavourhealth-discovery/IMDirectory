<template>
  <div id="uprn-main-container">
    <UprnConsent />
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>UPRN</strong></span>
        </div>
      </template>
    </TopBar>
    <div id="uprn-content">
      <TabMenu :model="items" v-model:activeIndex="active" id="uprn-menu" />
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from "@/components/shared/TopBar.vue";
import { onMounted, ref } from "vue";
import UprnConsent from "@/components/uprn/UprnConsent.vue";

const items = ref([
  {
    label: "Input Single Address",
    to: "/uprn/singleAddressLookup"
  },
  {
    label: "Upload Address File",
    to: "/uprn/addressFileWorkflow"
  },
  {
    label: "Downloads + Activity",
    to: "/uprn/addressFileDownload"
  }
]);
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
#uprn-menu {
  flex: 0 0 auto;
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
