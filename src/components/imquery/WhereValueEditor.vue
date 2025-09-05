<template>
  <div class="datatype-select">
    <div>{{ whereDisplay }}</div>
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
        scroll-height="50rem"
        option-label="label"
        option-value="value"
        placeholder="Relative/absolute"
        data-testid="relativity-selector"
        @update:modelValue="updateRelativity"
      >
        <template #option="slotProps">
          <div class="flex items-center" v-tooltip="slotProps.option.tooltip" style="min-height: 1rem">
            <div>{{ slotProps.option.label }}</div>
          </div>
        </template>
      </Select>
      <template v-if="relativity && relativity != 'notNull' && relativity !== 'isNull'">
        <div v-if="!relativity.includes('Range')">
          <ValueEditor
            :ui-property="uiProperty"
            v-model:assignable="property"
            v-model:property="property"
            :relativeTo="property.relativeTo"
            :absolute="relativity === 'absolute'"
            :refresh="refresh"
            @updateProperty="updateWhereDisplay"
          />
        </div>
        <div v-else-if="relativity.includes('Range')" class="property-range">
          <div>
            <span class="range-label">between</span>
            <ValueEditor
              :ui-property="uiProperty"
              v-model:assignable="property.range!.from"
              v-model:property="property"
              :relativeTo="property.relativeTo"
              :absolute="relativity.includes('absolute')"
              :refresh="refresh"
              :fromOrTo="'from'"
              @updateProperty="updateWhereDisplay"
            />
          </div>
          <div>
            <span class="range-label">and</span>
            <ValueEditor
              :ui-property="uiProperty"
              v-model:assignable="property.range!.to"
              v-model:property="property"
              :relativeTo="property.relativeTo"
              :absolute="relativity.includes('absolute')"
              :refresh="refresh"
              :fromOrTo="'to'"
              @updateProperty="updateWhereDisplay"
            />
          </div>
        </div>
      </template>
      <RelativeToSelect
        v-if="relativity === 'relative' || relativity === 'relativeRange'"
        v-model:property="property"
        :uiProperty="uiProperty"
        :property-iri="property.iri!"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref, watch } from "vue";
import { IM, XSD } from "@/vocabulary";
import { Range, Where, RelativeTo, Operator } from "@/interfaces/AutoGen";
import RelativeToSelect from "./RelativeToSelect.vue";
import { UIProperty } from "@/interfaces";
import { operatorOptions, getWhereDisplay, relativityOptions } from "@/helpers/QueryEditorMethods";
import ValueEditor from "@/components/imquery/ValueEditor.vue";
import { cloneDeep } from "lodash-es";
interface Props {
  uiProperty: UIProperty;
}

const refresh = defineModel<number>("refresh", { default: 0 });
const props = defineProps<Props>();
const property = defineModel<Where>("property", { default: {} });
const booleanOptions = [
  { name: "true", value: true },
  { name: "false", value: false }
];
const emit = defineEmits(["updateProperty"]);
const relativity: Ref<string | undefined> = ref();
const originalRelativeTo: Ref<RelativeTo | undefined> = ref();
const whereDisplay: Ref<string> = ref("");

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
  if (property.value.range) {
    if (property.value.relativeTo) relativity.value = "relativeRange";
    else relativity.value = "absoluteRange";
  } else {
    if (property.value.relativeTo) {
      originalRelativeTo.value = cloneDeep(property.value.relativeTo);
      relativity.value = "relative";
    } else relativity.value = "absolute";
  }
  if (property.value.isNotNull) relativity.value = "notNull";
  if (property.value.isNull) relativity.value = "isNull";
  whereDisplay.value = getWhereDisplay(property.value, props.uiProperty.valueType);
}

function updateRelativity(value: string) {
  if (value === "relative" || value === "relativeRange") {
    if (!property.value.relativeTo) {
      if (originalRelativeTo.value) {
        property.value.relativeTo = originalRelativeTo.value;
      } else property.value.relativeTo = {};
    }
    delete property.value.isNotNull;
    delete property.value.isNull;
  } else {
    delete property.value.relativeTo;
    if (value === "notNull") {
      delete property.value.operator;
      delete property.value.value;
      property.value.isNotNull = true;
    } else if (value === "isNull") {
      delete property.value.operator;
      delete property.value.value;
      property.value.isNull = true;
    } else {
      delete property.value.isNotNull;
      delete property.value.isNull;
    }
  }
  init();
  refresh.value++;
  emit("updateProperty");
}
function updateWhereDisplay() {
  whereDisplay.value = getWhereDisplay(property.value, props.uiProperty.valueType);
  emit("updateProperty");
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
.range-label {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
</style>
