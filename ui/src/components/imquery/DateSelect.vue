<template>
  <Select
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
  <div v-if="propertyType === 'is'" class="flex">
    <Select type="text" placeholder="operator" :options="operatorOptions" v-model="operator" />
    <Select type="text" placeholder="value type" :options="['date', 'variable']" v-model="valueType" />
    <DatePicker v-if="valueType === 'date'" v-model:model-value="selectedValueA" dateFormat="dd/mm/yy" />
    <RelativeToSelect
      v-else-if="valueType === 'variable'"
      v-model:propertyRef="propertyRef"
      :property="property"
      :datatype="datatype"
      :property-iri="property['@id']!"
    />
  </div>
  <div v-else-if="propertyType === 'between'">
    <DatePicker v-model:model-value="selectedValueA" dateFormat="dd/mm/yy" />
    <InputText value="and" disabled class="property-input-title-and" />
    <DatePicker v-model:model-value="selectedValueB" dateFormat="dd/mm/yy" />
  </div>
  <div v-else-if="propertyType === 'within'" class="flex items-baseline">
    <SelectButton
      v-model="sign"
      :options="[
        { id: '-', name: 'the last' },
        { id: '+', name: 'the next' }
      ]"
      optionValue="id"
      optionLabel="name"
      class="flex items-baseline"
    />
    <InputNumber v-model:model-value="numberValue" />
    <!-- TODO: model Date options and get from API -->
    <Select
      :options="[
        { id: 'minute', name: 'minute(s)' },
        { id: 'hour', name: 'hour(s)' },
        { id: 'day', name: 'day(s)' },
        { id: 'month', name: 'month(s)' },
        { id: 'year', name: 'year(s)' }
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
import { cloneDeep } from "lodash-es";
import { Ref, onMounted, ref, watch } from "vue";
import RelativeToSelect from "./RelativeToSelect.vue";

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
const sign: Ref<"-" | "+" | undefined> = ref();

onMounted(() => {
  initValues();
});

watch(
  () => propertyType.value,
  () => updatePropertyValues()
);

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
  () => unit.value,
  () => updatePropertyValues()
);

watch(
  () => sign.value,
  () => updatePropertyValues()
);

function initValues() {
  if (props.property.operator) operator.value = props.property.operator;

  if (props.property.value) {
    if (isNumber(props.property.value)) {
      propertyType.value = "within";
      if (props.property.value.includes("-")) sign.value = "-";
      else sign.value = "+";
      numberValue.value = Number(props.property.value.replace("-", ""));
      unit.value = props.property.unit;
    } else {
      selectedValueA.value = getDateFromString(props.property.value);
      propertyType.value = "is";
    }
    if (props.property.relativeTo) {
      valueType.value = "variable";
      propertyRef.value = props.property.relativeTo;
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
  switch (propertyType.value) {
    case "is":
      populateIsDate();
      break;
    case "between":
      populateBetweenDate();
      break;
    case "within":
      populateWithinDate();
      break;
    case "isNull":
      props.property.isNull = true;
      break;
    case "notNull":
      props.property.isNotNull = true;
      break;

    default:
      break;
  }
}

function populateIsDate() {
  delete props.property.isNotNull;
  delete props.property.isNull;
  selectedValueB.value = undefined;
  sign.value = undefined;

  props.property.operator = operator.value;
  if (valueType.value === "date") props.property.value = getStringFromDate(selectedValueA.value);
  else if (valueType.value === "variable") props.property.relativeTo = propertyRef.value;
}

function populateBetweenDate() {
  delete props.property.operator;
  operator.value = undefined;
  delete props.property.value;
  delete props.property.unit;
  delete props.property.relativeTo;
  delete props.property.isNotNull;
  delete props.property.isNull;

  if (!isObjectHasKeys(props.property, ["range"]))
    props.property.range = { from: { operator: "=", unit: "DATE", value: "" }, to: { operator: "=", unit: "DATE", value: "" } } as Range;
  if (selectedValueA.value) props.property.range!.from.value = getStringFromDate(selectedValueA.value);
  if (selectedValueB.value) props.property.range!.to.value = getStringFromDate(selectedValueB.value);
}

function populateWithinDate() {
  delete props.property.isNotNull;
  delete props.property.isNull;

  props.property.unit = unit.value;
  props.property.operator = operator.value;
  props.property.value = (sign.value === "-" ? "-" : "") + numberValue.value.toString();
  if (isObjectHasKeys(propertyRef.value)) {
    props.property.operator = operator.value;
    props.property.relativeTo = propertyRef.value;
  } else {
    props.property.relativeTo = {
      parameter: "$referenceDate"
    };
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
  if (!date) return "";
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
