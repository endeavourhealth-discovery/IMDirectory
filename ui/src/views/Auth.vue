<template>
  <div class="flex flex-col items-center justify-start user-container">
    <div class="flex flex-col justify-start card-button-container">
      <ButtonBar />
      <div id="user-card-container">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ButtonBar from "@/components/auth/ButtonBar.vue";
</script>

<style scoped>
.user-container {
  width: 100%;
  flex: 1 1 auto;
  margin-top: 5vh;
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
