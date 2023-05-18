<template>
  <div v-if="show" :id="id" class="text-section-header-container" :style="{ width: size }">
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
  show: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: "100%",
  id: "text-section-header"
});
</script>

<style scoped>
.text-section-header {
  font-size: 1.25rem;
}
</style>
