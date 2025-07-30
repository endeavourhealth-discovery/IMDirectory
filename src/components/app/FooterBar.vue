<template>
  <div id="footer-bar">
    <div id="footer-start">
      <IMFontAwesomeIcon
        icon="fa-duotone fa-cookie-bite"
        :style="'--fa-primary-color: var(--p-orange-900); --fa-secondary-color: var(--p-yellow-500);'"
        class="footer-icon"
        v-tooltip.right="'Cookie settings'"
        @click="showCookieSettings"
        data-testid="cookie-settings-button"
      />
    </div>
    <div id="footer-middle">
      <Button link as="router-link" label="Privacy policy" to="/privacy" class="footer-link" />
      <Button link as="router-link" label="Cookie policy" to="/cookies" class="footer-link" />
      <Button link as="router-link" label="Snomed agreement" to="/snomedLicense" class="footer-link" />
      <Button link as="router-link" label="Uprn agreement" to="/uprn-agreement" class="footer-link" />
    </div>
    <div id="footer-end">
      <Button
        v-tooltip.bottom="'Releases'"
        v-if="currentVersion"
        :label="currentVersion"
        class="p-button-rounded p-button-outlined p-button-plain topbar-end-button"
        @click="showReleaseNotes"
        data-testid="releases-button"
      />
      <IMFontAwesomeIcon
        icon="fa-duotone fa-bugs"
        :style="'--fa-primary-color: var(--p-primary-color); --fa-secondary-color: var(--p-content-color)'"
        class="footer-icon"
        v-tooltip.left="'Report bug'"
        @click="reportBug"
        data-testid="reportbug-button"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSharedStore } from "@/stores/sharedStore";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";
import { useRouter } from "vue-router";
import { onMounted, ref, Ref } from "vue";
import { GithubService } from "@/services";

const sharedStore = useSharedStore();
const router = useRouter();

const currentVersion: Ref<undefined | string> = ref();

onMounted(async () => {
  await getCurrentVersion();
});

async function getCurrentVersion() {
  const latestRelease = await GithubService.getLatestRelease("IMDirectory");
  if (latestRelease && latestRelease.version) currentVersion.value = latestRelease.version;
}

function showReleaseNotes() {
  sharedStore.updateShowReleaseNotes(true);
}

function showCookieSettings() {
  sharedStore.updateShowCookieConsent(true);
}

async function reportBug() {
  await router.push({ name: "BugReport" });
}
</script>

<style scoped>
#footer-bar {
  flex: 0 0 auto;
  width: 100%;
  height: 3rem;
  display: flex;
  flex-flow: row nowrap;
  overflow: hidden;
  border-top: 1px solid var(--p-content-border-color);
}

#footer-start {
  flex: 0 0 auto;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  padding: 0.5rem;
}

#footer-middle {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
}

#footer-end {
  flex: 0 0 auto;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
}

.footer-icon {
  cursor: pointer;
  font-size: 2rem;
  height: 100%;
}
</style>
