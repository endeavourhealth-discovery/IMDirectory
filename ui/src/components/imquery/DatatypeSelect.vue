<template>
  <div class="datatype-select">
    <div v-if="datatype === XSD.STRING" class="property-input-container">
      <Select
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

    <div v-else-if="datatype === XSD.BOOLEAN" class="property-input-container">
      <Select :options="booleanOptions" option-label="name" option-value="value" v-model:model-value="property.value" />
    </div>

    <div
      v-else-if="datatype === XSD.LONG || datatype === XSD.INTEGER || datatype === XSD.NUMBER || datatype === XSD.DECIMAL || datatype === IM.NUMERIC_VALUE"
      class="property-input-container"
    >
      <Select
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
      <div v-if="propertyType === 'is'" class="property-input">
        <Select type="text" placeholder="operator" :options="operatorOptions" v-model="property.operator" />
        <InputText type="text" placeholder="value" v-model="property.value" />
        <Select type="text" placeholder="unit" :options="unitOptions" v-model="property.unit" />
        <RelativeToSelect :property="property" :datatype="datatype" :property-iri="property['@id']!" />
      </div>
      <div v-else-if="propertyType === 'range'" class="property-input">
        <div class="property-range" v-if="property?.range?.from">
          <InputText :value="'From'" disabled class="property-input-title" />
          <Select type="text" placeholder="operator" :options="operatorOptions" v-model="property.range.from.operator" />
          <InputText type="text" placeholder="value" v-model="property.range.from.value" />
          <Select type="text" placeholder="unit" :options="unitOptions" v-model="property.range.from.unit" />
          <RelativeToSelect :property="property" :datatype="datatype" :property-iri="property['@id']!" />
        </div>
        <div class="property-range" v-if="property?.range?.to">
          <InputText :value="'To'" disabled class="property-input-title" />
          <Select type="text" placeholder="operator" :options="operatorOptions" v-model="property.range.to.operator" />
          <InputText type="text" placeholder="value" v-model="property.range.to.value" />
          <Select type="text" placeholder="unit" :options="unitOptions" v-model="property.range.to.unit" />
          <RelativeToSelect :property="property" :datatype="datatype" :property-iri="property['@id']!" />
        </div>
      </div>
    </div>
    <div v-else-if="datatype === IM.DATE_TIME" class="property-input-container">
      <DateSelect :property="property" :datatype="datatype" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref, watch } from "vue";
import { IM, XSD } from "@im-library/vocabulary";
import { Assignable, Range, Where, Operator } from "@im-library/interfaces/AutoGen";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import DateSelect from "./DateSelect.vue";
import RelativeToSelect from "./RelativeToSelect.vue";
interface Props {
  property: Where;
  datatype: string;
}

const props = defineProps<Props>();
const propertyType: Ref<string> = ref("");
const booleanOptions = [
  { name: "true", value: true },
  { name: "false", value: false }
];
const operatorOptions = ["=", ">=", ">", "<=", "<"];
const unitOptions = ["YEAR", "MONTH", "DATE", "DAY"];

watch(
  () => propertyType.value,
  () => {
    switch (propertyType.value) {
      case "range":
        props.property.operator = undefined;
        props.property.isNull = undefined;
        props.property.isNotNull = undefined;
        if (!props.property.range) props.property.range = { from: {} as Assignable, to: {} as Assignable } as Range;
        break;
      case "startsWith":
        delete props.property.range;
        props.property.isNull = undefined;
        props.property.isNotNull = undefined;
        props.property.operator = Operator.start;
        break;
      case "contains":
        delete props.property.range;
        props.property.isNull = undefined;
        props.property.isNotNull = undefined;
        props.property.operator = Operator.contains;
        break;
      case "is":
        delete props.property.range;
        props.property.isNull = undefined;
        props.property.isNotNull = undefined;
        if (!operatorOptions.includes(props.property.operator as string)) props.property.operator = Operator.eq;
        break;
      case "notNull":
        delete props.property.range;
        props.property.operator = undefined;
        props.property.isNull = undefined;
        props.property.isNotNull = true;
        break;
      case "isNull":
        delete props.property.range;
        props.property.operator = undefined;
        props.property.isNull = true;
        props.property.isNotNull = undefined;
        break;
      default:
        break;
    }
  }
);

onMounted(() => {
  if (isObjectHasKeys(props.property.range)) propertyType.value = "range";
  else if (props.property.operator === "startsWith" || props.property.operator === "contains") propertyType.value = props.property.operator;
  else if (props.property.isNull) propertyType.value = "isNull";
  else if (props.property.isNotNull) propertyType.value = "notNull";
  else if (props.datatype !== IM.DATE_TIME) propertyType.value = "is";
});
</script>

<style scoped>
.property-input-container {
  display: flex;
  flex-flow: row;
  align-items: baseline;
}

.property-input {
  display: flex;
  flex-flow: row;
  align-items: baseline;
  flex-wrap: wrap;
}

.property-input-title {
  width: 4rem;
}

.property-range {
  display: flex;
  flex-flow: row;
  align-items: baseline;
}
</style>
