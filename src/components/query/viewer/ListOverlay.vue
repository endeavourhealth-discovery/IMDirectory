<template>
  <div v-for="item in list">
    <div>{{ item.name }}</div>
  </div>
</template>

<script setup lang="ts">
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { Node } from "@/interfaces/AutoGen";
interface Props {
  list: Node[];
}
const props = defineProps<Props>();
</script>

<style scoped></style>
