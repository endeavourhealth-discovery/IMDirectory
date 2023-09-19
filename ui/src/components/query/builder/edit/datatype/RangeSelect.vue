<template>
  <div class="property-input-container">
    From:
    <ComparisonSelect :property="from" :datatype="datatype" :property-iri="propertyIri" />
    To:
    <ComparisonSelect :property="to" :datatype="datatype" :property-iri="propertyIri" />
  </div>
</template>

<script setup lang="ts">
import { Assignable } from "@im-library/interfaces/AutoGen";
import ComparisonSelect from "./ComparisonSelect.vue";

interface Props {
  propertyIri: string;
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
