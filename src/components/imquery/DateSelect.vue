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
    @change="handlePropertyType"
  />
  <div v-if="propertyType === 'is'" class="flex">
    <Select type="text" placeholder="operator" :options="operatorOptions" v-model="operator" @change="populateIsDate" />
    <Select
      class="value-type"
      type="text"
      placeholder="value type"
      :options="['date', 'variable', 'partial date']"
      v-model="valueType"
      @change="populateIsDate"
    />
    <DatePicker v-if="valueType === 'date'" v-model:model-value="selectedValueA" dateFormat="dd/mm/yy" @update:model-value="populateIsDate" />
    <div v-else-if="valueType === 'partial date'">
      <Select
        v-if="uiProperty.qualifierOptions"
        class="qualifier-select"
        type="text"
        placeholder="qualifier"
        :options="uiProperty.qualifierOptions"
        v-model="property.unit"
        option-label="name"
      />
      <InputText data-testid="property-value-input" v-model="property.value" :use-grouping="false" />
    </div>
    <RelativeToSelect
      v-else-if="valueType === 'variable'"
      v-model:propertyRef="propertyRef"
      :property="property"
      :datatype="uiProperty.valueType"
      :property-iri="property.iri!"
      @update:property-ref="populateIsDate"
    />
  </div>
  <div v-else-if="propertyType === 'between'">
    <DatePicker v-model:model-value="selectedValueA" dateFormat="dd/mm/yy" @update:model-value="populateBetweenDate" />
    <InputText value="and" disabled class="property-input-title-and" @change="populateBetweenDate" />
    <DatePicker v-model:model-value="selectedValueB" dateFormat="dd/mm/yy" @update:model-value="populateBetweenDate" />
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
      @change="populateWithinDate"
    />
    <InputNumber v-model:model-value="numberValue" @update:model-value="populateWithinDate" />
    <Select
      v-if="uiProperty.unitOptions"
      type="text"
      placeholder="units"
      :options="uiProperty.unitOptions"
      v-model="property.unit"
      option-label="name"
      @change="populateWithinDate"
    />
    <RelativeToSelect
      v-model:propertyRef="propertyRef"
      :property="property"
      :datatype="uiProperty.valueType"
      :property-iri="property.iri!"
      @update:property-ref="populateWithinDate"
    />
  </div>
</template>

<script setup lang="ts">
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { Operator, Where, Range } from "@/interfaces/AutoGen";
import { cloneDeep } from "lodash-es";
import { Ref, onMounted, ref, watch } from "vue";
import RelativeToSelect from "./RelativeToSelect.vue";
import { IM } from "@/vocabulary";
import { UIProperty } from "@/interfaces";

const props = defineProps<{
  property: Where;
  uiProperty: UIProperty;
}>();

const propertyType: Ref<"is" | "between" | "within" | "isNull" | "notNull" | undefined> = ref();
const valueType: Ref<"date" | "variable" | "partial date" | undefined> = ref("date");
const selectedValueA: Ref<any> = ref();
const selectedValueB: Ref<any> = ref();
const operatorOptions = ["=", ">=", ">", "<", "<="];
const numberValue: Ref<number> = ref(0);
const operator: Ref<Operator | undefined> = ref();
const propertyRef: Ref<Where | undefined> = ref({});
const sign: Ref<"-" | "+" | undefined> = ref();

onMounted(() => {
  initValues();
});

watch(
  () => cloneDeep(props.property),
  () => initValues()
);

function initValues() {
  if (props.property.operator) operator.value = props.property.operator;
  if (props.property.relativeTo) propertyRef.value = props.property.relativeTo;

  if (props.property.value) {
    if (isNumber(props.property.value) && props.property.relativeTo) {
      propertyType.value = "within";
      if (props.property.value.includes("-")) sign.value = "-";
      else sign.value = "+";
      numberValue.value = Number(props.property.value.replace("-", ""));
    } else if (props.property.unit) {
      propertyType.value = "is";
      valueType.value = "partial date";
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
  } else if (!propertyType.value) {
    propertyType.value = "is";
  }
}

function handlePropertyType() {
  clearAllProperties();
  switch (propertyType.value) {
    case "is":
      props.property.operator = Operator.eq;
      operator.value = props.property.operator;
      break;
    case "between":
      props.property.range = {
        from: { operator: "=", unit: { iri: IM.DATE }, value: "" },
        to: { operator: "=", unit: { iri: IM.DATE }, value: "" }
      } as Range;
      break;
    case "within":
      props.property.operator = Operator.eq;
      operator.value = props.property.operator;
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

function isNumber(stringNumber: string) {
  return /^-?\d+$/.test(stringNumber);
}

function populateIsDate() {
  delete props.property.isNotNull;
  delete props.property.isNull;
  delete props.property.unit;
  selectedValueB.value = undefined;
  sign.value = undefined;
  props.property.operator = operator.value;
  if (valueType.value === "date") {
    props.property.value = getStringFromDate(selectedValueA.value);
    delete props.property.relativeTo;
    propertyRef.value = undefined;
  } else if (valueType.value === "variable") props.property.relativeTo = propertyRef.value;
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
    props.property.range = {
      from: { operator: "=", unit: { iri: IM.DATE }, value: "" },
      to: { operator: "=", unit: { iri: IM.DATE }, value: "" }
    } as Range;
  if (selectedValueA.value) props.property.range!.from.value = getStringFromDate(selectedValueA.value);
  if (selectedValueB.value) props.property.range!.to.value = getStringFromDate(selectedValueB.value);
}

function populateWithinDate() {
  delete props.property.isNotNull;
  delete props.property.isNull;
  props.property.operator = operator.value;
  props.property.value = (sign.value === "-" ? "-" : "") + numberValue.value.toString();
  if (isObjectHasKeys(propertyRef.value)) {
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

  valueType.value = undefined;
  selectedValueA.value = undefined;
  selectedValueB.value = undefined;
  numberValue.value = 0;
  operator.value = undefined;
  propertyRef.value = undefined;
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
</script>

<style scoped>
.property-input-title-and {
  width: 3rem;
}
</style>
