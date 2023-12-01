<template>
  <div class="dynamic-loading-container">
    <h2 v-if="title">{{ title }}</h2>
    <p v-if="text">{{ text }}</p>
    <ProgressSpinner />
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from "vue";

const dialogRef: any = inject("dialogRef");

const title = ref("");
const text = ref("");

onMounted(() => {
  if (dialogRef.value) {
    const params = dialogRef.value.data;
    if (params.title) title.value = params.title;
    if (params.text) text.value = params.text;
  }
});
</script>

<style scoped>
.dynamic-loading-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
}
</style>
