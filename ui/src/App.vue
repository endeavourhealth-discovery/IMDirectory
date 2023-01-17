<template>
  <div class="layout-wrapper layout-static">
    <Toast />
    <ConfirmDialog />
    <ReleaseNotes v-if="!loading && showReleaseNotes" repositoryName="IMDirectory" />
    <div id="main-container">
      <div v-if="loading" class="flex flex-row justify-content-center align-items-center loading-container">
        <ProgressSpinner />
      </div>
      <router-view v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, ComputedRef, watch } from "vue";
import ReleaseNotes from "@/components/shared/ReleaseNotes.vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Env } from "@/services";
import { Auth } from "aws-amplify";
import axios from "axios";
import semver from "semver";

setupAxiosInterceptors(axios);
setupExternalErrorHandler();

const route = useRoute();
const router = useRouter();
const toast = useToast();
const store = useStore();

const showReleaseNotes: ComputedRef<boolean> = computed(() => store.state.showReleaseNotes);

const appVersion = __APP_VERSION__;

const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  await store.dispatch("authenticateCurrentUser");
  setShowReleaseNotes();
  loading.value = false;
});

function setShowReleaseNotes() {
  const lastVersion = getLocalVersion("IMDirectory");
  if (!lastVersion || !semver.valid(lastVersion) || semver.lt(lastVersion, appVersion)) {
    store.commit("updateShowReleaseNotes", true);
  } else if (semver.valid(lastVersion) && semver.gt(lastVersion, appVersion)) {
    setLocalVersion("IMDirectory", appVersion);
    store.commit("updateShowReleaseNotes", true);
  } else store.commit("updateShowReleaseNotes", false);
}

function getLocalVersion(repoName: string): string | null {
  return localStorage.getItem(repoName + "Version");
}

function setLocalVersion(repoName: string, versionNo: string) {
  localStorage.setItem(repoName + "Version", versionNo);
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

<style scoped>
#main-container {
  width: 100vw;
  height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  overflow: auto;
}
.loading-container {
  width: 100%;
  height: 100%;
}
</style>

<style>
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

.p-menu-overlay {
  z-index: 1000;
}

.p-overlaypanel {
  z-index: 1000;
}

.p-datatable-thead {
  z-index: 0 !important;
}
</style>
