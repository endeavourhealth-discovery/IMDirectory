<template>
  <div>
    <div v-if="path.path">{{ path.path?.[0].name }} -> {{ path.typeOf?.name }} . {{ path.where?.[0]?.name }}</div>
    <div v-else>{{ path.where?.[0]?.name }}</div>
  </div>
</template>

<script setup lang="ts">
import { Match } from "@im-library/interfaces/AutoGen";
import { onMounted, watch } from "vue";
interface Props {
  path: Match;
}
const props = defineProps<Props>();

onMounted(async () => {});
</script>

<style scoped></style>
