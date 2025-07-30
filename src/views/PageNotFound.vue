<template>
  <div id="page-not-found-container">
    <IMFontAwesomeIcon icon="fa-solid fa-circle-exclamation" class="error-icon" size="10x" />
    <h1 class="error-code">404</h1>
    <h2 class="error-header">Page not found</h2>
    <p class="error-text"><span>The page you are looking for could not be found. It might have been removed or is temporarily unavailable.</span> <br /></p>
    <div class="button-container">
      <Button label="Back" @click="goBack" icon="fa-solid fa-arrow-left" />
      <Button label="Home" @click="goHome" icon="fa-solid fa-home" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

function goBack() {
  router.go(-1);
}

async function goHome() {
  await router.push({ name: "Directory" });
}
</script>

<style scoped>
#page-not-found-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
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
