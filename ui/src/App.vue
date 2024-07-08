<template>
  <div class="layout-wrapper layout-static">
    <Toast />
    <ConfirmDialog />
    <DynamicDialog class="dynamic-dialog" />
    <ReleaseNotes v-if="!viewsLoading && showReleaseNotes" />
    <CookiesConsent />
    <SnomedConsent />
    <div id="main-container">
      <BannerBar v-if="!viewsLoading && showBanner" :latestRelease="latestRelease" />
      <div v-if="viewsLoading" class="flex flex-row justify-content-center align-items-center loading-container">
        <ProgressSpinner />
      </div>
      <router-view v-else />
      <FooterBar />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, ComputedRef, Ref, watch } from "vue";
import ReleaseNotes from "@/components/app/ReleaseNotes.vue";
import CookiesConsent from "./components/app/CookiesConsent.vue";
import BannerBar from "./components/app/BannerBar.vue";
import FooterBar from "./components/app/FooterBar.vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { AuthService, GithubService, UserService } from "@/services";
import { fetchAuthSession } from "aws-amplify/auth";
import axios from "axios";
import semver from "semver";
import { GithubRelease } from "./interfaces";
import { useUserStore } from "./stores/userStore";
import SnomedConsent from "./components/app/SnomedConsent.vue";
import { useSharedStore } from "@/stores/sharedStore";
import setupChangeScale from "@/composables/setupChangeScale";
import { useLoadingStore } from "./stores/loadingStore";
import { useFilterStore } from "@/stores/filterStore";
import setupChangeThemeOptions from "./composables/setupChangeThemeOptions";

setupAxiosInterceptors(axios);
setupExternalErrorHandler();

const router = useRouter();
const toast = useToast();
const userStore = useUserStore();
const sharedStore = useSharedStore();
const loadingStore = useLoadingStore();
const filterStore = useFilterStore();

const { changeScale } = setupChangeScale();
const { changePreset, changePrimaryColor, changeSurfaceColor, changeDarkMode } = setupChangeThemeOptions();

const showReleaseNotes: ComputedRef<boolean> = computed(() => sharedStore.showReleaseNotes);
const showBanner: ComputedRef<boolean> = computed(() => sharedStore.showBanner);
const isLoggedIn = computed(() => userStore.isLoggedIn);
const currentUser = computed(() => userStore.currentUser);
const currentScale = computed(() => userStore.currentScale);
const currentPreset = computed(() => userStore.currentPreset);
const currentPrimaryColor = computed(() => userStore.currentPrimaryColor);
const currentSurfaceColor = computed(() => userStore.currentSurfaceColor);
const darkMode = computed(() => userStore.darkMode);
const viewsLoading = computed(() => loadingStore.viewsLoading);

const latestRelease: Ref<GithubRelease | undefined> = ref();

onMounted(async () => {
  loadingStore.updateViewsLoading(true);
  await AuthService.getCurrentAuthenticatedUser();
  await filterStore.fetchFilterSettings();
  await userStore.getAllFromUserDatabase();
  setThemeOptions();
  let scale = "16px";
  if (currentScale.value) scale = currentScale.value;
  changeScale(scale);

  await setShowBanner();
  loadingStore.updateViewsLoading(false);
});

function setThemeOptions() {
  if (currentPreset.value) changePreset(currentPreset.value);
  if (currentPrimaryColor.value) changePrimaryColor(currentPrimaryColor.value);
  if (currentSurfaceColor.value) changeSurfaceColor(currentSurfaceColor.value);
  if (darkMode.value) changeDarkMode(darkMode.value);
}

async function setShowBanner() {
  const lastVersion = getLocalVersion("IMDirectory");
  latestRelease.value = await GithubService.getLatestRelease("IMDirectory");
  let currentVersion = "v0.0.0";
  if (latestRelease.value?.version) currentVersion = latestRelease.value.version;
  if (!lastVersion || !semver.valid(lastVersion) || semver.lt(lastVersion, currentVersion)) {
    sharedStore.updateShowBanner(true);
  } else if (semver.valid(lastVersion) && semver.gt(lastVersion, currentVersion)) {
    localStorage.removeItem("IMDirectoryVersion");
    sharedStore.updateShowBanner(true);
  } else sharedStore.updateShowBanner(false);
}

function getLocalVersion(repoName: string): string | null {
  return localStorage.getItem(repoName + "Version");
}

async function setupAxiosInterceptors(axios: any) {
  axios.interceptors.request.use(async (request: any) => {
    if (isLoggedIn.value) {
      if (!request.headers) request.headers = {};
      request.headers.Authorization = "Bearer " + (await fetchAuthSession()).tokens?.idToken;
    }
    return request;
  });

  axios.interceptors.response.use(
    async (response: any) => {
      return isObjectHasKeys(response, ["data"]) ? response.data : undefined;
    },
    async (error: any) => {
      if (error?.response?.config?.raw) {
        if (error?.config?.responseType === "blob" && error?.response?.data) {
          error.response.data = JSON.parse(await error.response.data.text());
          return Promise.reject(error);
        } else return Promise.reject(error);
      }
      if (error?.response?.status === 403) {
        handle403(error);
      } else if (error?.response?.status === 401) {
        handle401(error);
      } else if (error?.response?.data?.code && error?.response?.status > 399 && error?.response?.status < 500) {
        console.error(error.response.data);
        toast.add({
          severity: "error",
          summary: error.response.data.code,
          detail: error.response.data.debugMessage
        });
      } else if (error?.response?.status >= 500 && error.code === "ERR_BAD_RESPONSE") {
        router.push({ name: "ServerOffline" }).then();
      } else if (error.code === "ERR_CANCELED") {
        return;
      } else {
        return Promise.reject(error);
      }
    }
  );
}

function handle401(error: any) {
  toast.add({
    severity: "error",
    summary: "Access denied",
    detail:
      "Insufficient clearance to access " +
      error.config.url.substring(error.config.url.lastIndexOf("/") + 1) +
      ". Please contact an admin to change your account security clearance if you require access to this resource."
  });
  router.push({ name: "AccessDenied" }).then();
}

function handle403(error: any) {
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
    sharedStore.updateError(e);
    router.push({ name: "VueError" });
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
  justify-content: space-between;
  overflow: auto;
}
.loading-container {
  width: 100%;
  flex: 1 1 auto;
}
</style>

<style>
:root {
  --hyperlink-blue: #2196f3;
}

:root {
  --imquery-editor-background-color: #6bb28c10;
  --imquery-editor-border-color: #6bb28c30;
  --imquery-editor-hover-border-color: #6bb28c;
}

.p-dialog-mask {
  z-index: 1;
}
.swal2-popup {
  background-color: var(--p-surface-0);
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
