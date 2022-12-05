<template>
  <div id="directory-main-container">
    <TopBar>
      <template #content>
        <div id="topbar-content-container">
          <Search />
          <Button
            v-if="isLoggedIn && currentUser && currentUser.roles.includes('IMAdmin')"
            icon="pi pi-cog"
            class="p-button-rounded p-button-text p-button-plain p-button-lg p-button-icon-only topbar-end-button ml-auto"
            @click="openAdminMenu"
          />
          <Menu ref="adminMenu" :model="getAdminItems()" :popup="true" />
        </div>
      </template>
    </TopBar>
    <div id="app-content-container">
      <div v-if="loading" class="flex flex-row justify-content-center align-items-center loading-container">
        <ProgressSpinner />
      </div>
      <DirectorySplitter v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import TopBar from "im-library/components/modules/TopBar.vue";
import Search from "@/components/directory/topbar/Search.vue";
import DirectorySplitter from "@/components/directory/DirectorySplitter.vue";
import { useRoute, useRouter } from "vue-router";
import { Env, FilerService } from "@/services";
import { useToast } from "primevue/usetoast";
import { useStore } from "vuex";

const router = useRouter();
const toast = useToast();
const store = useStore();

const currentUser = computed(() => store.state.currentUser);
const isLoggedIn = computed(() => store.state.isLoggedIn);

const adminMenu = ref();
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  await store.dispatch("fetchFilterSettings");
  await store.dispatch("initFavourites");
  loading.value = false;
});

function openAdminMenu(event: any): void {
  adminMenu.value.toggle(event);
}

function getAdminItems(): any[] {
  return [
    {
      label: "Download changes",
      icon: "fa-solid fa-fw fa-cloud-arrow-down",
      command: () => downloadChanges()
    }
  ];
}

async function downloadChanges() {
  toast.add({ severity: "info", summary: "Preparing download", detail: "Zipping delta files for download...", life: 3000 });
  let blob = await FilerService.downloadDeltas();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "deltas.zip";
  link.click();
}
</script>

<style scoped>
#directory-main-container {
  height: 100%;
  width: 100%;
}

#topbar-content-container {
  height: 100%;
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
  align-items: center;
}

body {
  overflow: hidden;
}

.loading-container {
  width: 100%;
  height: 100%;
}

#app-content-container {
  height: calc(100% - 3.5rem);
}

#topbar-container {
  height: 4rem;
  width: 100vw;
}
</style>
