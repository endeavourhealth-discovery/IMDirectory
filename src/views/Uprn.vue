<template>
  <div id="uprn-main-container">
    <UprnConsent />
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>ASSIGN-UPRN</strong></span>
        </div>
      </template>
    </TopBar>
    <div id="uprn-content">
      <Tabs value="0" id="uprn-menu">
        <TabList>
          <Tab :value="index.toString()" v-for="(item, index) in items" v-bind:key="index" @click="navigate(item.route)">
            <span>{{ item.label }}</span>
          </Tab>
        </TabList>
      </Tabs>
      <div v-if="uprnLoading" class="loading-container flex flex-row items-center justify-center">
        <ProgressSpinner />
      </div>
      <router-view v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import { useRouter } from "vue-router";

import TopBar from "@/components/shared/TopBar.vue";
import UprnConsent from "@/components/uprn/UprnConsent.vue";
import { useLoadingStore } from "@/stores/loadingStore";

const router = useRouter();
const loadingStore = useLoadingStore();
const uprnLoading = computed(() => loadingStore.uprnLoading);

const items = ref([
  {
    label: "Input Single Address",
    route: "/uprn/singleAddressLookup"
  },
  {
    label: "Upload Address File",
    route: "/uprn/addressFileWorkflow"
  },
  {
    label: "Downloads + Activity",
    route: "/uprn/addressFileDownload"
  }
]);

function navigate(route: string) {
  router.push(route);
}
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
  background-color: var(--p-content-background);
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
