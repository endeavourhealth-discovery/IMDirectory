<template>
  <div id="footer-bar">
    <div id="footer-start">
      <IMFontAwesomeIcon
        :icon="fontAwesomePro ? 'fa-duotone fa-cookie-bite' : 'fa-solid fa-cookie-bite'"
        :style="fontAwesomePro && '--fa-primary-color: var(--orange-900); --fa-secondary-color: var(--yellow-500)'"
        class="footer-icon"
        v-tooltip.top="'Cookie settings'"
        @click="showCookieSettings"
      />
    </div>
    <div id="footer-middle">
      <router-link to="/privacy" class="footer-link">Privacy policy</router-link>
      <router-link to="/cookies" class="footer-link">Cookie policy</router-link>
      <router-link to="/snomedLicense" class="footer-link">Snomed agreement</router-link>
    </div>
    <div id="footer-end"></div>
  </div>
</template>

<script setup lang="ts">
import { useDirectoryStore } from "@/stores/directoryStore";
import { useSharedStore } from "@/stores/sharedStore";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";

const directoryStore = useDirectoryStore();
const sharedStore = useSharedStore();
const fontAwesomePro = sharedStore.fontAwesomePro;

function showCookieSettings() {
  sharedStore.updateShowCookieConsent(true);
}
</script>

<style scoped>
#footer-bar {
  flex: 0 0 auto;
  width: 100%;
  height: 3rem;
  background-color: var(--surface-0);
  display: flex;
  flex-flow: row nowrap;
  overflow: hidden;
  border-top: 1px solid var(--surface-border);
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
  padding: 0.5rem;
}

.footer-link {
  color: var(--hyperlink-blue);
  cursor: pointer;
}

.footer-link:hover {
  text-decoration: underline;
}

.footer-icon {
  height: 2rem;
  width: 2rem;
  cursor: pointer;
}
</style>
