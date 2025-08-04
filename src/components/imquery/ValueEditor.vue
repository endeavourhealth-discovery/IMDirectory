<template>
  <Select
    v-if="!fromOrTo"
    :modelValue="operator"
    :options="operatorOptions(uiProperty.valueType)"
    scroll-height="50rem"
    option-label="label"
    option-value="value"
    data-testid="operator-selector"
    @update:modelValue="updateOperator"
  >
    <template #option="slotProps">
      <div class="flex items-center" v-tooltip="slotProps.option.tooltip" style="min-height: 1rem">
        <div>{{ slotProps.option.label }}</div>
      </div>
    </template>
  </Select>

  <template v-if="offset != '0' || absolute">
    <DatePicker
      v-if="(IM.DATE + IM.TIME).includes(uiProperty.valueType) && !relativeTo"
      v-model:model-value="date"
      dateFormat="dd/mm/yy"
      @update:model-value="updateValue"
    />
    <InputNumber v-else :disabled="offset === '0' && !absolute" :modelValue="numericValue" @input="updateNumericValue" />
    <Select
      v-if="isArrayHasLength(uiProperty.unitOptions)"
      :disabled="offset === '0' && !absolute"
      type="text"
      placeholder="units"
      :options="uiProperty.unitOptions"
      v-model="units"
      @update:model-value="updateUnits"
      option-label="name"
    />
    <Select
      v-if="uiProperty.qualifierOptions && uiProperty.valueType != IM.DATE"
      :disabled="offset === '0' && !absolute"
      class="qualifier-select"
      type="text"
      placeholder="qualifier"
      :options="uiProperty.qualifierOptions"
      v-model="assignable.unit"
      option-label="name"
    />
    <Select
      v-if="fromOrTo"
      :modelValue="operator"
      :options="getInclusivityOptions(fromOrTo)"
      option-label="label"
      option-value="value"
      data-testid="inclusivity-selector"
      @update:modelValue="updateOperator"
    >
      <template #option="slotProps">
        <div class="flex items-center" v-tooltip="slotProps.option.tooltip" style="min-height: 1rem">
          <div>{{ slotProps.option.label }}</div>
        </div>
      </template>
    </Select>
  </template>
  <Select
    v-if="relativeTo"
    :modelValue="offset"
    :options="offsetOptions"
    option-label="label"
    option-value="value"
    data-testid="offset-selector"
    @update:modelValue="updateOffset"
  />
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, watch } from "vue";
import { getDateFromString, offsetOptions, operatorOptions, getInclusivityOptions } from "@/helpers/QueryEditorOptions";
import { Assignable, Operator, Range, RelativeTo, TTIriRef } from "@/interfaces/AutoGen";
import { UIProperty } from "@/interfaces";
import { IM, XSD } from "@/vocabulary";
import { isEqual } from "lodash-es";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";

const props = defineProps<{
  uiProperty: UIProperty;
  relativeTo?: RelativeTo;
  absolute: boolean;
  fromOrTo?: "from" | "to";
}>();
const refresh = defineModel<number>("refresh", { default: 0 });
const assignable = defineModel<Assignable>("assignable", { default: {} });
const whereDisplay = defineModel<String>("whereDisplay", { default: "" });
const date: Ref<Date> = ref(new Date());
const numericValue: Ref<number | null> = ref(null);
const operator = ref("");
const offset = ref("0");
const inclusivity = ref(">=");
const units: Ref<TTIriRef | undefined> = ref();
const emit = defineEmits<{
  (event: "updateProperty"): void;
}>();

watch(
  () => refresh.value,
  () => {
    init();
  }
);
watch(
  () => numericValue.value,
  val => {
    console.log("Watcher: numericValue changed to", val);
  }
);

onMounted(async () => {
  init();
});

function init() {
  if (assignable.value.operator) operator.value = assignable.value.operator;
  if (props.absolute) {
    offset.value = "0";
    if (assignable.value.value) {
      if (props.uiProperty.valueType === IM.DATE && props.absolute) date.value = getDateFromString(assignable.value.value!);
      else numericValue.value = Number(assignable.value.value);
      if (assignable.value.unit) {
        units.value = assignable.value.unit;
      }
    } else {
      if (props.uiProperty.valueType === IM.DATE && props.absolute) date.value = new Date();
      else {
        numericValue.value = null;
        operator.value = "=";
        assignable.value.operator = Operator.eq;
      }
    }
  } else if (props.relativeTo) {
    if (!assignable.value.value) {
      offset.value = "0";
    } else {
      if (assignable.value.value.startsWith("-")) {
        offset.value = "-";
        numericValue.value = Number(assignable.value.value.replace("-", ""));
      } else offset.value = "+";
    }
    if (offset.value != "0") {
      if (!assignable.value.unit) {
        if (props.uiProperty.unitOptions && props.uiProperty.unitOptions.length > 0) {
          assignable.value.unit = props.uiProperty.unitOptions[0];
        }
      }
    }
  }
}

function handleOperator(e: any) {}

function updateValue(e: any) {
  assignable.value.value = e;
  init();
  emit("updateProperty");
}
function updateNumericValue(e: any) {
  console.log("updateNumericValue", e.value);
  numericValue.value = e.value;
  updateAssignable();
  emit("updateProperty");
}

function updateOffset(value: "0" | "+" | "-") {
  offset.value = value;
  updateAssignable();
  emit("updateProperty");
}

function updateAssignable() {
  if (!props.absolute) {
    if (offset.value === "0") {
      delete assignable.value.unit;
      delete assignable.value.value;
    } else if (offset.value != "0") {
      if (!assignable.value.value) {
        assignable.value.value = "1";
        numericValue.value = 1;
        if (!assignable.value.unit) {
          if (props.uiProperty.unitOptions && props.uiProperty.unitOptions.length > 0) {
            assignable.value.unit = props.uiProperty.unitOptions[0];
            units.value = assignable.value.unit;
          }
        }
      }
      if (offset.value === "+") {
        if (assignable.value.value.startsWith("-")) {
          assignable.value.value = assignable.value.value.replace("-", "");
        }
      } else {
        if (!assignable.value.value.startsWith("-")) {
          assignable.value.value = "-" + assignable.value.value;
        }
      }
    }
  } else {
    if (numericValue.value != null) assignable.value.value = numericValue.value.toString();
    assignable.value.operator = operator.value as Operator;
  }
}
function updateOperator(value: string) {
  assignable.value.operator = value as Operator;
  operator.value = value;
  emit("updateProperty");
}
function updateUnits(value: TTIriRef) {
  assignable.value.unit = value;
  emit("updateProperty");
}
</script>

<style scoped></style>
