<template>
  <div id="banner">
    <div class="banner-text-container">
      <span v-if="latestRelease" class="banner-text"
        >{{ latestRelease.title }} <span @click="showReleaseNotes" class="release-notes-link">View notes</span></span
      >
    </div>
    <Button icon="fa-solid fa-xmark" text rounded aria-label="Cancel" class="close-button" @click="closeBanner" />
  </div>
</template>

<script setup lang="ts">
import { GithubRelease } from "@/interfaces";
import { useSharedStore } from "@/stores/sharedStore";

interface Props {
  latestRelease?: GithubRelease;
}

const props = defineProps<Props>();

const sharedStore = useSharedStore();

function closeBanner() {
  if (props.latestRelease?.version) localStorage.setItem("IMDirectoryVersion", props.latestRelease.version);
  sharedStore.updateShowReleaseBanner(false);
}

function showReleaseNotes() {
  sharedStore.updateShowReleaseNotes(true);
}
</script>

<style scoped>
#banner {
  width: 100%;
  height: 2rem;
  background-color: var(--p-primary-color);
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  flex: 0 0 auto;
}

.banner-text-container {
  flex: 1 1 auto;
  height: 2rem;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}

.banner-text {
  color: var(--p-text-color);
  font-size: 1rem;
}

.release-notes-link {
  font-weight: bold;
  color: var(--p-text-color);
  cursor: pointer;
}

.release-notes-link:hover {
  text-decoration: underline;
}

.close-button {
  flex: 0 0 auto;
  height: 2rem !important;
  width: 2rem !important;
  color: var(--p-text-color);
}

.close-button:hover {
  color: var(--p-primary-color) !important;
  background-color: var(--p-text-color) !important;
}
</style>
