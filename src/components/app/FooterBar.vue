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
      <Button link as="router-link" label="Privacy policy" to="/privacy" class="footer-link" />
      <Button link as="router-link" label="Cookie policy" to="/cookies" class="footer-link" />
      <Button link as="router-link" label="Snomed agreement" to="/snomedLicense" class="footer-link" />
      <Button link as="router-link" label="Uprn agreement" to="/uprn-agreement" class="footer-link" />
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
  padding: 0.5rem;
}

.footer-icon {
  cursor: pointer;
  font-size: 2rem;
  height: 100%;
}
</style>
