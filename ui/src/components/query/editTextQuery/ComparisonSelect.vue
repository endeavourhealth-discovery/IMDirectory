<template>
  <div class="comparison-wrapper">
    <Dropdown type="text" placeholder="operator" :options="operatorOptions" v-model="operator" />
    <InputText type="text" placeholder="value" v-model="value" />
    <Dropdown type="text" placeholder="unit" :options="unitOptions" v-model="unit" />
    <InputText type="text" placeholder="relative to" v-model="relativeTo" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, PropType, ref } from "vue";
import { Assignable, Where } from "@im-library/interfaces/AutoGen";
const operatorOptions = ["=", ">=", ">", "<="];
const unitOptions = ["YEAR", "MONTH", "DATE", "DAY"];
const props = defineProps({
  selectedComparison: { type: Object as PropType<Where | Assignable>, required: false },
  title: { type: String, required: false }
});
const value = ref();
const unit = ref();
const operator = ref();
const relativeTo = ref();
onMounted(async () => {});
</script>

<style scoped></style>
