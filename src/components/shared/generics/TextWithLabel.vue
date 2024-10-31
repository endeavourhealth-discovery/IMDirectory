<template>
  <div class="text-with-label-container" :id="id" :style="{ width: size }">
    <strong class="label">{{ label }}: </strong>
    <span class="data break-text" v-tooltip="'Copy to clipboard'" v-clipboard:copy="props.data" v-clipboard:success="onCopy" v-clipboard:error="onCopyError">
      {{ data ? data : "None" }}
    </span>
  </div>
</template>

<script setup lang="ts">
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";

interface Props {
  label: string;
  data?: string;
  size?: string;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: "100%",
  id: "text-with-label"
});

const { onCopy, onCopyError } = setupCopyToClipboard(undefined, props.label + " copied to clipboard", props.label + " failed to copy to clipboard");
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
