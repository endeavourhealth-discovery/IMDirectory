<template>
  <div>from {{ rangeValue.from.operator }} {{ rangeValue.from.value }} to {{ rangeValue.to.operator }} {{ rangeValue.to.value }}</div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { Range } from "@im-library/interfaces/AutoGen";

const props = defineProps({
  rangeValue: { type: Object as PropType<Range>, required: true }
});
</script>

<style scoped></style>
