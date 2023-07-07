<template>
  <div class="property-input-container">
    From:
    <ComparisonSelect :property="from" />
    To:
    <ComparisonSelect :property="to" />
  </div>
</template>

<script setup lang="ts">
import { Assignable } from "@im-library/interfaces/AutoGen";
import ComparisonSelect from "./ComparisonSelect.vue";

interface Props {
  from: Assignable;
  to: Assignable;
}

const props = defineProps<Props>();
</script>

<style scoped>
.property-input-container {
  flex-flow: wrap;
}
</style>
