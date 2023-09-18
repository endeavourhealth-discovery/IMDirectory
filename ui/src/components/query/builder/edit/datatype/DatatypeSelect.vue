<template>
  <div v-if="datatype === XMLS.NAMESPACE + 'string'" class="property-input-container">
    <Dropdown :options="['is', 'startsWith', 'contains']" v-model:model-value="propertyType" />
    <InputText type="text" v-model:model-value="property.value" />
  </div>
  <Dropdown
    v-else-if="datatype === XMLS.NAMESPACE + 'boolean'"
    :options="booleanOptions"
    option-label="name"
    option-value="value"
    v-model:model-value="property.value"
  />
  <div v-else-if="datatype === XMLS.NAMESPACE + 'long' || datatype === XMLS.NAMESPACE + 'integer'" class="property-input-container">
    <Dropdown :options="['is', 'range']" v-model:model-value="propertyType" />
    <ComparisonSelect v-if="propertyType === 'is'" :property="property" />
    <RangeSelect v-else-if="propertyType === 'range'" :from="property.range!.from" :to="property.range!.to" />
  </div>
  <div v-else-if="datatype === IM.NAMESPACE + 'DateTime'" class="property-input-container">
    <DateSelect :property="property" :datatype="datatype" />
  </div>
</template>

<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import { Ref, onMounted, ref, watch } from "vue";
import ComparisonSelect from "./ComparisonSelect.vue";
import RangeSelect from "./RangeSelect.vue";
import { IM, XMLS } from "@im-library/vocabulary";
import { Assignable, Range, Property } from "@im-library/interfaces/AutoGen";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import DateSelect from "./DateSelect.vue";
interface Props {
  property: Property;
  datatype: string;
}

const props = defineProps<Props>();
const propertyType: Ref<string> = ref("");
const booleanOptions = [
  { name: "true", value: true },
  { name: "false", value: false }
];

watch(
  () => propertyType.value,
  () => {
    if (propertyType.value === "range" && !isObjectHasKeys(props.property, ["range"])) {
      props.property.range = { from: {} as Assignable, to: {} as Assignable } as Range;
    }
  }
);

onMounted(() => {
  if (isObjectHasKeys(props.property.range)) propertyType.value = "range";
  else propertyType.value = "is";
});
</script>

<style scoped>
.property-input-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  gap: 0.5rem;
}
</style>
