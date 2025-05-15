<template>
  <div class="user-container flex flex-col items-center justify-start">
    <div class="card-button-container flex flex-col justify-start gap-y-2">
      <ButtonBar />
      <div v-if="authLoading" class="flex flex-1 flex-row items-center justify-center">
        <ProgressSpinner />
      </div>
      <router-view v-else />
    </div>
  </div>
</template>

<script lang="ts" setup>
import ButtonBar from "@/components/auth/ButtonBar.vue";
import { useLoadingStore } from "@/stores/loadingStore";
import { computed } from "vue";

const loadingStore = useLoadingStore();
const authLoading = computed(() => loadingStore.authLoading);
</script>

<style scoped>
.user-container {
  width: 100%;
  flex: 1 1 auto;
  padding-top: 5vh;
  overflow: auto;
}

.card-button-container {
  height: 100%;
}
</style>
