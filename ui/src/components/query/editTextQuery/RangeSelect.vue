<template>From: <ComparisonSelect :where="range.from" /> To: <ComparisonSelect :where="range.to" /></template>

<script setup lang="ts">
import { Where, Range } from "@im-library/interfaces/AutoGen";

import ComparisonSelect from "./ComparisonSelect.vue";
import { PropType } from "vue";

const props = defineProps({
  range: { type: Object as PropType<Range>, required: true }
});
</script>

<style scoped></style>
