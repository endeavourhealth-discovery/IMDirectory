<template>From: <ComparisonSelect :where="from" /> To: <ComparisonSelect :where="to" /></template>

<script setup lang="ts">
import { Assignable } from "@im-library/interfaces/AutoGen";
import ComparisonSelect from "./ComparisonSelect.vue";

interface Props {
  from: Assignable;
  to: Assignable;
}

const props = defineProps<Props>();
</script>

<style scoped></style>
