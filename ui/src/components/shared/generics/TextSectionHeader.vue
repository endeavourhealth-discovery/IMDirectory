<template>
  <div v-if="show" :id="id" class="text-section-header-container" :style="{ width: size }">
    <strong class="text-section-header">
      {{ label }}
    </strong>
  </div>
</template>

<script setup lang="ts">
import { defineComponent } from "@vue/runtime-core";

const props = defineProps({
  label: { type: String, required: true },
  size: { type: String, default: "100%" },
  id: { type: String, default: "text-section-header" },
  show: { type: Boolean, required: false, default: true }
});
</script>

<style scoped>
.text-section-header {
  font-size: 1.25rem;
}
</style>
