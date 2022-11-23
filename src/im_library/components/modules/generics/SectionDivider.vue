<template>
  <div v-if="show" :style="{ width: size }" class="section-divider">
    <Divider />
  </div>
</template>

<script setup lang="ts">
import { defineComponent } from "@vue/runtime-core";

const props = defineProps({
  size: { type: String, default: "100%" },
  show: { type: Boolean }
});
</script>
