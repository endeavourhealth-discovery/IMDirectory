<template>
  <div v-if="datatype === XMLS.NAMESPACE + 'string'">
    <DropdownHeader :options="['Is', 'Starts with', 'Contains']" @on-change="valueHeader = $event" />
    <InputText type="text" v-model:model-value="selectedValue" @change="emit('onValueUpdate', $event)" />
  </div>
  <Dropdown
    v-else-if="datatype === XMLS.NAMESPACE + 'boolean'"
    :options="booleanOptions"
    option-label="name"
    option-value="value"
    v-model:model-value="selectedValue"
    @change="emit('onValueUpdate', $event)"
  />
  <div v-else-if="datatype === XMLS.NAMESPACE + 'long' || datatype === XMLS.NAMESPACE + 'integer'">
    <DropdownHeader :options="['Is', 'Range']" @on-change="valueHeader = $event" />
    <ComparisonSelect v-if="valueHeader === 'Is'" />
    <RangeSelect v-else-if="valueHeader === 'Range'" />
  </div>

  <Calendar v-else-if="datatype === IM.NAMESPACE + 'DateTime'" v-model:model-value="selectedValue" @change="emit('onValueUpdate', $event)" />
</template>

<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import { PropType, Ref, ref } from "vue";
import ComparisonSelect from "../../editTextQuery/ComparisonSelect.vue";
import DropdownHeader from "../DropdownHeader.vue";
import RangeSelect from "../../editTextQuery/RangeSelect.vue";
import { IM, XMLS } from "@im-library/vocabulary";
const props = defineProps({
  datatype: { type: String, required: true },
  propertyValue: { type: Object as PropType<any>, required: false }
});
const emit = defineEmits({ onValueUpdate: (payload: any) => payload });
const booleanOptions = [
  { name: "true", value: true },
  { name: "false", value: false }
];
const valueHeader: Ref<string> = ref("Is");
const selectedValue: Ref<any> = ref();
</script>

<style scoped></style>
