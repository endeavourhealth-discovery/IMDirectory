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
      v-if="(valueType === ValueType.date || valueType === ValueType.time) && !relativeTo"
      v-model:model-value="date"
      dateFormat="dd/mm/yy"
      :timeOnly="valueType === ValueType.time"
      @update:model-value="updateDateValue"
    />
    <InputNumber v-else :disabled="offset === '0' && !absolute" :modelValue="numeric" @input="updateNumericValue" />
    <Select
      v-if="isArrayHasLength(uiProperty.unitOptions) && (valueType === ValueType.number || valueType === ValueType.integer || relativeTo)"
      :disabled="offset === '0' && !absolute"
      type="text"
      placeholder="units"
      :options="uiProperty.unitOptions"
      v-model="units"
      @update:model-value="updateUnits"
      option-label="name"
    />
    <Select
      v-if="uiProperty.qualifierOptions && absolute"
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
import { onMounted, Ref, ref, watch, computed } from "vue";
import { getDateFromString, offsetOptions, operatorOptions, getInclusivityOptions } from "@/helpers/QueryEditorMethods";
import { Assignable, Operator, Range, RelativeTo, TTIriRef } from "@/interfaces/AutoGen";
import { removeUndefined } from "@/composables/buildQuery";
import { UIProperty } from "@/interfaces";
import { IM, XSD } from "@/vocabulary";
import { isEqual } from "lodash-es";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";

enum ValueType {
  date,
  time,
  string,
  number,
  integer
}
const props = defineProps<{
  uiProperty: UIProperty;
  relativeTo?: RelativeTo;
  absolute: boolean;
  fromOrTo?: "from" | "to";
}>();
const refresh = defineModel<number>("refresh", { default: 0 });
const assignable = defineModel<Assignable>("assignable", { default: {} });
const whereDisplay = defineModel<String>("whereDisplay", { default: "" });
const date: Ref<Date | undefined> = ref();
const time: Ref<string | undefined> = ref();
const numeric: Ref<number | undefined> = ref();
const text: Ref<string | undefined> = ref();
const operator = ref("");
const offset = ref("0");
const inclusivity = ref(">=");
const units: Ref<TTIriRef | undefined> = ref();
const emit = defineEmits<{
  (event: "updateProperty"): void;
}>();
const valueType: Ref<ValueType | undefined> = ref();

watch(
  () => refresh.value,
  () => {
    init();
  }
);

onMounted(async () => {
  init();
});

function init() {
  switch (props.uiProperty.valueType) {
    case IM.DATE:
      valueType.value = ValueType.date;
      break;
    case IM.TIME:
      valueType.value = ValueType.time;
      break;
    case XSD.DOUBLE:
      valueType.value = ValueType.number;
      break;
    case XSD.STRING:
      valueType.value = ValueType.string;
      break;
    case XSD.INTEGER:
      valueType.value = ValueType.number;
      break;
    case IM.AGE:
      valueType.value = ValueType.integer;
      break;
    default:
      valueType.value = ValueType.number;
  }
  if (assignable.value.operator) operator.value = assignable.value.operator;
  if (props.absolute) {
    offset.value = "0";
    if (assignable.value.value) {
      switch (valueType.value) {
        case ValueType.date:
          date.value = getDateFromString(assignable.value.value!);
          break;
        case ValueType.integer:
          numeric.value = Number(assignable.value.value);
          break;
        case ValueType.number:
          numeric.value = Number(assignable.value.value);
          break;
        default:
          time.value = assignable.value.value;
      }
    }
  } else if (props.relativeTo) {
    if (!assignable.value.value) {
      offset.value = "0";
    } else {
      if (assignable.value.value.startsWith("-")) {
        offset.value = "-";
        numeric.value = Number(assignable.value.value.replace("-", ""));
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
  if (assignable.value.unit) {
    units.value = assignable.value.unit;
  }
}

function handleOperator(e: any) {}

function updateDateValue(e: any) {
  if (valueType.value === ValueType.date) date.value = e;
  else time.value = e.toLocalString().slice(11, 19);
  updateAssignable();
  emit("updateProperty");
}
function updateNumericValue(e: any) {
  numeric.value = e.value;
  updateAssignable();
  emit("updateProperty");
}

function updateOffset(value: "0" | "+" | "-") {
  offset.value = value;
  updateAssignable();
  emit("updateProperty");
}

function updateAssignable() {
  switch (valueType.value) {
    case ValueType.date:
      if (props.absolute) assignable.value.value = date.value?.toLocaleString().slice(0, 10) ?? "";
      else assignable.value.value = numeric.value?.toString();
      break;
    case ValueType.number:
      assignable.value.value = numeric.value?.toString();
      break;
    case ValueType.time:
      if (props.absolute) assignable.value.value = time.value?.toString();
      else assignable.value.value = numeric.value?.toString();
      break;
    case ValueType.string:
      assignable.value.value = text.value?.toString();
      break;
    case ValueType.integer:
      assignable.value.value = numeric.value?.toString();
      break;
  }
  if (assignable.value.value) {
    if (!operator.value) {
      operator.value = "=";
    }
  }
  assignable.value.operator = operator.value as Operator;
  if (offset.value != "0") {
    if (props.uiProperty.unitOptions && !units.value) {
      units.value = props.uiProperty.unitOptions[0];
    }
    if (!numeric.value) numeric.value = 1;
  }
  assignable.value.unit = units.value;
  if (offset.value === "-" && numeric.value != null) assignable.value.value = "-" + numeric.value.toString();
  removeUndefined(assignable.value);
  emit("updateProperty");
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
