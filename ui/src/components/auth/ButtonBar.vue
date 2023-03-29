<template>
  <div class="flex flex-row justify-content-start">
    <Button
      data-testid="button-bar-back-button"
      class="back-button"
      label="Back"
      :icon="fontAwesomePro ? 'fa-duotone fa-circle-arrow-left' : 'fa-solid fa-circle-arrow-left'"
      iconPos="left"
      v-on:click.prevent="clickedBack"
    />
    <Button data-testid="button-bar-home-button"
            class="home-button"
            :icon="fontAwesomePro ? 'fa-duotone fa-house-chimney' : 'fa-solid fa-house-chimney'"
            v-on:click.prevent="homeClicked" />
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import { computed } from "vue";
import { useRouter } from "vue-router";

const store = useStore();
const router = useRouter();

const previousAppUrl = computed(() => store.state.previousAppUrl);
const fontAwesomePro = computed(() => store.state.fontAwesomePro);

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
