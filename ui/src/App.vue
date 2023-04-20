<template>
  <div class="layout-wrapper layout-static">
    <Toast />
    <ConfirmDialog />
    <DynamicDialog class="dynamic-dialog" />
    <ReleaseNotes v-if="!loading && showReleaseNotes" />
    <CookiesConsent />
    <div id="main-container">
      <BannerBar v-if="!loading && showBanner" :latestRelease="latestRelease" />
      <div v-if="loading" class="flex flex-row justify-content-center align-items-center loading-container">
        <ProgressSpinner />
      </div>
      <router-view v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, ComputedRef, Ref } from "vue";
import ReleaseNotes from "@/components/shared/ReleaseNotes.vue";
import CookiesConsent from "./components/shared/CookiesConsent.vue";
import BannerBar from "./components/shared/BannerBar.vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Env, GithubService } from "@/services";
import { Auth } from "aws-amplify";
import axios from "axios";
import semver from "semver";
import { usePrimeVue } from "primevue/config";
import { GithubRelease } from "./interfaces";

setupAxiosInterceptors(axios);
setupExternalErrorHandler();

const PrimeVue: any = usePrimeVue();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const store = useStore();

const currentTheme = computed(() => store.state.currentTheme);
const showReleaseNotes: ComputedRef<boolean> = computed(() => store.state.showReleaseNotes);
const showBanner: ComputedRef<boolean> = computed(() => store.state.showBanner);

const latestRelease: Ref<GithubRelease | undefined> = ref();
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  await store.dispatch("authenticateCurrentUser");
  if (currentTheme.value) {
    if (currentTheme.value !== "saga-blue") changeTheme(currentTheme.value);
  } else store.commit("updateCurrentTheme", "saga-blue");
  await setShowBanner();
  loading.value = false;
});

function changeTheme(newTheme: string) {
  PrimeVue.changeTheme("saga-blue", newTheme, "theme-link", () => {});
  store.commit("updateCurrentTheme", newTheme);
}

async function setShowBanner() {
  const lastVersion = getLocalVersion("IMDirectory");
  latestRelease.value = await GithubService.getLatestRelease("IMDirectory");
  let currentVersion = "v0.0.0";
  if (latestRelease.value && latestRelease.value.version) currentVersion = latestRelease.value.version;
  if (!lastVersion || !semver.valid(lastVersion) || semver.lt(lastVersion, currentVersion)) {
    store.commit("updateShowBanner", true);
  } else if (semver.valid(lastVersion) && semver.gt(lastVersion, currentVersion)) {
    localStorage.removeItem("IMDirectoryVersion");
    store.commit("updateShowBanner", true);
  } else store.commit("updateShowBanner", false);
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
      if (error?.response?.config?.raw) return Promise.reject(error);
      if (error?.response?.status === 403) {
        if (error.response.data) {
          toast.add({
            severity: "error",
            summary: "Access denied",
            detail: error.response.data.debugMessage
          });
        } else if (error.config.url) {
          toast.add({
            severity: "error",
            summary: "Access denied",
            detail: "Login required for " + error.config.url.substring(error.config.url.lastIndexOf("/") + 1) + "."
          });
        } else {
          toast.add({
            severity: "error",
            summary: "Access denied"
          });
        }
        window.location.href = Env.AUTH_URL + "login?returnUrl=" + route.fullPath;
      } else if (error?.response?.status === 401) {
        toast.add({
          severity: "error",
          summary: "Access denied",
          detail:
            "Insufficient clearance to access " +
            error.config.url.substring(error.config.url.lastIndexOf("/") + 1) +
            ". Please contact an admin to change your account security clearance if you require access to this resource."
        });
        router.push({ name: "AccessDenied" }).then();
      } else if (error?.response?.status === 500 && error.code === "ERR_BAD_RESPONSE") {
        router.push({ name: "ServerOffline" }).then();
      } else if (error.code === "ERR_CANCELED") {
        return;
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

<style lang="scss">
@import "primeicons/primeicons.css";
@import "@/assets/layout/flags/flags.css";
@import "@/assets/layout/sass/_main.scss";
@import "sweetalert2/dist/sweetalert2.min.css";
</style>

<style scoped>
.layout-wrapper {
  padding: 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  height: 100vh;
  width: 100vw;
}

#main-container {
  width: 100vw;
  height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  overflow: auto;
  background-color: var(--surface-ground);
}
.loading-container {
  width: 100%;
  height: 100%;
}
</style>

<style>
.p-dialog-mask {
  z-index: 1;
}
.swal2-popup {
  background-color: var(--surface-a);
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

.p-dialog-header-icons {
  flex: 1 0 auto;
  justify-content: flex-end;
}

.p-progress-spinner {
  overflow: hidden;
}
</style>
