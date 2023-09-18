<template>
  <Dropdown :options="['is', 'between', 'within']" v-model:model-value="propertyType" />
  <div v-if="propertyType === 'between'">
    <Calendar v-model:model-value="selectedValueA" dateFormat="dd/mm/yy" />
    <span> and </span>
    <Calendar v-model:model-value="selectedValueB" dateFormat="dd/mm/yy" />
  </div>
  <div v-else-if="propertyType === 'is'">
    <Dropdown type="text" placeholder="operator" :options="operatorOptions" v-model="property.operator" />
    <Dropdown type="text" placeholder="value type" :options="['date', 'variable']" v-model="valueType" />
    <Calendar v-if="valueType === 'date'" v-model:model-value="selectedValueA" dateFormat="dd/mm/yy" />
    <RelativeToSelect v-else-if="valueType === 'variable'" :property="property" :datatype="datatype" />
  </div>
  <div v-else-if="propertyType === 'within'">
    the last <InputNumber v-model:model-value="numberValue" />
    <!-- TODO: model Date options and get from API -->
    <Dropdown :options="['Minute', 'Hour', 'Day', 'MONTHS', 'Year']" v-model:model-value="property.unit" />
  </div>
</template>

<script setup lang="ts">
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Property, Range } from "@im-library/interfaces/AutoGen";
import { cloneDeep } from "lodash";
import { Ref, onMounted, ref, watch } from "vue";
import RelativeToSelect from "./RelativeToSelect.vue";

interface Props {
  property: Property;
  datatype: string;
}
const props = defineProps<Props>();
const propertyType: Ref<"is" | "between" | "within"> = ref("is");
const valueType: Ref<"date" | "variable"> = ref("date");
const selectedValueA: Ref<any> = ref();
const selectedValueB: Ref<any> = ref();
const operatorOptions = ["=", ">=", ">", "<="];
const numberValue: Ref<number> = ref(0);

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

async function initValues() {
  if (props.property.value) {
    if (isNumber(props.property.value)) {
      propertyType.value = "within";
      numberValue.value = ~~props.property.value;
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
  }
}

function isNumber(stringNumber: string) {
  return /^-?\d+$/.test(stringNumber);
}

function updatePropertyValues() {
  if (propertyType.value === "is") {
    delete props.property.range;

    if (selectedValueA.value && valueType.value === "date") {
      props.property.value = getStringFromDate(selectedValueA.value);
      delete props.property.relativeTo;
    }
  } else if (propertyType.value === "between") {
    delete props.property.operator;
    delete props.property.value;
    delete props.property.unit;
    delete props.property.relativeTo;

    if (!isObjectHasKeys(props.property, ["range"]))
      props.property.range = { from: { operator: "=", unit: "DATE", value: "" }, to: { operator: "=", unit: "DATE", value: "" } } as Range;
    if (selectedValueA.value) props.property.range!.from.value = getStringFromDate(selectedValueA.value);
    if (selectedValueB.value) props.property.range!.to.value = getStringFromDate(selectedValueB.value);
  } else if (propertyType.value === "within") {
    delete props.property.range;
    props.property.value = numberValue.value.toString();
  }
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

<style scoped></style>
