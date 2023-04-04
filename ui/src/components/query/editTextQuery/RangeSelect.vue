<template>
  <ComparisonSelect :selected-comparison="selectedRange.from" :title="'From:'" />
  <ComparisonSelect :selected-comparison="selectedRange.to" :title="'To:'" />
</template>

<script setup lang="ts">
import { Assignable, Range } from "@im-library/interfaces/AutoGen";
import Dropdown from "primevue/dropdown";
import { TreeNode } from "primevue/tree";
import { onMounted, PropType, Ref, ref } from "vue";
import ComparisonSelect from "./ComparisonSelect.vue";

const props = defineProps({
  selectedProperty: { type: Object as PropType<TreeNode>, required: true },
  selectedRange: { type: Object as PropType<Range>, required: true }
});
</script>

<style scoped></style>
