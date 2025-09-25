<template>
  <div v-if="match.description">
    <span :style="{ paddingLeft: depth * 2 + 'em', color: 'var(--p-blue-700)' }"> Then {{ match.description }} </span>
  </div>
  <div>
    <MatchDescription v-if="match.then" :match="match.then" :depth="depth + 1" />
  </div>
</template>

<script setup lang="ts">
import { Match } from "@/interfaces/AutoGen";
interface Props {
  match: Match;
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
