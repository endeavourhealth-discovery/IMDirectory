<template>
  <Dropdown
    :options="[
      { id: 'is', name: 'is' },
      { id: 'between', name: 'between' },
      { id: 'within', name: 'within' },
      { id: 'isNull', name: 'is not recorded' },
      { id: 'notNull', name: 'is recorded' }
    ]"
    optionValue="id"
    optionLabel="name"
    v-model:model-value="propertyType"
  />
  <div v-if="propertyType === 'between'">
    <Calendar v-model:model-value="selectedValueA" dateFormat="dd/mm/yy" />
    <InputText value="and" disabled class="property-input-title-and" />
    <Calendar v-model:model-value="selectedValueB" dateFormat="dd/mm/yy" />
  </div>
  <div v-else-if="propertyType === 'is'" class="flex">
    <Dropdown type="text" placeholder="operator" :options="operatorOptions" v-model="operator" />
    <Dropdown type="text" placeholder="value type" :options="['date', 'variable']" v-model="valueType" />
    <Calendar v-if="valueType === 'date'" v-model:model-value="selectedValueA" dateFormat="dd/mm/yy" />
    <RelativeToSelect
      v-else-if="valueType === 'variable'"
      v-model:propertyRef="propertyRef"
      :property="property"
      :datatype="datatype"
      :property-iri="property['@id']!"
    />
  </div>
  <div v-else-if="propertyType === 'within'">
    <SelectButton v-model="sign" :options="['the last', 'the next']" />
    <!-- <InputText value="the last" disabled class="property-input-title" /> -->
    <InputNumber v-model:model-value="numberValue" />
    <!-- TODO: model Date options and get from API -->
    <Dropdown
      :options="[
        { id: 'Minute', name: 'minute(s)' },
        { id: 'Hour', name: 'hour(s)' },
        { id: 'Day', name: 'day(s)' },
        { id: 'MONTHS', name: 'month(s)' },
        { id: 'Year', name: 'year(s)' }
      ]"
      optionValue="id"
      optionLabel="name"
      v-model:model-value="unit"
    />
    <RelativeToSelect v-model:propertyRef="propertyRef" :property="property" :datatype="datatype" :property-iri="property['@id']!" />
  </div>
</template>

<script setup lang="ts">
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Operator, Where, PropertyRef, Range } from "@im-library/interfaces/AutoGen";
import { cloneDeep, property } from "lodash";
import { Ref, onMounted, ref, watch } from "vue";
import RelativeToSelect from "./RelativeToSelect.vue";
import Dropdown from "primevue/dropdown";

interface Props {
  property: Where;
  datatype: string;
}
const props = defineProps<Props>();
const propertyType: Ref<"is" | "between" | "within" | "isNull" | "notNull" | undefined> = ref();
const valueType: Ref<"date" | "variable"> = ref("date");
const selectedValueA: Ref<any> = ref();
const selectedValueB: Ref<any> = ref();
const operatorOptions = ["=", ">=", ">", "<="];
const numberValue: Ref<number> = ref(0);
const operator: Ref<Operator | undefined> = ref();
const unit: Ref<string | undefined> = ref();
const propertyRef: Ref<PropertyRef> = ref({});
const sign: Ref<"the last" | "the next" | undefined> = ref();

onMounted(async () => {
  await initValues();
});

watch(
  () => numberValue.value,
  () => updatePropertyValues()
);

watch(
  () => cloneDeep(selectedValueA.value),
  () => updatePropertyValues()
);

watch(
  () => cloneDeep(selectedValueB.value),
  () => updatePropertyValues()
);

watch(
  () => cloneDeep(operator.value),
  () => updatePropertyValues()
);

watch(
  () => cloneDeep(propertyRef.value),
  () => updatePropertyValues()
);

watch(
  () => propertyType.value,
  () => updatePropertyValues()
);

watch(
  () => unit.value,
  () => updatePropertyValues()
);

async function initValues() {
  if (props.property.operator) operator.value = props.property.operator;

  if (props.property.value) {
    if (isNumber(props.property.value)) {
      propertyType.value = "within";
      numberValue.value = Number(props.property.value.replace("-", ""));
      unit.value = props.property.unit;
    } else if (props.property.relativeTo) {
      propertyRef.value = props.property.relativeTo;
    } else {
      propertyType.value = "is";
      selectedValueA.value = getDateFromString(props.property.value);
    }
  } else if (isObjectHasKeys(props.property, ["range"])) {
    propertyType.value = "between";
    if (props.property.range?.from.value) selectedValueA.value = getDateFromString(props.property.range!.from.value);
    if (props.property.range?.to.value) selectedValueB.value = getDateFromString(props.property.range!.to.value);
  } else if (props.property.relativeTo) {
    propertyType.value = "is";
    valueType.value = "variable";
  } else if (props.property.isNull) {
    propertyType.value = "isNull";
  } else if (props.property.isNotNull) {
    propertyType.value = "notNull";
  } else {
    propertyType.value = "is";
  }
}

function isNumber(stringNumber: string) {
  return /^-?\d+$/.test(stringNumber);
}

function updatePropertyValues() {
  clearAllProperties();
  if (propertyType.value === "is") {
    if (selectedValueA.value && valueType.value === "date") {
      props.property.value = getStringFromDate(selectedValueA.value);
      props.property.operator = operator.value;
    } else if (isObjectHasKeys(propertyRef.value)) {
      props.property.operator = operator.value;
      props.property.relativeTo = propertyRef.value;
    }
  } else if (propertyType.value === "between") {
    if (!isObjectHasKeys(props.property, ["range"]))
      props.property.range = { from: { operator: "=", unit: "DATE", value: "" }, to: { operator: "=", unit: "DATE", value: "" } } as Range;
    if (selectedValueA.value) props.property.range!.from.value = getStringFromDate(selectedValueA.value);
    if (selectedValueB.value) props.property.range!.to.value = getStringFromDate(selectedValueB.value);
  } else if (propertyType.value === "within") {
    props.property.unit = unit.value;
    props.property.operator = Operator.gte;
    props.property.value = "-" + numberValue.value.toString();
    props.property.relativeTo = {
      parameter: "$referenceDate"
    };
  } else if (propertyType.value === "isNull") {
    props.property.isNull = true;
  } else if (propertyType.value === "notNull") {
    props.property.isNotNull = true;
  }
}

function clearAllProperties() {
  delete props.property.operator;
  delete props.property.value;
  delete props.property.unit;
  delete props.property.relativeTo;
  delete props.property.isNull;
  delete props.property.isNotNull;
  delete props.property.range;
}

function getStringFromDate(date: Date) {
  return [date.getDate(), date.getMonth() + 1, date.getFullYear()].join("/");
}

function getDateFromString(date: string) {
  let separator = "";
  if (date.includes("-")) separator = "-";
  else if (date.includes("/")) separator = "/";
  const splits = date.split(separator);
  if (splits.length !== 3) return new Date();

  const year = parseInt(splits[2]);
  const month = parseInt(splits[1]);
  const day = parseInt(splits[0]);
  return new Date(year, month - 1, day);
}
</script>

<style scoped>
.property-input-title {
  width: 5rem;
}
.property-input-title-and {
  width: 3rem;
}
</style>
