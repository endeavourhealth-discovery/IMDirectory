<template>
  <div class="datatype-select">
    <div v-if="uiProperty.valueType === XSD.STRING" class="property-input-container">
      <Select
        :options="[
          { id: '=', name: 'is' },
          { id: 'startsWith', name: 'starts with' },
          { id: 'contains', name: 'contains' },
          { id: 'notNull', name: 'is recorded' },
          { id: 'isNull', name: 'is not recorded' }
        ]"
        optionValue="id"
        optionLabel="name"
        v-model:model-value="property.operator"
      />
      <InputText type="text" v-model:model-value="property.value" data-testid="property-value-input" />
    </div>
    <div v-else-if="uiProperty.valueType === XSD.BOOLEAN" class="property-input-container">
      <Select :options="booleanOptions" option-label="name" option-value="value" v-model:model-value="property.value" />
    </div>
    <div v-else class="property-input-container">
      <Select
        :modelValue="relativity"
        :options="relativityOptions"
        option-label="label"
        option-value="value"
        placeholder="Relative/absolute"
        data-testid="relativity-selector"
        @update:modelValue="updateRelativity"
      />
      <template v-if="relativity">
        <RelativeToSelect v-if="relativity = 'relative'" v-model:property="property" :uiProperty="uiProperty" :property-iri="property.iri!" />
        <Select :modelValue="offset" :options="offsetOptions" option-label="label" option-value="value" data-testid="offset-selector" />

        <Select
          :modelValue="comparator"
          :options="comparatorOptions(uiProperty.valueType)"
          scroll-height="50rem"
          option-label="label"
          option-value="value"
          data-testid="comparator-selector"
          @update:modelValue="updateComparator"
        />
        <span>c : {{ comparator }}.rel : {{ relativity }}</span>

        <div v-if="comparator != 'range' && ((relativity && needsValue()) || !relativity)">
          <ValueEditor :ui-property="uiProperty" v-model:assignable="property" :relativeTo="property.relativeTo" />
        </div>
        <div v-else-if="comparator == 'range'" class="property-range">
          <span>between</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref, watch } from "vue";
import { IM, XSD } from "@/vocabulary";
import { Assignable, Range, Where, RelativeTo, Operator } from "@/interfaces/AutoGen";
import RelativeToSelect from "./RelativeToSelect.vue";
import { UIProperty } from "@/interfaces";
import { comparatorOptions, operatorOptions, offsetOptions, relativityOptions } from "@/helpers/QueryEditorOptions";
import ValueEditor from "@/components/imquery/ValueEditor.vue";
import { cloneDeep } from "lodash-es";
interface Props {
  uiProperty: UIProperty;
}

const props = defineProps<Props>();
const property = defineModel<Where>("property", { default: {} });
const propertyType: Ref<string> = ref("=");
const booleanOptions = [
  { name: "true", value: true },
  { name: "false", value: false }
];
const comparator: Ref<string> = ref("=");
const relativity: Ref<string | undefined> = ref();
const offset: Ref<"0" | "+" | "-"> = ref("0");
const originalRelativeTo: Ref<RelativeTo | undefined> = ref();
const originalRange: Ref<Range | undefined> = ref();

onMounted(() => {
  initValues();
});

function initValues() {
  if (property.value.range) {
    comparator.value = "range";
  } else if (property.value.operator) comparator.value = property.value.operator;
  if (property.value.relativeTo) {
    originalRelativeTo.value = cloneDeep(property.value.relativeTo);
    relativity.value = "relative";
  }
}

function needsValue(): boolean {
  if (relativity) {
    if (!offset.value) return false;
    return offset.value !== "0";
  } else return true;
}

function updateRelativity(value: string) {
  if (value === "relative") {
    if (!property.value.relativeTo) {
      if (originalRelativeTo.value) {
        property.value.relativeTo = cloneDeep(originalRelativeTo.value);
      } else property.value.relativeTo = {};
    }
  } else delete property.value.relativeTo;
}
function updateComparator(value: string) {
  if (value === "range") {
    if (!property.value.range) {
      if (originalRange.value) {
        property.value.range = originalRange.value;
      } else property.value.range = {} as Range;
    }
  } else {
    delete property.value.range;
    property.value.operator = value as Operator;
  }
}
</script>

<style scoped>
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
}

.property-input-title {
  width: 4rem;
}

.property-range {
  display: flex;
  flex-flow: row;
  align-items: baseline;
}
</style>
