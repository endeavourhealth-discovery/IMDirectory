<template>
  <div class="where-value-editor">
    <div>
      <ValueSentenceDisplay v-if="valueSentence" :value-sentence="valueSentence" />
    </div>
    <div v-if="uiProperty.valueType != XSD.STRING" class="where-relative-container">
      <div class="relative-buttons">
        <span class="field">
          <span v-for="opt in RangeValueOptions" :key="opt.value" class="gap-1">
            <RadioButton v-model="rangeOrValue" :inputId="opt.value" :value="opt.value" @update:modelValue="updateRangeOrValue" />
            <label :for="opt.value" class="field">{{ opt.label }}</label>
          </span>
        </span>
      </div>
    </div>
    <div v-if="rangeOrValue === RangeOrValue.SingleValue" class="value-editor">
      <ValueEditor
        v-model:assignable="where"
        v-model:match="match"
        v-model:where="where"
        :qualifier="where.qualifier"
        :refresh="refresh"
        :ui-property="uiProperty"
        @updateAssignable="updateWhereDisplay(where)"
      />
    </div>
    <div v-else-if="rangeOrValue === RangeOrValue.Range && where.range && where.range.from && where.range.to" class="value-editor">
      <span class="range-label">between</span>
      <ValueEditor
        v-model:assignable="where.range.from"
        v-model:match="match"
        v-model:where="where"
        :fromOrTo="'from'"
        :qualifier="where.qualifier"
        :refresh="refresh"
        :ui-property="uiProperty"
        @updateAssignable="updateWhereDisplay(where.range.from)"
      />
      <span class="range-label">and</span>
      <ValueEditor
        v-model:assignable="where.range.to"
        v-model:match="match"
        v-model:where="where"
        :fromOrTo="'to'"
        :qualifier="where.qualifier"
        :refresh="refresh"
        :ui-property="uiProperty"
        @updateAssignable="updateWhereDisplay(where.range.to)"
      />
    </div>
    <div v-if="uiProperty.qualifierOptions">
      <span class="qualifier">Qualifier:</span>
      <Select
        v-model="qualifierIri"
        :options="qualifierOptions"
        :placeholder="'no function on ' + where.name"
        optionLabel="displayName"
        optionValue="iri"
        @update:modelValue="updateQualifier"
      >
        <template #option="slotProps">
          <div v-tooltip="slotProps.option.tooltip" class="flex items-center" style="min-height: 1rem">
            <div>{{ slotProps.option.displayName }}</div>
          </div>
        </template>
      </Select>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, Ref, ref, watch } from "vue";

import { Operator, XSD } from "@endeavour/vue-library/enums";
import { type Range, type Query,type Value, type Where } from "@endeavour/vue-library/models";

import { cloneDeep } from "lodash-es";

import ValueEditor from "@/components/imquery/ValueEditor.vue";
import ValueSentenceDisplay from "@/components/imquery/ValueSentenceDisplay.vue";
import { RangeValueOptions } from "@/constants";
import { RangeOrValue } from "@/enums";
import { buildValueSentence } from "@/helpers/QueryEditorMethods";
import { type UIProperty } from "@/models";

interface Props {
  uiProperty: UIProperty;
}

const refresh = defineModel<number>("refresh", { default: 0 });
const props = defineProps<Props>();
const match = defineModel<Query>("match", { default: {} as Query });
const where = defineModel<Where>("where", { default: {} as Where });
const booleanOptions = [
  { name: "true", value: true },
  { name: "false", value: false }
];
const emit = defineEmits(["updateProperty"]);
const whereDisplay: Ref<string> = ref("");
const rangeOrValue: Ref<RangeOrValue> = ref(where.value.range ? RangeOrValue.Range : RangeOrValue.SingleValue);

