<template>
  <div id="dev-banner">
    <div class="banner-text-container">
      <span class="banner-text">
        This is the IM development site. Using this site may result in unexpected behaviours. Please visit our
        <span @click="redirectToLive" class="live-link">live site</span>
        for the latest stable release.
      </span>
    </div>
    <Button icon="fa-solid fa-xmark" text rounded-sm aria-label="Cancel" class="close-button" @click="closeBanner" />
  </div>
</template>

<script setup lang="ts">
import { useSharedStore } from "@/stores/sharedStore";

const sharedStore = useSharedStore();

function closeBanner() {
  sharedStore.updateShowDevBanner(false);
}

function redirectToLive() {
  window.location.href = "https://im.endhealth.co.uk";
}
</script>

<style scoped>
#dev-banner {
  width: 100%;
  height: 2rem;
  background-color: var(--p-primary-200);
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

.live-link {
  font-weight: bold;
  color: var(--p-text-color);
  cursor: pointer;
}

.live-link:hover {
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
