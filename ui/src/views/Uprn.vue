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
          <Tab :value="index.toString()" v-for="(item, index) in items">
            <router-link v-slot="routerProps" :to="item.route" custom>
              <a :href="sanitizeUrl(routerProps.href)" @click="$event => routerProps.navigate($event)">
                <span>{{ item.label }}</span>
              </a>
            </router-link>
          </Tab>
        </TabList>
      </Tabs>
      <div v-if="uprnLoading" class="flex flex-row justify-center items-center loading-container">
        <ProgressSpinner />
      </div>
      <router-view v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from "@/components/shared/TopBar.vue";
import { computed, ref } from "vue";
import UprnConsent from "@/components/uprn/UprnConsent.vue";
import { sanitizeUrl } from "@braintree/sanitize-url";
import { useLoadingStore } from "@/stores/loadingStore";

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
