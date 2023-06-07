<template>From: <ComparisonSelect :where="where.range!.from" /> To: <ComparisonSelect :where="where.range!.to" /></template>

<script setup lang="ts">
import { Where, Range } from "@im-library/interfaces/AutoGen";

import ComparisonSelect from "./ComparisonSelect.vue";
import { PropType } from "vue";

interface Props {
  where: Where;
}

const props = defineProps<Props>();
</script>

<style scoped></style>
