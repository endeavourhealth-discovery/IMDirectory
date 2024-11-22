<template>
  <div id="admin-toolbox" class="flex h-full w-full flex-col overflow-auto">
    <TopBar>
      <template #content>
        <div class="flex h-full w-full flex-row flex-nowrap items-center">
          <span class="title"><strong>Admin toolbox</strong></span>
        </div>
      </template>
    </TopBar>
    <div id="toolbox-container" class="flex flex-1 flex-row overflow-auto">
      <Menu :model="adminMenu" class="rounded-none border-b-0 border-t-0" />
      <div v-if="adminToolboxLoading" class="flex flex-1 flex-row items-center justify-center"><ProgressSpinner /></div>
      <router-view v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from "@/components/shared/TopBar.vue";
import { computed, Ref, ref } from "vue";
import type { MenuItem } from "primevue/menuitem";
import { useRouter } from "vue-router";
import { useLoadingStore } from "@/stores/loadingStore";

const router = useRouter();
const loadingStore = useLoadingStore();
const adminToolboxLoading = computed(() => loadingStore.adminToolboxLoading);

const adminMenu: Ref<MenuItem[]> = ref([
  { label: "Github", items: [{ label: "Update config", icon: "fa-brands fa-github", command: async () => await router.push({ name: "UpdateConfig" }) }] },
  {
    label: "Cognito",
    items: [
      {
        label: "List users",
        icon: "fa-duotone fa-users",
        command: async () => await router.push({ name: "CognitoListUsers" })
      },
      {
        label: "List groups",
        icon: "fa-duotone fa-people-group",
        command: async () => await router.push({ name: "CognitoListGroups" })
      },
      {
        label: "Create user",
        icon: "fa-duotone fa-user-plus",
        command: async () => await router.push({ name: "CognitoCreateUser" })
      }
    ]
  }
]);
</script>

<style scoped></style>
