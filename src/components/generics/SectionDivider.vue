<template>
  <div v-if="show" :style="{ width: size }">
    <Divider />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  name: "SectionDivider",
  props: {
    size: { type: String },
    show: { type: Boolean }
  }
});
</script>
