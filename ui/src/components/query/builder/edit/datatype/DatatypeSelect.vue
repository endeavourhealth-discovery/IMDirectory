<template>
  <div v-if="datatype === GRAPH.XMLS + 'string'" class="property-input-container">
    <Dropdown
      :options="[
        { id: 'is', name: 'is' },
        { id: 'startsWith', name: 'starts with' },
        { id: 'contains', name: 'contains' },
        { id: 'notNull', name: 'is recorded' },
        { id: 'isNull', name: 'is not recorded' }
      ]"
      optionValue="id"
      optionLabel="name"
      v-model:model-value="propertyType"
    />
    <InputText v-if="['is', 'startsWith', 'contains'].includes(propertyType)" type="text" v-model:model-value="property.value" />
  </div>
  <Dropdown
    v-else-if="datatype === GRAPH.XMLS + 'boolean'"
    :options="booleanOptions"
    option-label="name"
    option-value="value"
    v-model:model-value="property.value"
  />
  <div
    v-else-if="datatype === GRAPH.XMLS + 'long' || datatype === GRAPH.XMLS + 'integer' || datatype === GRAPH.XMLS + 'number'"
    class="property-input-container"
  >
    <Dropdown
      :options="[
        { id: 'is', name: 'is' },
        { id: 'range', name: 'in range' },
        { id: 'notNull', name: 'is recorded' },
        { id: 'isNull', name: 'is not recorded' }
      ]"
      optionValue="id"
      optionLabel="name"
      v-model:model-value="propertyType"
    />
    <ComparisonSelect v-if="propertyType === 'is'" :property="property" :datatype="datatype" :property-iri="property['@id']!" />
    <RangeSelect
      v-else-if="propertyType === 'range'"
      :property-iri="property['@id']!"
      :from="property.range!.from"
      :to="property.range!.to"
      :datatype="datatype"
    />
  </div>
  <div v-else-if="datatype === IM.NAMESPACE + 'DateTime'" class="property-input-container">
    <DateSelect :property="property" :datatype="datatype" />
  </div>
</template>

<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import { Ref, onMounted, ref, watch } from "vue";
import ComparisonSelect from "./ComparisonSelect.vue";
import RangeSelect from "./RangeSelect.vue";
import { IM, GRAPH } from "@im-library/vocabulary";
import { Assignable, Range, Property, Operator } from "@im-library/interfaces/AutoGen";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import DateSelect from "./DateSelect.vue";
interface Props {
  property: Property;
  datatype: string;
}

const props = defineProps<Props>();
const propertyType: Ref<string> = ref("");
const booleanOptions = [
  { name: "true", value: true },
  { name: "false", value: false }
];

watch(
  () => propertyType.value,
  () => {
    if (propertyType.value === "range" && !isObjectHasKeys(props.property, ["range"])) {
      props.property.operator = undefined;
      props.property.isNull = undefined;
      props.property.isNotNull = undefined;
      props.property.range = { from: {} as Assignable, to: {} as Assignable } as Range;
    } else if (propertyType.value === "startsWith") {
      delete props.property.range;
      props.property.isNull = undefined;
      props.property.isNotNull = undefined;
      props.property.operator = Operator.start;
    } else if (propertyType.value === "contains") {
      delete props.property.range;
      props.property.isNull = undefined;
      props.property.isNotNull = undefined;
      props.property.operator = Operator.contains;
    } else if (propertyType.value === "is") {
      delete props.property.range;
      props.property.isNull = undefined;
      props.property.isNotNull = undefined;
      props.property.operator = Operator.eq;
    } else if (propertyType.value === "notNull") {
      delete props.property.range;
      props.property.operator = undefined;
      props.property.isNull = undefined;
      props.property.isNotNull = true;
    } else if (propertyType.value === "isNull") {
      delete props.property.range;
      props.property.operator = undefined;
      props.property.isNull = true;
      props.property.isNotNull = undefined;
    }
  }
);

onMounted(() => {
  if (isObjectHasKeys(props.property.range)) propertyType.value = "range";
  else if (props.property.operator === "startsWith" || props.property.operator === "contains") propertyType.value = props.property.operator;
  else if (props.property.isNull) propertyType.value = "isNull";
  else if (props.property.isNotNull) propertyType.value = "notNull";
  else propertyType.value = "is";
});
</script>

<style scoped>
.property-input-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  gap: 0.5rem;
}
</style>
