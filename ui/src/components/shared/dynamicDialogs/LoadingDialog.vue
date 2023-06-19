<template>
  <div class="dynamic-loading-container">
    <h2 v-if="title">{{ title }}</h2>
    <p v-if="text">{{ text }}</p>
    <ProgressSpinner />
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  text?: string;
}
const props = defineProps<Props>();
</script>

<style scoped>
.dynamic-loading-container {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: flex-start;
}
</style>
