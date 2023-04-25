<template>From: <ComparisonSelect /> To: <ComparisonSelect /></template>

<script setup lang="ts">
import { Assignable, Range } from "@im-library/interfaces/AutoGen";
import Dropdown from "primevue/dropdown";
import { TreeNode } from "primevue/tree";
import { onMounted, PropType, Ref, ref } from "vue";
import ComparisonSelect from "./ComparisonSelect.vue";

const props = defineProps({
  selectedProperty: { type: Object as PropType<TreeNode>, required: false },
  selectedRange: { type: Object as PropType<Range>, required: false }
});

const selectedValue: Ref<any> = ref();
const unit = ref();
const operator = ref();
const relativeTo = ref();

const from = ref({
  value: "",
  unit: "",
  operator: "",
  relativeTo: ""
});

const to = ref({
  value: "",
  unit: "",
  operator: "",
  relativeTo: ""
});
</script>

<style scoped></style>
