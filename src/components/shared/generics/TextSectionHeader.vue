<template>
  <div :id="id" class="text-section-header-container" :style="{ width: size }">
    <strong class="text-section-header">
      {{ label }}
    </strong>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string;
  size?: string;
  id?: string;
}

withDefaults(defineProps<Props>(), {
  size: "100%",
  id: "text-section-header",
  show: true
});
</script>

<style scoped>
.text-section-header {
  font-size: 1.25rem;
}
</style>
