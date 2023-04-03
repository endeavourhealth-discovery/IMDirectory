<template>
  Value:
  <div class="comparison-wrapper">
    <InputText type="text" placeholder="value" v-model="selectedComparison.value" />
    <Dropdown type="text" placeholder="unit" :options="unitOptions" v-model="selectedComparison.unit" />
    <Dropdown type="text" placeholder="operator" :options="operatorOptions" v-model="selectedComparison.operator" />
    <InputText type="text" placeholder="relative to" v-model="selectedComparison.relativeTo" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, PropType } from "vue";
import { Assignable, Where } from "@im-library/interfaces/AutoGen";
const operatorOptions = ["=", ">=", ">", "<=", "startsWith", "contains"];
const unitOptions = ["YEAR", "MONTH", "DATE", "DAY"];
const props = defineProps({
  selectedComparison: { type: Object as PropType<Where | Assignable>, required: true }
});
</script>

<style scoped></style>
