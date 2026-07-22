<template>
  <div>
    <div class="relative-buttons">
      <span v-if="compareOptions.length > 0" class="field">
        <span v-for="opt in compareOptions" :key="opt.value" class="gap-1">
          <RadioButton v-model="relativity" :inputId="opt.value" :value="opt.value" @update:modelValue="onChangeRelativeTo" />
          <label :for="opt.value" class="field">{{ opt.label }}</label>
        </span>
      </span>
    </div>
    <div class="value-input-container">
      <Select
        :modelValue="operator"
        :options="operatorOptions"
        :placeholder="operator ? operator.toString() : operatorOptions[0].label"
        data-testid="operator-selector"
        option-label="label"
        option-value="value"
        scroll-height="50rem"
        @update:modelValue="updateOperator"
      >
        <template #option="slotProps">
          <div v-tooltip="slotProps.option.tooltip" class="flex items-center" style="min-height: 1rem">
            <div>{{ slotProps.option.label }}</div>
          </div>
        </template>
      </Select>
      <DatePicker
        v-if="relativity === Relativity.Absolute && dateTimeType"
        v-model:model-value="date"
        :timeOnly="valueType === ValueType.time"
        dateFormat="dd/mm/yy"
        @update:model-value="updateDateValue"
      />

      <InputText v-else-if="showValue" v-model="assignable.value" @input="updateNumericValue" />

      <Select
        v-if="assignable.compare || showUnits"
        v-model="units"
        :options="uiProperty.unitOptions"
        option-label="name"
        option-value="iri"
        placeholder="units"
        type="text"
        @update:model-value="updateUnits"
      >
        <template #option="slotProps">
          <div v-tooltip="slotProps.option.tooltip" class="flex items-center" style="min-height: 1rem">
            <div>{{ slotProps.option.name }}</div>
          </div>
        </template>
      </Select>
      <div v-if="relativity === Relativity.Relative || relativity === Relativity.Compare">
        <span class="field">Relative to</span>
        <RelativeToSelect v-model:assignable="assignable" :property-iri="where.iri!" :uiProperty="uiProperty" @updateCompare="emit('updateAssignable')" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Ref, computed, inject, onMounted, ref, watch } from "vue";

import { IM, Operator, XSD } from "@endeavour/vue-library/enums";
import { type Compare, type Match, type TTIriRef, type UIProperty, type Value, ValueSchema, type Where } from "@endeavour/vue-library/models";

import RelativeToSelect from "@/components/imquery/RelativeToSelect.vue";
import { Relativity } from "@/enums";
import { getCompareOptions, getOperatorOptions, getRelativeToOptions } from "@/helpers/buildQuery";

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
}>();
const refresh = defineModel<number>("refresh", { default: 0 });
const assignable = defineModel<Value | Where>("assignable", { default: ValueSchema.parse({}) });
const where = defineModel<Where>("where", { required: true });
const date: Ref<Date | undefined> = ref();
const time: Ref<string | undefined> = ref();
const keepAs = inject("keepAs") as Ref<Record<string, Ref<Match>>>;
const operator = ref(Operator.eq);
const compareOptions = computed(() => {
  return getCompareOptions(props.uiProperty.valueType);
});
const operatorOptions = computed(() => {
  return getOperatorOptions(props.uiProperty.valueType);
});

const relativity: Ref<Relativity> = ref(assignable.value.compare ? (assignable.value.value ? Relativity.Relative : Relativity.Compare) : Relativity.Absolute);
const units: Ref<string | undefined> = ref();
const emit = defineEmits<{
  (event: "updateAssignable"): void;
}>();
const valueType: Ref<ValueType | undefined> = ref();
const dateTimeType = computed(() => {
  return valueType.value === ValueType.date || valueType.value === ValueType.time;
});
const showUnits: Ref<boolean> = computed(() => {
  if (!props.qualifier && props.uiProperty.unitOptions && (relativity.value == Relativity.Relative || !dateTimeType.value)) return true;
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
const relativeToOptions = computed(() => {
  return getRelativeToOptions(props.uiProperty.valueType, keepAs.value);
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
      if (assignable.value.value) {
        const parsed = new Date(assignable.value.value);
        date.value = isNaN(parsed.getTime()) ? undefined : parsed;
      }
      break;
    case IM.TIME:
      valueType.value = ValueType.time;
      if (assignable.value.value) {
        const parsed = new Date(assignable.value.value);
        date.value = isNaN(parsed.getTime()) ? undefined : parsed;
      }
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
    if (!assignable.value.compare && relativeToOptions.value.length > 0) {
      const compare: Compare = { left: { iri: where.value.iri, name: where.value.name }, right: {} };
      if (props.uiProperty.valueType === IM.DATE) {
        compare.right!.parameter = "$searchDate";
      } else compare.right!.parameter = relativeToOptions.value[0].value;
      assignable.value.compare = compare;
    }
    if (assignable.value.compare && !assignable.value.compare.units) {
      if (e === Relativity.Compare) {
        assignable.value.compare.units = undefined;
        units.value = undefined;
        assignable.value.value = undefined;
      }
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
      if (!relativity.value || relativity.value === Relativity.Absolute) {
        assignable.value.value = date.value?.toLocaleString().slice(0, 10) ?? "";
      } else {
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
  if (value === Operator.isNull) {
    where.value.isNull = true;
  }
  if (value === Operator.notNull) {
    where.value.notNull = true;
  }
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
