<template>
  <InputGroup>
    <InputGroupAddon v-if="title">{{ title }}</InputGroupAddon>
    <Dropdown type="text" placeholder="operator" :options="operatorOptions" v-model="property.operator" />
    <InputText type="text" placeholder="value" v-model="property.value" />
    <Dropdown type="text" placeholder="unit" :options="unitOptions" v-model="property.unit" />
    <RelativeToSelect :property="property" :datatype="datatype" :property-iri="propertyIri" />
  </InputGroup>
</template>

<script setup lang="ts">
import { Assignable } from "@im-library/interfaces/AutoGen";
import RelativeToSelect from "./RelativeToSelect.vue";
const operatorOptions = ["=", ">=", ">", "<=", "<"];
const unitOptions = ["YEAR", "MONTH", "DATE", "DAY"];

interface Props {
  propertyIri: string;
  property: Assignable;
  datatype: string;
  title?: string;
}
const props = defineProps<Props>();
</script>

<style scoped>
.p-dropdown {
  height: 2.3rem;
}
</style>
