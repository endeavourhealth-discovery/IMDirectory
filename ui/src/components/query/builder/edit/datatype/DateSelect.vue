<template>
  <Dropdown :options="['is', 'between']" v-model:model-value="propertyType" />
  <div v-if="propertyType === 'between'">
    <Calendar v-model:model-value="selectedValueA" dateFormat="dd/mm/yy" />
    <span> and </span>
    <Calendar v-model:model-value="selectedValueB" dateFormat="dd/mm/yy" />
  </div>
  <div v-else-if="propertyType === 'is'">
    <Dropdown type="text" placeholder="operator" :options="operatorOptions" v-model="property.operator" />
    <Calendar v-model:model-value="selectedValueA" dateFormat="dd/mm/yy" />
  </div>
</template>

<script setup lang="ts">
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Property, Range } from "@im-library/interfaces/AutoGen";
import { cloneDeep } from "lodash";
import { Ref, onMounted, ref, watch } from "vue";
interface Props {
  property: Property;
}
const props = defineProps<Props>();
const propertyType: Ref<"is" | "between"> = ref("is");
const selectedValueA: Ref<any> = ref();
const selectedValueB: Ref<any> = ref();
const operatorOptions = ["=", ">=", ">", "<="];

onMounted(() => {
  if (props.property.value) selectedValueA.value = getDateFromString(props.property.value);
  if (props.property.operator === "=") propertyType.value = "is";
  else if (isObjectHasKeys(props.property, ["range"])) {
    propertyType.value = "between";
    if (props.property.range?.from.value) selectedValueA.value = getDateFromString(props.property.range!.from.value);
    if (props.property.range?.to.value) selectedValueB.value = getDateFromString(props.property.range!.to.value);
  }
});

watch(
  () => cloneDeep(selectedValueA.value),
  () => updatePropertyValues()
);

watch(
  () => cloneDeep(selectedValueB.value),
  () => updatePropertyValues()
);

function updatePropertyValues() {
  if (propertyType.value === "is") {
    delete props.property.range;
    if (selectedValueA.value) props.property.value = getStringFromDate(selectedValueA.value);
  } else if (propertyType.value === "between") {
    delete props.property.operator;
    delete props.property.value;
    delete props.property.unit;

    if (!isObjectHasKeys(props.property, ["range"]))
      props.property.range = { from: { operator: "=", unit: "DATE", value: "" }, to: { operator: "=", unit: "DATE", value: "" } } as Range;
    if (selectedValueA.value) props.property.range!.from.value = getStringFromDate(selectedValueA.value);
    if (selectedValueB.value) props.property.range!.to.value = getStringFromDate(selectedValueB.value);
  }
}

function getStringFromDate(date: Date) {
  return [date.getDate(), date.getMonth() + 1, date.getFullYear()].join("/");
}

function getDateFromString(date: string) {
  let separator = "";
  if (date.includes("-")) separator = "-";
  if (date.includes("/")) separator = "/";
  const splits = date.split(separator);
  if (splits.length !== 3) return new Date();

  const year = parseInt(splits[2]);
  const month = parseInt(splits[1]);
  const day = parseInt(splits[0]);
  return new Date(year, month - 1, day);
}
</script>

<style scoped></style>
