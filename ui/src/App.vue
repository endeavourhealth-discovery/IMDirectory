<template>
  <div class="layout-wrapper layout-static">
    <Toast />
    <ConfirmDialog />
    <DynamicDialog class="dynamic-dialog" />
    <ReleaseNotes v-if="!loading && showReleaseNotes" />
    <CookiesConsent />
    <SnomedConsent />
    <div id="main-container">
      <BannerBar v-if="!loading && showBanner" :latestRelease="latestRelease" />
      <div v-if="loading" class="flex flex-row justify-content-center align-items-center loading-container">
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
import { GithubService, UserService } from "@/services";
import semver from "semver";
import { GithubRelease } from "./interfaces";
import { useUserStore } from "./stores/userStore";
import SnomedConsent from "./components/app/SnomedConsent.vue";
import { useSharedStore } from "@/stores/sharedStore";
import setupChangeTheme from "@/composables/setupChangeTheme";

const userStore = useUserStore();
const sharedStore = useSharedStore();

const { changeTheme } = setupChangeTheme();

const showReleaseNotes: ComputedRef<boolean> = computed(() => sharedStore.showReleaseNotes);
const showBanner: ComputedRef<boolean> = computed(() => sharedStore.showBanner);
const isLoggedIn = computed(() => userStore.isLoggedIn);
const currentUser = computed(() => userStore.currentUser);
const currentTheme = computed(() => userStore.currentTheme);

watch(
  () => currentTheme.value,
  newValue => {
    changeTheme(newValue);
  }
);

const latestRelease: Ref<GithubRelease | undefined> = ref();
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  await userStore.authenticateCurrentUser();
  await userStore.getAllFromUserDatabase();
  let theme = "saga-blue";
  if (currentUser.value) await UserService.getUserTheme();
  if (currentTheme.value) theme = currentTheme.value;
  changeTheme(theme);
  await setShowBanner();
  loading.value = false;
});

async function setShowBanner() {
  const lastVersion = getLocalVersion("IMDirectory");
  latestRelease.value = await GithubService.getLatestRelease("IMDirectory");
  let currentVersion = "v0.0.0";
  if (latestRelease.value && latestRelease.value.version) currentVersion = latestRelease.value.version;
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

function setLocalVersion(repoName: string, versionNo: string) {
  localStorage.setItem(repoName + "Version", versionNo);
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
  background-color: var(--surface-ground);
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
