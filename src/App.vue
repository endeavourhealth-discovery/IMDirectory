<template>
  <div class="layout-wrapper layout-static">
    <Toast />
    <ConfirmDialog />
    <ReleaseNotes v-if="!loading" :appVersion="appVersion" repositoryName="IMDirectory" />
    <div id="main-container">
      <TopBar>
        <template #content>
          <div id="topbar-content-container">
            <Search />
            <Button class="ecl-search-button" label="Ecl Search" @click="toEclSearch" />
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
        <router-view v-else />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Search from "@/components/topbar/Search.vue";
import TopBar from "@/im_library/components/modules/TopBar.vue";
import ReleaseNotes from "./im_library/components/modules/ReleaseNotes.vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { DataTypeCheckers } from "@/im_library/helpers";
import { Env, FilerService } from "@/im_library/services";
import { Auth } from "aws-amplify";
import axios from "axios";
const { isObjectHasKeys } = DataTypeCheckers;

setupAxiosInterceptors(axios);
setupExternalErrorHandler();

const route = useRoute();
const router = useRouter();
const toast = useToast();
const store = useStore();
const currentUser = computed(() => store.state.currentUser);
const isLoggedIn = computed(() => store.state.isLoggedIn);

const appVersion = __APP_VERSION__;

const loading = ref(true);

const adminMenu = ref();

onMounted(async () => {
  loading.value = true;
  await store.dispatch("authenticateCurrentUser");
  await store.dispatch("fetchFilterSettings");
  await store.dispatch("initFavourites");
  loading.value = false;
});

function toEclSearch() {
  router.push({ name: "EclSearch" });
}

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

async function setupAxiosInterceptors(axios: any) {
  axios.interceptors.request.use(async (request: any) => {
    if (store.state.isLoggedIn && Env.API && request.url?.startsWith(Env.API)) {
      if (!request.headers) request.headers = {};
      request.headers.Authorization = "Bearer " + (await Auth.currentSession()).getIdToken().getJwtToken();
    }
    return request;
  });

  axios.interceptors.response.use(
    (response: any) => {
      return isObjectHasKeys(response, ["data"]) ? response.data : undefined;
    },
    (error: any) => {
      if (error.response.status === 403) {
        toast.add({
          severity: "error",
          summary: "Access denied",
          detail: "Login required for " + error.config.url.substring(error.config.url.lastIndexOf("/") + 1) + "."
        });
        window.location.href = Env.AUTH_URL + "login?returnUrl=" + route.fullPath;
      } else if (error.response.status === 401) {
        toast.add({
          severity: "error",
          summary: "Access denied",
          detail:
            "Insufficient clearance to access " +
            error.config.url.substring(error.config.url.lastIndexOf("/") + 1) +
            ". Please contact an admin to change your account security clearance if you require access to this resource."
        });
        router.push({ name: "AccessDenied" }).then();
      } else {
        return Promise.reject(error);
      }
    }
  );
}

function setupExternalErrorHandler() {
  window.addEventListener("unhandledrejection", e => {
    e.preventDefault();
    console.error(e);
    if (e.reason?.response?.data?.title)
      toast.add({
        severity: "error",
        summary: e.reason.response.data.title,
        detail: e.reason.response.data.detail
      });
    else if (e.reason?.name)
      toast.add({
        severity: "error",
        summary: e.reason.name,
        detail: e.reason.message
      });
    else
      toast.add({
        severity: "error",
        summary: "An error occurred",
        detail: e.reason
      });
  });
}
</script>

<style>
#main-container {
  width: 100vw;
  height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  overflow: auto;
}

#topbar-content-container {
  height: 100%;
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
  align-items: center;
}

.ecl-search-button {
  height: fit-content;
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

.p-toast-message-text {
  width: calc(100% - 4rem);
}

.p-toast-message-content {
  width: 100%;
}

.p-toast-detail {
  width: 100%;
  word-wrap: break-word;
}
</style>
