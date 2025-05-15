<template>
  <div v-for="(item, index) in list" v-bind:key="index">
    <div>{{ item.name }}</div>
  </div>
</template>

<script setup lang="ts">
import { Node } from "@/interfaces/AutoGen";

defineProps<{
  list: Node[];
}>();
</script>

<style scoped></style>
