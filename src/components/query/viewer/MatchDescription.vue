<template>
  <div v-if="match.description">
    <span :style="{ paddingLeft: depth * 2 + 'em', color: 'var(--p-blue-700)' }">{{ match.description }} </span>
  </div>
</template>

<script setup lang="ts">
import type { Query } from "@endeavour/vue-library/models";

interface Props {
  match: Query;
  depth: number;
}
const props = defineProps<Props>();
</script>
<style scoped>
.match-description {
  color: var(--p-blue-700);
  padding-left: 2rem;
}
</style>
