<template>
  <div class="property-input-container">
    From:
    <ComparisonSelect :property="from" :datatype="datatype" />
    To:
    <ComparisonSelect :property="to" :datatype="datatype" />
  </div>
</template>

<script setup lang="ts">
import { Assignable } from "@im-library/interfaces/AutoGen";
import ComparisonSelect from "./ComparisonSelect.vue";

interface Props {
  from: Assignable;
  to: Assignable;
  datatype: string;
}

const props = defineProps<Props>();
</script>

<style scoped>
.property-input-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  gap: 0.5rem;
}
</style>
