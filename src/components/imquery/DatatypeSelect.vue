<template>
  <div class="datatype-select">
    <div v-if="uiProperty.valueType === XSD.STRING" class="property-input-container">
      <Select
        :options="[
          { id: 'is', name: 'is' },
          { id: 'startsWith', name: 'starts with' },
          { id: 'contains', name: 'contains' },
          { id: 'notNull', name: 'is recorded' },
          { id: 'isNull', name: 'is not recorded' }
        ]"
        optionValue="id"
        optionLabel="name"
        v-model:model-value="propertyType"
      />
      <InputText
        v-if="['is', 'startsWith', 'contains'].includes(propertyType)"
        type="text"
        v-model:model-value="property.value"
        data-testid="property-value-input"
      />
    </div>
    <div v-else-if="uiProperty.valueType === XSD.BOOLEAN" class="property-input-container">
      <Select :options="booleanOptions" option-label="name" option-value="value" v-model:model-value="property.value" />
    </div>
    <div
      v-else-if="uiProperty.valueType === IM.DATE_TIME || uiProperty.valueType === IM.DATE || uiProperty.valueType === IM.TIME"
      class="property-input-container"
    >
      <ValuePatternEditor v-model:property="property" :uiProperty="uiProperty" />
    </div>
    <div v-else class="property-input-container">
      <Select
        :options="[
          { id: 'is', name: 'is' },
          { id: 'between', name: 'between' },
          { id: 'range', name: 'in range' },
          { id: 'notNull', name: 'is recorded' },
          { id: 'isNull', name: 'is not recorded' }
        ]"
        optionValue="id"
        optionLabel="name"
        v-model:model-value="propertyType"
        class="property-type-select"
      />
      <div v-if="propertyType === 'is'" class="property-input">
        <Select type="text" placeholder="operator" :options="uiProperty.operatorOptions" v-model="property.operator" data-testid="property-operator-select" />
        <InputText type="text" placeholder="value" v-model="property.value" data-testid="property-value-input" />
        <RelativeToSelect :property="property" :uiProperty="uiProperty" :property-iri="property.iri!" />
        <Select
          v-if="isArrayHasLength(uiProperty.unitOptions)"
          type="text"
          placeholder="units"
          :options="uiProperty.unitOptions"
          v-model="property.unit"
          option-label="name"
        />
      </div>
      <div v-else-if="propertyType === 'between'" class="property-input">
        <div class="property-range" v-if="property?.range?.from">
          <InputText type="text" placeholder="value" v-model="property.range.from.value" data-testid="property-value-input-from" />
          <Select
            v-if="isArrayHasLength(uiProperty.unitOptions)"
            type="text"
            placeholder="units"
            :options="uiProperty.unitOptions"
            v-model="property.range.from.unit"
            option-label="name"
            data-testid="from-unit-select"
          />
        </div>
        <div class="property-range" v-if="property?.range?.to">
          <InputText :value="'and'" disabled class="property-input-title" />
          <InputText type="text" placeholder="value" v-model="property.range.to.value" data-testid="property-value-input-to" />
          <Select
            v-if="isArrayHasLength(uiProperty.unitOptions)"
            type="text"
            placeholder="units"
            :options="uiProperty.unitOptions"
            v-model="property.range.to.unit"
            option-label="name"
            data-testid="to-unit-select"
          />
        </div>
      </div>
      <div v-else-if="propertyType === 'range'" class="property-input">
        <div class="property-range" v-if="property?.range?.from">
          <InputText :value="'From'" disabled class="property-input-title" />
          <Select type="text" placeholder="operator" :options="uiProperty.operatorOptions" v-model="property.range.from.operator" />
          <InputText type="text" placeholder="value" v-model="property.range.from.value" />
          <Select
            v-if="isArrayHasLength(uiProperty.unitOptions)"
            type="text"
            placeholder="units"
            :options="uiProperty.unitOptions"
            v-model="property.range.from.unit"
            option-label="name"
          />
        </div>
        <div class="property-range" v-if="property?.range?.to">
          <InputText :value="'To'" disabled class="property-input-title" />
          <Select type="text" placeholder="operator" :options="uiProperty.operatorOptions" v-model="property.range.to.operator" />
          <InputText type="text" placeholder="value" v-model="property.range.to.value" />
          <Select
            v-if="isArrayHasLength(uiProperty.unitOptions)"
            type="text"
            placeholder="units"
            :options="uiProperty.unitOptions"
            v-model="property.range.to.unit"
            option-label="name"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref, watch } from "vue";
import { IM, XSD } from "@/vocabulary";
import { Assignable, Range, Where, Operator } from "@/interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import ValuePatternEditor from "./ValuePatternEditor.vue";
import RelativeToSelect from "./RelativeToSelect.vue";
import { UIProperty } from "@/interfaces";
interface Props {
  uiProperty: UIProperty;
}

const props = defineProps<Props>();
const property = defineModel<Where>("property", { default: {} });
const propertyType: Ref<string> = ref("");
const booleanOptions = [
  { name: "true", value: true },
  { name: "false", value: false }
];

watch(
  () => propertyType.value,
  () => {
    switch (propertyType.value) {
      case "range":
        property.value.operator = undefined;
        property.value.isNull = undefined;
        property.value.isNotNull = undefined;
        if (!property.value.range) property.value.range = { from: {} as Assignable, to: {} as Assignable } as Range;
        break;
      case "between":
        property.value.operator = undefined;
        property.value.isNull = undefined;
        property.value.isNotNull = undefined;
        property.value.value = undefined;
        if (!property.value.range) property.value.range = { from: { operator: Operator.gte }, to: { operator: Operator.lte } as Assignable } as Range;
        break;
      case "startsWith":
        delete property.value.range;
        property.value.isNull = undefined;
        property.value.isNotNull = undefined;
        property.value.operator = Operator.start;
        break;
      case "contains":
        delete property.value.range;
        property.value.isNull = undefined;
        property.value.isNotNull = undefined;
        property.value.operator = Operator.contains;
        break;
      case "is":
        delete property.value.range;
        property.value.isNull = undefined;
        property.value.isNotNull = undefined;
        property.value.operator = Operator.eq;
        break;
      case "notNull":
        delete property.value.range;
        property.value.operator = undefined;
        property.value.isNull = undefined;
        property.value.isNotNull = true;
        break;
      case "isNull":
        delete property.value.range;
        property.value.operator = undefined;
        property.value.isNull = true;
        property.value.isNotNull = undefined;
        break;
      default:
        break;
    }
  }
);

onMounted(async () => {
  if (isObjectHasKeys(property.value.range)) {
    if (property.value.range?.from.operator === Operator.gte && property.value.range?.to.operator === Operator.lte) propertyType.value = "between";
    else propertyType.value = "range";
  } else if (property.value.operator === "startsWith" || property.value.operator === "contains") propertyType.value = property.value.operator;
  else if (property.value.isNull) propertyType.value = "isNull";
  else if (property.value.isNotNull) propertyType.value = "notNull";
  else if (props.uiProperty.valueType !== IM.DATE_TIME) propertyType.value = "is";
});
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
