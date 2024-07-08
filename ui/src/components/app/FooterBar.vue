<template>
  <div id="footer-bar">
    <div id="footer-start">
      <IMFontAwesomeIcon
        icon="fa-duotone fa-cookie-bite"
        :style="'--fa-primary-color: var(--p-orange-900); --fa-secondary-color: var(--p-yellow-500);'"
        class="footer-icon"
        v-tooltip.right="'Cookie settings'"
        @click="showCookieSettings"
      />
    </div>
    <div id="footer-middle">
      <router-link to="/privacy" class="footer-link">Privacy policy</router-link>
      <router-link to="/cookies" class="footer-link">Cookie policy</router-link>
      <router-link to="/snomedLicense" class="footer-link">Snomed agreement</router-link>
      <router-link to="/uprn-agreement" class="footer-link">Uprn agreement</router-link>
    </div>
    <div id="footer-end"></div>
  </div>
</template>

<script setup lang="ts">
import { useSharedStore } from "@/stores/sharedStore";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";

const sharedStore = useSharedStore();

function showCookieSettings() {
  sharedStore.updateShowCookieConsent(true);
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
  border-top: 1px solid var(--p-surface-border);
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
  cursor: pointer;
  font-size: 2rem;
  height: 100%;
}
</style>
