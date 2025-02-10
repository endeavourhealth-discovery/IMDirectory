<template>
  <div id="match-summary-display" v-if="match.name">
    <Button text :icon="!matchExpanded ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" @click="toggle" />
    <span v-if="index > 0" :class="operator">{{ operator }}</span>
    <span>{{ match.name }}</span>
    <div v-if="matchExpanded">
      <span class="pl-8 text-gray-500">details:</span>
      <RecursiveMatchDisplay :inline="false" :match="match" :depth="1" :index="index" :operator="operator" :expanded="true" />
    </div>
  </div>

  <span v-else>
    <RecursiveMatchDisplay :inline="false" :match="match" :depth="0" :index="index" :operator="operator" :expanded="true" />
  </span>
</template>

<script setup lang="ts">
import { Match, Bool } from "@/interfaces/AutoGen";
import { ref, watch } from "vue";
import RecursiveMatchDisplay from "./RecursiveMatchDisplay.vue";

interface Props {
  match: Match;
  expanded: boolean;
  operator?: Bool;
  index: number;
}

const props = defineProps<Props>();
const matchExpanded = ref(props.expanded);

function toggle() {
  matchExpanded.value = !matchExpanded.value;
}

watch(
  () => props.expanded,
  newValue => {
    matchExpanded.value = newValue;
  }
);
</script>

<style scoped>
#match-summary-display:deep(.or) {
  color: var(--p-blue-500);
  padding-right: 0.3rem;
}

#match-summary-display:deep(.either) {
  color: var(--p-blue-500);
  padding-right: 0.3rem;
}

#match-summary-display:deep(.and) {
  color: var(--p-orange-500);
  padding-right: 0.3rem;
}
</style>