const qualifierOptions = computed(() => {
  const options = [];
  options.push({ iri: undefined, displayName: "no qualifier" });
  if (props.uiProperty.qualifierOptions) {
    options.push(
      ...props.uiProperty.qualifierOptions.map(opt => ({
        ...opt,
        displayName: `${opt.name} of ${where.value.name}`
      }))
    );
  }
  return options;
});
const qualifierIri: Ref<string | undefined> = ref(undefined);
const valueSentence = computed(() => {
  return buildValueSentence(where.value);
});

onMounted(() => {
  init();
});

watch(
  () => refresh.value,
  () => {
    init();
  }
);

function init() {
  if (where.value.qualifier) {
    qualifierIri.value = where.value.qualifier.iri;
  }
  if (where.value.range) {
    rangeOrValue.value = RangeOrValue.Range;
  } else if (where.value.isNull) {
    rangeOrValue.value = RangeOrValue.IsNull;
  } else if (where.value.isNotNull) {
    rangeOrValue.value = RangeOrValue.IsNotNull;
  } else rangeOrValue.value = RangeOrValue.SingleValue;
}
function updateRangeOrValue() {
  if (rangeOrValue.value === RangeOrValue.Range) {
    if (!where.value.range) {
      where.value.range = { from: { operator: Operator.gte }, to: { operator: Operator.lte } } as Range;
      where.value.range.from.operator = where.value.operator;
      where.value.range.from.value = where.value.value;
      where.value.range.to.operator = (() => {
        switch (where.value.range.from.operator) {
          case Operator.eq:
            return Operator.eq;
          case Operator.gt:
            return Operator.lt;
          case Operator.lt:
            return Operator.gt;
          case Operator.gte:
            return Operator.lte;
          default:
            return Operator.eq; // or throw error if appropriate
        }
      })();
      if (where.value.compare) {
        where.value.range.from.compare = where.value.compare;
        where.value.range.to.compare = { left: {}, right: {} };
        where.value.range.to.compare.right = cloneDeep(where.value.range.from.compare.right);
        where.value.range.to.compare.units = where.value.range.from.compare.units;
        if (where.value.range.to.compare.units && !where.value.range.to.value) {
          where.value.range.to.value = "0";
          where.value.range.to.operator = Operator.eq;
        }
        delete where.value.compare;
      }
      delete where.value.value;
      delete where.value.operator;
    }
  } else {
    if (where.value.range) {
      if (where.value.range.from.compare) {
        where.value.compare = where.value.range.from.compare;
        where.value.operator = where.value.range.from.operator;
        where.value.value = where.value.range.from.value;
      } else {
        where.value.value = where.value.range.from.value;
        where.value.operator = where.value.range.from.operator;
      }
    }
    delete where.value.range;
  }
  emit("updateProperty");
}

function updateQualifier() {
  if (qualifierIri.value && props.uiProperty.qualifierOptions) {
    where.value.qualifier = props.uiProperty.qualifierOptions.find(opt => opt.iri === qualifierIri.value);
  } else {
    delete where.value.qualifier;
  }
}

function selectedQualifierTemplate(option: any) {
  return `${option.name} of ${where.value.name}`;
}
function updateWhereDisplay(assignable: Value | Where) {
  emit("updateProperty");
}
</script>

<style scoped>
.where-value-editor {
  display: flex;
  flex-direction: column;
}
.value-editor {
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
}
.relative-buttons {
  margin-top: 0.5rem;
  --p-radiobutton-checked-border-color: green;
  --p-radiobutton-checked-background: white;
  --p-radiobutton-icon-checked-color: black;
  --p-radiobutton-icon-size: 10px;
}
.qualifier {
  padding-left: 1rem;
  padding-right: 1rem;
}
.where-relative-container {
  display: flex;
  flex-direction: row;
}
.property-input-container {
  display: flex;
  flex-flow: row;
  align-items: baseline;
}

.property-input {
  display: flex;
  flex-flow: row;
  align-items: baseline;
  flex-wrap: wrap;
  margin-top: 1rem;
}
.field {
  padding-left: 1rem;
  padding-right: 1rem;
}

.property-range {
  display: flex;
  flex-flow: row;
  align-items: baseline;
  margin-top: 1rem;
}
.range-label {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
</style>
