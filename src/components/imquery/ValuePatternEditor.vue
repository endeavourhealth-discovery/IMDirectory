<template>
  <Select
    :modelValue="dateRelativity"
    :options="relativityOptions"
    option-label="label"
    option-value="value"
    data-testid="relativity-selector"
    @update:modelValue="val => updateRelativity(val)"
  />
  <Select
    :modelValue="valueConstraintType"
    :options="valueConstraintTypeOptions"
    option-label="label"
    option-value="value"
    data-testid="comparator-type-selector"
  />
  <div v-if="valueConstraintType === 'is'">
    <ValueEditor :ui-property="uiProperty" v-model:assignable="property" :relativeTo="property.relativeTo" />
  </div>
  <div v-if="property.relativeTo">
    <span class="relative-to">relative to</span>
  </div>

  <RelativeToSelect
    v-if="property.relativeTo"
    v-model:property="property"
    :uiProperty="uiProperty"
    :property-iri="property.iri!"
    @update:property-ref="populateWithinDate"
  />

  <div v-else>
    <span>between</span>
  </div>
</template>

<script setup lang="ts">
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { Operator, Where, Range, Bool } from "@/interfaces/AutoGen";
import { cloneDeep } from "lodash-es";
import { Ref, onMounted, ref, watch } from "vue";
import RelativeToSelect from "./RelativeToSelect.vue";
import { IM } from "@/vocabulary";
import { UIProperty } from "@/interfaces";
import { relativityOptions, valueConstraintTypeOptions } from "@/helpers/QueryEditorOptions";
import ValueEditor from "@/components/imquery/ValueEditor.vue";

const props = defineProps<{
  uiProperty: UIProperty;
}>();

const property = defineModel<Where>("property", { default: {} });
const valueConstraintType: Ref<"is" | "range" | "isNull" | "notNull"> = ref("is");
const selectedValueA: Ref<any> = ref();
const selectedValueB: Ref<any> = ref();
const operatorOptions = ["=", ">=", ">", "<", "<="];
const numberValue: Ref<number> = ref(0);
const operator: Ref<Operator | undefined> = ref();
const sign: Ref<"-" | "+" | undefined> = ref();
const dateRelativity: Ref<string> = ref("relative");
const comparatorType: Ref<string> = ref("is");
onMounted(() => {
  initValues();
});

watch(
  () => cloneDeep(property.value),
  () => initValues()
);

function initValues() {
  if (property.value.range) valueConstraintType.value = "range";
  else valueConstraintType.value = "is";
  if (property.value.operator) operator.value = property.value.operator;
}

function populateBetweenDate() {
  delete property.value.operator;
  operator.value = undefined;
  delete property.value.value;
  delete property.value.unit;
  delete property.value.relativeTo;
  delete property.value.isNotNull;
  delete property.value.isNull;

  if (!isObjectHasKeys(property.value, ["range"]))
    property.value.range = {
      from: { operator: "=", unit: { iri: IM.DATE }, value: "" },
      to: { operator: "=", unit: { iri: IM.DATE }, value: "" }
    } as Range;
  if (selectedValueA.value) property.value.range!.from.value = getStringFromDate(selectedValueA.value);
  if (selectedValueB.value) property.value.range!.to.value = getStringFromDate(selectedValueB.value);
}

function populateWithinDate() {
  delete property.value.isNotNull;
  delete property.value.isNull;
  property.value.operator = operator.value;
  property.value.value = (sign.value === "-" ? "-" : "") + numberValue.value.toString();
  if (isObjectHasKeys(property.value)) {
    property.value.relativeTo = property.value;
  } else {
    property.value.relativeTo = {
      parameter: "$referenceDate"
    };
  }
}

function clearAllProperties() {
  delete property.value.operator;
  delete property.value.value;
  delete property.value.unit;
  delete property.value.relativeTo;
  delete property.value.isNull;
  delete property.value.isNotNull;
  delete property.value.range;
  selectedValueA.value = undefined;
  selectedValueB.value = undefined;
  numberValue.value = 0;
  operator.value = undefined;
  sign.value = undefined;
}

function getStringFromDate(date: Date) {
  if (!date) return "";
  return [date.getDate(), date.getMonth() + 1, date.getFullYear()].join("/");
}

function getDateFromString(date: string) {
  if (date) {
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
}
function updateRelativity(val: string) {
  if (val === "relative") {
    if (!property.value.relativeTo) property.value.relativeTo = {};
  } else delete property.value.relativeTo;
}
</script>

<style scoped>
.property-input-title-and {
  width: 3rem;
}
.relative-to {
  padding-left: 1rem;
  padding-right: 1rem;
}
</style>
