<template>
  <Select
    :modelValue="operator"
    :options="operatorOptions(uiProperty.valueType)"
    option-label="label"
    option-value="value"
    data-testid="operator-selector"
    @change="handleOperator($event)"
  />

  <DatePicker
    v-if="(IM.DATE + IM.TIME).includes(uiProperty.valueType) && !relativeTo"
    v-model:model-value="date"
    dateFormat="dd/mm/yy"
    @update:model-value="updateValue"
  />
  <InputNumber
    v-if="(XSD.DOUBLE + XSD.INTEGER).includes(uiProperty.valueType) || (uiProperty.valueType === IM.DATE && relativeTo)"
    v-model:model-value="numericValue"
    @update:model-value="updateValue"
  />
  <Select
    v-if="assignable.value && assignable.value != '0' && isArrayHasLength(uiProperty.unitOptions)"
    type="text"
    placeholder="units"
    :options="uiProperty.unitOptions"
    v-model="assignable.unit"
    option-label="name"
  />
  <Select
    v-if="uiProperty.qualifierOptions && uiProperty.valueType != IM.DATE"
    class="qualifier-select"
    type="text"
    placeholder="qualifier"
    :options="uiProperty.qualifierOptions"
    v-model="assignable.unit"
    option-label="name"
  />
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, watch } from "vue";
import { getDateFromString, relativityOptions, operatorOptions } from "@/helpers/QueryEditorOptions";
import { Assignable, RelativeTo } from "@/interfaces/AutoGen";
import { UIProperty } from "@/interfaces";
import { IM, XSD } from "@/vocabulary";
import { isEqual } from "lodash-es";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";

const props = defineProps<{
  uiProperty: UIProperty;
  relativeTo?: RelativeTo;
}>();
const assignable = defineModel<Assignable>("assignable", { default: {} });
const value = defineModel<string | number>("value", { default: "" });
const date: Ref<Date> = ref(new Date());
const numericValue: Ref<number> = ref(0);
const operator = ref("");

watch(assignable, (newValue, oldValue) => {
  if (!isEqual(newValue, oldValue)) init();
});

onMounted(async () => {
  init();
});

function init() {
  if (assignable.value) {
    if (assignable.value.operator) operator.value = assignable.value.operator;
    if (assignable.value.value) value.value = assignable.value.value;
    if (assignable.value.value) {
      if (props.uiProperty.valueType === IM.DATE) date.value = getDateFromString(assignable.value.value!);
      else numericValue.value = Number(assignable.value.value);
    }
  }
}

function handleOperator(e: any) {}

function updateValue(e: any) {
  assignable.value.value = e;
  init();
}
</script>

<style scoped></style>
