<template>
  <div class="layout-wrapper layout-static">
    <Toast />
    <ConfirmDialog />
    <DynamicDialog class="dynamic-dialog" />
    <ReleaseNotes v-if="!viewsLoading && showReleaseNotes" />
    <CookiesConsent />
    <SnomedConsent />
    <div id="main-container">
      <DevBanner v-if="isDevMode && showDevBanner && finishedOnMounted" />
      <ReleaseBannerBar v-if="!viewsLoading && showReleaseBanner && finishedOnMounted" :latestRelease="latestRelease" />
      <div v-if="viewsLoading || !finishedOnMounted" class="loading-container flex flex-row items-center justify-center">
        <ProgressSpinner />
      </div>
      <div v-else id="router-main" class="flex h-full w-full overflow-auto">
        <router-view />
      </div>
      <FooterBar v-if="finishedOnMounted" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ComputedRef, onMounted, ref, Ref, watch } from "vue";
import ReleaseNotes from "@/components/app/ReleaseNotes.vue";
import CookiesConsent from "./components/app/CookiesConsent.vue";
import ReleaseBannerBar from "./components/app/ReleaseBannerBar.vue";
import FooterBar from "./components/app/FooterBar.vue";
import DevBanner from "./components/app/DevBanner.vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { CasdoorService, GithubService } from "@/services";
import axios, { AxiosError, AxiosInstance, AxiosRequestHeaders, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import semver from "semver";
import { GithubRelease } from "./interfaces";
import { useUserStore } from "./stores/userStore";
import SnomedConsent from "./components/app/SnomedConsent.vue";
import { useSharedStore } from "@/stores/sharedStore";
import { useChangeFontSize } from "@/composables/useChangeFontSize";
import { useLoadingStore } from "./stores/loadingStore";
import { useFilterStore } from "@/stores/filterStore";
import { useChangeThemeOptions } from "./composables/useChangeThemeOptions";
import { setModes } from "./router/methods/setModes";
import { useCasdoor } from "casdoor-vue-sdk";
import { useCookies } from "@vueuse/integrations";
import { useDialog } from "primevue/usedialog";
import { useDialogStore } from "@/stores/dialogStore";

setupAxiosInterceptors(axios);
setupExternalErrorHandler();

const dialog = useDialog();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const cookie = useCookies();
const userStore = useUserStore();
const sharedStore = useSharedStore();
const loadingStore = useLoadingStore();
const filterStore = useFilterStore();
const dialogStore = useDialogStore();
const { getSigninUrl, getSignupUrl, isSilentSigninRequested, silentSignin } = useCasdoor();
sharedStore.updateSigninUrl(getSigninUrl());
sharedStore.updateSignupUrl(getSignupUrl());
const finishedOnMounted = ref(false);

const { changeFontSize } = useChangeFontSize();
const { changePreset, changePrimaryColor, changeSurfaceColor, changeDarkMode } = useChangeThemeOptions();

const showReleaseNotes: ComputedRef<boolean> = computed(() => sharedStore.showReleaseNotes);
const showReleaseBanner: ComputedRef<boolean> = computed(() => sharedStore.showReleaseBanner);
const showDevBanner: ComputedRef<boolean> = computed(() => sharedStore.showDevBanner);
const isPublicMode: ComputedRef<boolean | undefined> = computed(() => sharedStore.isPublicMode);
const isDevMode: ComputedRef<boolean | undefined> = computed(() => sharedStore.isDevMode);
const isLoggedIn = computed(() => userStore.isLoggedIn);
const currentFontSize = computed(() => userStore.currentFontSize);
const currentPreset = computed(() => userStore.currentPreset);
const currentPrimaryColor = computed(() => userStore.currentPrimaryColor);
const currentSurfaceColor = computed(() => userStore.currentSurfaceColor);
const darkMode = computed(() => userStore.darkMode);
const viewsLoading = computed(() => loadingStore.viewsLoading);

userStore.getAllFromLocalStorage();
await setThemeOptions();
const latestRelease: Ref<GithubRelease | undefined> = ref();

watch(currentPreset, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) await changePreset(newValue);
});
watch(currentFontSize, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) await changeFontSize(newValue);
});
watch(currentPrimaryColor, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) await changePrimaryColor(newValue);
});
watch(currentSurfaceColor, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) await changeSurfaceColor(newValue);
});
watch(darkMode, async (newValue, oldValue) => {
  if (newValue !== oldValue) await changeDarkMode(newValue);
});

onMounted(async () => {
  try {
    const user = await CasdoorService.getUser(true);
    if (user) userStore.updateCurrentUser(user);
  } catch (e: any) {
    console.log("No user session found");
  }

  await setModes();

  loadingStore.updateViewsLoading(true);

  if (isPublicMode.value || isLoggedIn.value) {
    userStore.getAllFromUserDatabase();
    await setThemeOptions();
    if (currentFontSize.value) await changeFontSize(currentFontSize.value);
    await filterStore.fetchFilterSettings();
    await setShowReleaseBanner();
  } else {
    window.location.href = getSigninUrl();
  }

  dialogStore.register(dialog);
  loadingStore.updateViewsLoading(false);
  finishedOnMounted.value = true;
});

