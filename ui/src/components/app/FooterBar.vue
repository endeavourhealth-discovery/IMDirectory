<template>
  <div id="footer-bar">
    <div id="footer-start">
      <h2>Information Model</h2>
    </div>
    <div id="footer-middle">
      <router-link to="/privacy" class="footer-link">Privacy policy</router-link>
      <router-link to="/cookies" class="footer-link">Cookie policy</router-link>
      <span @click="showCookieSettings" class="footer-link">Cookie settings</span>
      <router-link to="/snomedLicense" class="footer-link">Snomed agreement</router-link>
    </div>
    <div id="footer-end">
      <h3>Endeavour Health</h3>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRootStore } from "@/stores/rootStore";

const rootStore = useRootStore();

function showCookieSettings() {
  rootStore.updateShowCookieConsent(true);
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
</style>
