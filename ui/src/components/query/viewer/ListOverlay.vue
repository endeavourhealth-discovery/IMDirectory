<template>
  <div v-for="item in list">
    <div>{{ item.name }}</div>
  </div>
</template>

<script setup lang="ts">
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Node } from "@im-library/interfaces/AutoGen";
interface Props {
  list: Node[];
}
const props = defineProps<Props>();
</script>

<style scoped></style>
