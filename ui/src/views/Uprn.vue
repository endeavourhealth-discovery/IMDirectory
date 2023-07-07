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
      <TabMenu :model="items" />
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from "@/components/shared/TopBar.vue";
import { onMounted, ref } from "vue";
import { useUprnStore } from "@/stores/uprnStore";
import { useRouter } from "vue-router";
import UprnService from "@/services/UprnService";

const uprnStore = useUprnStore();
const router = useRouter();

const items = ref([
  {
    label: "Single address lookup",
    to: "/uprn/singleAddressLookup"
  },
  {
    label: "Address file workflow",
    to: "/uprn/addressFileWorkflow"
  }
]);

onMounted(() => {
  router.push({ name: "SingleAddressLookup" });
});
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
