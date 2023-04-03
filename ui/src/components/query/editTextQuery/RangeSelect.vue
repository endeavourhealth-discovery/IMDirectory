<template>
  <div v-if="!selectedRange">no</div>
  From:
  <div class="range-wrapper">
    <InputText type="text" placeholder="value" v-model="selectedRange.from.value" />
    <Dropdown type="text" placeholder="unit" :options="unitOptions" v-model="selectedRange.from.unit" />
    <Dropdown type="text" placeholder="operator" :options="operatorOptions" v-model="selectedRange.from.operator" />
    <InputText type="text" placeholder="relative to" v-model="selectedRange.from.relativeTo" />
  </div>
  To:
  <div class="range-wrapper">
    <InputText type="text" placeholder="value" v-model="selectedRange.to.value" />
    <Dropdown type="text" placeholder="unit" :options="unitOptions" v-model="selectedRange.to.unit" />
    <Dropdown type="text" placeholder="operator" :options="operatorOptions" v-model="selectedRange.to.operator" />
    <InputText type="text" placeholder="relative to" v-model="selectedRange.to.relativeTo" />
  </div>
</template>

<script setup lang="ts">
import { Assignable, Range } from "@im-library/interfaces/AutoGen";
import Dropdown from "primevue/dropdown";
import { TreeNode } from "primevue/tree";
import { onMounted, PropType, Ref, ref } from "vue";

const operatorOptions = ["=", ">=", ">", "<=", "startsWith", "contains"];
const unitOptions = ["YEAR", "MONTH", "DATE", "DAY"];

const props = defineProps({
  selectedProperty: { type: Object as PropType<TreeNode>, required: true },
  selectedRange: { type: Object as PropType<Range>, required: true }
});
</script>

<style scoped>
.range-wrapper {
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  height: 100%;
}
</style>
