<template>
  <div v-if="show" class="text-with-label-container" :id="id" :style="{ width: size }">
    <strong class="label">{{ label }}: </strong>
    <span class="data break-text">{{ data ? data : "None" }}</span>
  </div>
</template>

<script setup lang="ts">
import { defineComponent } from "vue";

const props = defineProps({
  label: { type: String, required: true },
  data: { type: String, required: false },
  size: { type: String, default: "100%" },
  id: { type: String, default: "text-with-label" },
  show: { type: Boolean, required: true }
});
</script>

<style scoped>
.text-with-label-container {
  padding: 0.25rem 0.5rem 0 0;
}
.break-text {
  word-break: break-all;
}
</style>
