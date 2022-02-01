<template>
  <div v-if="show" class="text-section-header-container" :style="{ width: size }">
    <strong class="text-section-header">
      {{ label }}
    </strong>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  name: "TextSectionHeader",
  props: {
    label: { type: String },
    size: { type: String },
    id: { type: String },
    show: { type: Boolean }
  }
});
</script>

<style scoped>
.text-section-header {
  font-size: 1.25rem;
}
</style>
