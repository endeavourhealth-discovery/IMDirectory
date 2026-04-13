<template>
  <div>
    <div class="relative-buttons">
      <span class="field">
        <span v-for="opt in CompareOptions" :key="opt.value" class="gap-1">
          <RadioButton v-model="relativity" :value="opt.value" :inputId="opt.value" @update:modelValue="onChangeRelativeTo" />
          <label :for="opt.value" class="field">{{ opt.label }}</label>
        </span>
      </span>
    </div>
    <div class="value-input-container">
      <Select
        :modelValue="operator"
        :options="OperatorOptions"
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
      <DatePicker
        v-if="relativity === Relativity.Absolute && (valueType === ValueType.date || valueType === ValueType.time)"
        v-model:model-value="date"
        dateFormat="dd/mm/yy"
        :timeOnly="valueType === ValueType.time"
        @update:model-value="updateDateValue"
      />

      <InputText v-else-if="showValue" v-model="assignable.value" @input="updateNumericValue" />

      <Select
        v-if="assignable.compare && showUnits"
        type="text"
        :options="uiProperty.unitOptions"
        option-label="name"
        option-value="iri"
        placeholder="units"
        v-model="units"
        @update:model-value="updateUnits"
      >
        <template #option="slotProps">
          <div class="flex items-center" v-tooltip="slotProps.option.tooltip" style="min-height: 1rem">
            <div>{{ slotProps.option.name }}</div>
          </div>
        </template>
      </Select>
      <div v-if="relativity === Relativity.Relative || relativity === Relativity.Compare">
        <span class="field">Relative to</span>
        <RelativeToSelect v-model:assignable="assignable" :uiProperty="uiProperty" :property-iri="where.iri!" @updateCompare="emit('updateAssignable')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, watch, computed } from "vue";
import type { Assignable, Where, TTIriRef, Match, UIProperty } from "vue-library/interfaces";
import { Operator } from "vue-library/enums";
import { IM, XSD } from "vue-library/enums";
import RelativeToSelect from "@/components/imquery/RelativeToSelect.vue";
import { RangeOrValue, Relativity } from "@/enums";
import { CompareOptions } from "@/constants";
import { OperatorOptions } from "@/constants/queryEditor/OperatorOptions";

enum ValueType {
  date,
  time,
  string,
  number,
  integer
}
const props = defineProps<{
  uiProperty: UIProperty;
  fromOrTo?: "from" | "to";
  qualifier?: TTIriRef;
  from?: Match;
}>();
const refresh = defineModel<number>("refresh", { default: 0 });
const assignable = defineModel<Assignable>("assignable", { default: {} });
const where = defineModel<Where>("where", { required: true });
const date: Ref<Date | undefined> = ref();
const time: Ref<string | undefined> = ref();
const operator = ref(Operator.eq);
const offset = ref("0");
const rangeOrValue = computed(() => {
  if (where.value.range) return RangeOrValue.Range;
  else return RangeOrValue.SingleValue;
});
const relativity: Ref<Relativity> = ref(assignable.value.compare ? (assignable.value.value ? Relativity.Relative : Relativity.Compare) : Relativity.Absolute);
const units: Ref<string | undefined> = ref();
const emit = defineEmits<{
  (event: "updateAssignable"): void;
}>();
const valueType: Ref<ValueType | undefined> = ref();
const showUnits: Ref<boolean> = computed(() => {
  if (
    !props.qualifier &&
    props.uiProperty.unitOptions &&
    (!assignable.value.operator || assignable.value.operator != Operator.eq || props.fromOrTo) &&
    (valueType.value === ValueType.number || valueType.value === ValueType.integer || relativity.value === Relativity.Relative)
  )
    return true;
  else return false;
});
const showValue = computed(() => {
  if (relativity.value === Relativity.Compare) return false;
  if (relativity.value === Relativity.Relative && props.fromOrTo) return true;
  return true;
});
const showInclusivity = computed(() => {
  if (props.fromOrTo) return true;
});

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
  if (assignable.value.operator) {
    operator.value = assignable.value.operator;
  }
  if (assignable.value.compare && assignable.value.compare.units) {
    units.value = assignable.value.compare.units.iri;
    if (!assignable.value.value) assignable.value.value = "0";
  }
}

function onChangeRelativeTo(e: any) {
  if (e === Relativity.Relative || e === Relativity.Compare) {
    relativity.value = e;
    if (!assignable.value.compare) {
      assignable.value.compare = { left: {}, right: {} };
      units.value = undefined;
    }
    if (e === Relativity.Compare) {
      assignable.value.compare.units = undefined;
      units.value = undefined;
      assignable.value.value = undefined;
    }
  } else {
    delete assignable.value.compare;
    relativity.value = Relativity.Absolute;
  }
  emit("updateAssignable");
}

function handleOperator(e: any) {}

function updateDateValue(e: any) {
  if (valueType.value === ValueType.date) date.value = e;
  else time.value = e.toLocalString().slice(11, 19);
  updateAssignable();
  emit("updateAssignable");
}
function updateNumericValue(e: any) {
  updateAssignable();
  emit("updateAssignable");
}

function updateAssignable() {
  switch (valueType.value) {
    case ValueType.date:
      if (!relativity) assignable.value.value = date.value?.toLocaleString().slice(0, 10) ?? "";
      else {
        if (!isNumeric(assignable.value.value)) delete assignable.value.value;
      }
      break;
    case ValueType.number:
      if (!isNumeric(assignable.value.value)) delete assignable.value.value;
      break;
    case ValueType.time:
      if (!relativity) assignable.value.value = time.value?.toString();
      else {
        if (!isNumeric(assignable.value.value)) delete assignable.value.value;
      }
      break;
    case ValueType.integer:
      if (!isNumeric(assignable.value.value)) delete assignable.value.value;
      break;
  }
  if (assignable.value.value) {
    if (!assignable.value.operator) {
      assignable.value.operator = Operator.eq;
    }
  }
  emit("updateAssignable");
}
function isNumeric(value: string | undefined): boolean {
  if (!value) return false;
  return value.trim() !== "" && !Number.isNaN(Number(value));
}

function updateOperator(value: Operator) {
  assignable.value.operator = value;
  operator.value = value;
  emit("updateAssignable");
}

function updateUnits() {
  if (!assignable.value.compare) assignable.value.compare = { left: {}, right: {} };
  if (props.uiProperty.unitOptions) assignable.value.compare.units = props.uiProperty.unitOptions.find(opt => opt.iri === units.value);
  emit("updateAssignable");
}
</script>

<style scoped>
.relative-buttons {
  margin-top: 0.5rem;
  --p-radiobutton-checked-border-color: green;
  --p-radiobutton-checked-background: white;
  --p-radiobutton-icon-checked-color: black;
  --p-radiobutton-icon-size: 10px;
}
.field {
  padding-left: 1rem;
  padding-right: 1rem;
}
.value-input-container {
  display: flex;
  flex-flow: row;
  align-items: baseline;
}
</style>
