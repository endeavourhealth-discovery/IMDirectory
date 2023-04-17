<template>
  <div v-if="datatype === 'http://www.w3.org/2001/XMLSchema#string'">
    <DropdownHeader :options="['Is', 'Starts with', 'Contains']" @on-change="header = $event" />
    <InputText type="text" v-model:model-value="value" @change="emit('onValueUpdate', $event)" />
  </div>
  <Dropdown
    v-else-if="datatype === 'http://www.w3.org/2001/XMLSchema#boolean'"
    :options="booleanOptions"
    option-label="name"
    option-value="value"
    v-model:model-value="value"
    @change="emit('onValueUpdate', $event)"
  />
  <div v-else-if="datatype === 'http://www.w3.org/2001/XMLSchema#long' || datatype === 'http://www.w3.org/2001/XMLSchema#integer'">
    <DropdownHeader :options="['Is', 'Range']" @on-change="header = $event" />
    <ComparisonSelect v-if="header === 'Is'" />
    <RangeSelect v-else-if="header === 'Range'" />
  </div>

  <Calendar v-else-if="datatype === 'http://endhealth.info/im#DateTime'" v-model:model-value="value" @change="emit('onValueUpdate', $event)" />
</template>

<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import { PropType, onMounted, ref } from "vue";
import ComparisonSelect from "../../editTextQuery/ComparisonSelect.vue";
import DropdownHeader from "../DropdownHeader.vue";
import RangeSelect from "../../editTextQuery/RangeSelect.vue";
const props = defineProps({
  datatype: { type: String, required: true },
  propertyValue: { type: Object as PropType<any>, required: false }
});
const emit = defineEmits({ onValueUpdate: (payload: any) => payload });
const booleanOptions = [
  { name: "true", value: true },
  { name: "false", value: false }
];
const header = ref("Is");
const value = ref();

onMounted(async () => {});
</script>

<style scoped></style>
