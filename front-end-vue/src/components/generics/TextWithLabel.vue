<template>
  <div class="text-with-label-container" :style="{ width: size }">
    <strong class="label">{{ label }}: </strong>
    <span class="data break-text">{{ data ? data : "None" }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TextWithLabel",
  props: { label: String, data: String, size: String }
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
