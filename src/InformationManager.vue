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
import { ComputedRef, Ref, computed, onMounted, ref, watch } from "vue";

import { useChangeFontSize, useChangeThemeOptions } from "@endeavour/vue-library/composables";
import { REPO } from "@endeavour/vue-library/enums";
import { isObjectHasKeys } from "@endeavour/vue-library/helpers";
import type { GithubRelease } from "@endeavour/vue-library/interfaces";
import { useUserStore } from "@endeavour/vue-library/stores";

import { useCookies } from "@vueuse/integrations";
import { useDialog } from "primevue";
import { useToast } from "primevue/usetoast";
import semver from "semver";
import { useRoute, useRouter } from "vue-router";

import ReleaseNotes from "@/components/app/ReleaseNotes.vue";
import { Env, GithubService, SecurityService } from "@/services";
import { useDialogStore } from "@/stores/dialogStore";
import { useFilterStore } from "@/stores/filterStore";
import { useSharedStore } from "@/stores/sharedStore";

import CookiesConsent from "./components/app/CookiesConsent.vue";
import DevBanner from "./components/app/DevBanner.vue";
import FooterBar from "./components/app/FooterBar.vue";
import ReleaseBannerBar from "./components/app/ReleaseBannerBar.vue";
import SnomedConsent from "./components/app/SnomedConsent.vue";
import { setModes } from "./router/methods/setModes";
import { setToastInstance } from "./services/toast";
import { useLoadingStore } from "./stores/loadingStore";

setupExternalErrorHandler();

const dialog = useDialog();
const router = useRouter();
const route = useRoute();
const toast = useToast();
setToastInstance(toast);
const cookie = useCookies();
const dialogStore = useDialogStore();
const userStore = useUserStore();
const sharedStore = useSharedStore();
const loadingStore = useLoadingStore();
const filterStore = useFilterStore();
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
    const user = await SecurityService.getUser(true);
    if (user) userStore.updateCurrentUser(user);
  } catch (e: any) {
    console.log("No user session found");
  }

  await setModes();

  loadingStore.updateViewsLoading(true);

  if (isPublicMode.value || isLoggedIn.value || route.fullPath.startsWith("/callback")) {
    userStore.getAllFromUserDatabase();
    await setThemeOptions();
    if (currentFontSize.value) await changeFontSize(currentFontSize.value);
    await filterStore.fetchFilterSettings();
    await setShowReleaseBanner();
  } else {
    window.location.href = await SecurityService.getLoginUrl();
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
  latestRelease.value = await GithubService.getLatestRelease(REPO.IM_DIRECTORY);
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
