<template>
  {{ variableName }}
</template>

<script setup lang="ts">
import { Match, Query, Where } from "@im-library/interfaces/AutoGen";
import { PropType, onMounted, watch } from "vue";
const props = defineProps({
  fullQuery: { type: Object as PropType<Query>, required: true },
  variableName: { type: String, required: true }
});

onMounted(async () => {});

// function findNestedQuery() {
//   for (const match of props.fullQuery.match) {
//     const found = findRecursively(match)
//     if()
//   }
// }

// function findRecursively(matchOrWhere: Match | Where) {
// if(matchOrWhere instanceof Match){

// }
// }
</script>

<style scoped></style>
