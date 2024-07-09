<template>
  <div id="vue-error-container">
    <IMFontAwesomeIcon icon="fa-solid fa-bolt-lightning" size="10x" />
    <IMFontAwesomeIcon icon="fa-solid fa-robot" class="error-icon" size="10x" />
    <h1 class="error-code">Oops...</h1>
    <h2 class="error-header">Something went wrong</h2>
    <p class="error-text">
      <span>An unexpected error has occurred.</span> <br />
      <span>Please check the console for details on this error.</span>
    </p>
    <div class="error-submit-container">
      <Button label="Send error report" @click="sendErrorReport" />
    </div>
    <div class="button-container">
      <Button label="Back" @click="goBack" icon="fa-solid fa-arrow-left" />
      <Button label="Home" @click="goHome" icon="fa-solid fa-home" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSharedStore } from "@/stores/sharedStore";
import { useRouter } from "vue-router";

const router = useRouter();

function goBack() {
  router.go(-1);
}

function goHome() {
  router.push({ name: "Directory" });
}

function sendErrorReport() {
  router.push({ name: "BugReport" });
}
</script>

<style scoped>
#vue-error-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}
.error-icon {
  color: var(--p-red-500);
}

.error-code {
  color: var(--p-text-color);
  font-size: 6rem;
  margin: 1.5rem 0 0.5rem 0;
}

.error-header {
  color: var(--p-text-color);
  margin: 0.5rem;
}

.button-container {
  display: flex;
  flex-flow: row;
  gap: 1rem;
}
</style>