async function setThemeOptions() {
  if (currentPreset.value) await changePreset(currentPreset.value);
  if (currentPrimaryColor.value) await changePrimaryColor(currentPrimaryColor.value);
  if (currentSurfaceColor.value) await changeSurfaceColor(currentSurfaceColor.value);
  if (darkMode.value) await changeDarkMode(darkMode.value);
}

async function setShowReleaseBanner() {
  const lastVersion = getLocalVersion("IMDirectory");
  latestRelease.value = await GithubService.getLatestRelease("IMDirectory");
  let currentVersion = "v0.0.0";
  if (latestRelease.value?.version) currentVersion = latestRelease.value.version;
  if (!lastVersion || !semver.valid(lastVersion) || semver.lt(lastVersion, currentVersion)) {
    sharedStore.updateShowReleaseBanner(true);
  } else if (semver.valid(lastVersion) && semver.gt(lastVersion, currentVersion)) {
    localStorage.removeItem("IMDirectoryVersion");
    sharedStore.updateShowReleaseBanner(true);
  } else sharedStore.updateShowReleaseBanner(false);
}

function getLocalVersion(repoName: string): string | null {
  return localStorage.getItem(repoName + "Version");
}

function setupAxiosInterceptors(axios: AxiosInstance) {
  axios.defaults.withCredentials = true;
  axios.interceptors.request.use(async (request: InternalAxiosRequestConfig) => {
    if (isLoggedIn.value) {
      if (!request.headers) request.headers = {} as AxiosRequestHeaders;
      request.headers.set("Graph", userStore.includeUserGraph);
    } else if (!isLoggedIn.value && isPublicMode.value === false && !(request.url?.endsWith("isPublicMode") || request.url?.endsWith("isDevMode"))) {
      window.location.href = getSigninUrl();
    }
    return request;
  });

  axios.interceptors.response.use(
    (response: AxiosResponse) => {
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
        await handle403(error);
      } else if (error?.response?.status === 401) {
        await handle401(error);
      } else if (error?.response?.data?.code && error?.response?.status > 399 && error?.response?.status < 500) {
        console.error(error.response.data);
        toast.add({
          severity: "error",
          summary: error.response.data.code,
          detail: error.response.data.debugMessage
        });
      } else if (error?.response?.status >= 500) {
        await handle5xx(error);
      } else if (error.code === "ERR_CANCELED") {
        return;
      } else {
        return Promise.reject(error);
      }
    }
  );
}

async function handle401(error: AxiosError) {
  toast.add({
    severity: "error",
    summary: "Access denied",
    detail:
      "Insufficient clearance to access " +
      error.config?.url?.substring(error.config.url.lastIndexOf("/") + 1) +
      ". Please contact an admin to change your account security clearance if you require access to this resource."
  });
  await router.push({ name: "AccessDenied" }).then();
}

async function handle403(error: any) {
  if (!isPublicMode.value && error.response?.data === "Access forbidden") {
    if (route.path !== "/user/login") {
      window.location.href = getSigninUrl();
    } else console.error(error);
  } else if (error.response?.data) {
    toast.add({
      severity: "error",
      summary: "Access denied",
      detail: error.response.data.debugMessage
    });
  } else if (error?.config?.url) {
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

async function handle5xx(error: any) {
  if (error.code === "ERR_BAD_RESPONSE") {
    if (error.response.data.code === "OpenSearchException") {
      toast.add({
        severity: "error",
        summary: "Error calling OpenSearch",
        detail: error.response.data.debugMessage
      });
    } else if (error.response.data.code === "ConfigException") {
      toast.add({
        severity: "error",
        summary: "Error retrieving Github releases",
        detail: error.response.data.debugMessage
      });
      await router.push({ name: "ServerOffline" });
    } else await router.push({ name: "ServerOffline" }).then();
  } else if (error.code === "ERR_CANCELED") {
    return;
  }
}

function setupExternalErrorHandler() {
  window.addEventListener("unhandledrejection", async e => {
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
    sharedStore.updateError(e as unknown as string);
    await router.push({ name: "VueError" });
  });
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss" unscoped>
@use "assets/layout/sass/_main.scss";
@import "primeicons/primeicons.css";
@import "assets/layout/flags/flags.css";
@import "sweetalert2/dist/sweetalert2.min.css";
@import "assets/tailwind.css";
@import "assets/primevueOverrides.css";

.swal2-container {
  z-index: 999999;
}

.swal2-popup {
  background-color: var(--p-content-background);
}
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
