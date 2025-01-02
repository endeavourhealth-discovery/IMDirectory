<template>
  <div class="flex flex-row justify-start" v-if="isPublicMode">
    <Button
      data-testid="button-bar-back-button"
      class="back-button"
      label="Back"
      icon="fa-solid fa-circle-arrow-left"
      iconPos="left"
      v-on:click.prevent="clickedBack"
    />
    <Button data-testid="button-bar-home-button" class="home-button" icon="fa-solid fa-house" v-on:click.prevent="homeClicked" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useSharedStore } from "@/stores/sharedStore";

const router = useRouter();
const sharedStore = useSharedStore();
const isPublicMode = computed(() => sharedStore.isPublicMode);

function clickedBack(): void {
  if (window.history.length > 2) router.back();
  else router.push({ name: "LandingPage" });
}

function homeClicked(): void {
  router.push({ name: "Directory" });
}
</script>

<style scoped>
.back-button {
  width: fit-content;
}

.home-button {
  margin-left: 0.25em;
}
</style>
