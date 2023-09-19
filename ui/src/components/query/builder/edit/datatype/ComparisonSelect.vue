<template>
  <div class="comparison-wrapper">
    <Dropdown type="text" placeholder="operator" :options="operatorOptions" v-model="property.operator" />
    <InputText type="text" placeholder="value" v-model="property.value" />
    <Dropdown type="text" placeholder="unit" :options="unitOptions" v-model="property.unit" />
    <RelativeToSelect :property="property" :datatype="datatype" :property-iri="propertyIri" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Assignable } from "@im-library/interfaces/AutoGen";
import RelativeToSelect from "./RelativeToSelect.vue";
const operatorOptions = ["=", ">=", ">", "<="];
const unitOptions = ["YEAR", "MONTH", "DATE", "DAY"];

interface Props {
  propertyIri: string;
  property: Assignable;
  datatype: string;
}
const props = defineProps<Props>();
</script>

<style scoped>
.comparison-wrapper {
  display: flex;
  width: 100%;
  gap: 0.5rem;
}
</style>
