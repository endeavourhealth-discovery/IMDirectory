<template>
  <div v-if="show" class="number-with-label-container" :style="{ width: size }" :id="id">
    <strong class="label">{{ label }}: </strong>
    <span class="data break-text">{{ data }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent } from "vue";

const props = defineProps({
  label: { type: String, required: true },
  data: { type: [Number, String], required: true },
  size: { type: String, default: "100%" },
  id: { type: String, default: "number-with-label" },
  show: { type: Boolean, required: true }
});

const asString = computed(() => {
  if (!props.data) return "None";
  if (typeof props.data === "number") return props.data.toString();
  else return props.data;
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
