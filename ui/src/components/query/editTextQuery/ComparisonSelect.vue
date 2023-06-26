<template>
  <div class="comparison-wrapper">
    <Dropdown type="text" placeholder="operator" :options="operatorOptions" v-model="where.operator" />
    <InputText type="text" placeholder="value" v-model="where.value" />
    <Dropdown type="text" placeholder="unit" :options="unitOptions" v-model="where.unit" />
    <InputText type="text" placeholder="relative to" v-model="relativeTo" />
  </div>
</template>

<script setup lang="ts">
import { PropType, ref, Ref } from "vue";
import { Assignable, Where } from "@im-library/interfaces/AutoGen";
const operatorOptions = ["=", ">=", ">", "<="];
const unitOptions = ["YEAR", "MONTH", "DATE", "DAY"];

interface Props {
  where: Where;
}

const props = defineProps<Props>();

const relativeTo = ref();
</script>

<style scoped>
.comparison-wrapper {
  display: flex;
  width: 100%;
  gap: 0.5rem;
}
</style>
