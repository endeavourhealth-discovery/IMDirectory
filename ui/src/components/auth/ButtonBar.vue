<template>
  <div class="flex flex-row justify-content-start">
    <Button
      data-testid="button-bar-back-button"
      class="back-button"
      label="Back"
      icon="pi pi-arrow-circle-left"
      iconPos="left"
      v-on:click.prevent="clickedBack"
    />
    <Button data-testid="button-bar-home-button" class="home-button" icon="pi pi-home" v-on:click.prevent="homeClicked" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();
const router = useRouter();

function clickedBack(): void {
  router.back();
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
