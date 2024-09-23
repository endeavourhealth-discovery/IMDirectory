<template>
  <div class="user-container flex flex-col items-center justify-start">
    <div class="card-button-container flex flex-col justify-start gap-y-2">
      <ButtonBar />
      <router-view />
    </div>
  </div>
</template>

<script lang="ts" setup>
import ButtonBar from "@/components/auth/ButtonBar.vue";
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

#user-card-container {
  height: 100%;
  overflow-y: auto;
}
</style>
