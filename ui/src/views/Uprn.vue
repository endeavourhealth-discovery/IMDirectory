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
      <TabMenu :model="items" id="uprn-menu">
        <template #item="{ label, item, props }">
          <router-link v-if="item.route" v-slot="routerProps" :to="item.route" custom>
            <a :href="sanitizeUrl(routerProps.href)" v-bind="props.action" @click="$event => routerProps.navigate($event)">
              <span v-bind="props.icon" />
              <span v-bind="props.label">{{ label }}</span>
            </a>
          </router-link>
          <a v-else :href="sanitizeUrl(item.url)" :target="item.target" v-bind="props.action">
            <span v-bind="props.icon" />
            <span v-bind="props.label">{{ label }}</span>
          </a>
        </template>
      </TabMenu>
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from "@/components/shared/TopBar.vue";
import { ref } from "vue";
import UprnConsent from "@/components/uprn/UprnConsent.vue";
import { sanitizeUrl } from "@braintree/sanitize-url";

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
