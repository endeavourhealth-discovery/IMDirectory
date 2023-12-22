<template>
  <div :style="{ width: size }" class="section-divider">
    <Divider />
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: "100%"
});
</script>
