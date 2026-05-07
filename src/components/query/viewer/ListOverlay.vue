<template>
  <div v-for="(item, index) in list" v-bind:key="index">
    <div>{{ item.name }}</div>
  </div>
</template>

<script setup lang="ts">
import type { Node } from "@endeavour/vue-library/interfaces";

defineProps<{
  list: Node[];
}>();
</script>

<style scoped></style>
