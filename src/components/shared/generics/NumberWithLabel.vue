<template>
  <div class="number-with-label-container" :style="{ width: size }" :id="id">
    <strong class="label">{{ label }}: </strong>
    <span class="data break-text">{{ data }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string;
  data: any;
  size?: string;
  id?: string;
}

withDefaults(defineProps<Props>(), {
  size: "100%",
  id: "number-with-label"
});
</script>

<style scoped>
.break-text {
  word-break: break-all;
}
</style>
