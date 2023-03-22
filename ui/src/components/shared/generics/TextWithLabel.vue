<template>
  <div v-if="show" class="text-with-label-container" :id="id" :style="{ width: size }">
    <strong class="label">{{ label }}: </strong>
    <span
      class="data break-text"
      v-tooltip="'Copy to clipboard'"
      v-clipboard:copy="copyToClipboard"
      v-clipboard:success="onCopy"
      v-clipboard:error="onCopyError"
    >
      {{ data ? data : "None" }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ToastSeverity } from "@im-library/enums";
import { ToastOptions } from "@im-library/models";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const props = defineProps({
  label: { type: String, required: true },
  data: { type: String, required: false },
  size: { type: String, default: "100%" },
  id: { type: String, default: "text-with-label" },
  show: { type: Boolean, required: true }
});

function copyToClipboard(): string {
  return props.data!;
}

function onCopy(): void {
  toast.add(new ToastOptions(ToastSeverity.SUCCESS, props.label + " copied to clipboard"));
}

function onCopyError(): void {
  toast.add(new ToastOptions(ToastSeverity.ERROR, props.label + " copied to clipboard"));
}
</script>

<style scoped>
.text-with-label-container {
  padding: 0.25rem 0.5rem 0 0;
}
.break-text {
  word-break: break-all;
}

.data {
  cursor: pointer;
}
</style>
