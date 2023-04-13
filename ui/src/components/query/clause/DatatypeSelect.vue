<template>
  <InputText v-if="datatype === 'http://www.w3.org/2001/XMLSchema#string'" type="text" v-model:model-value="value" @change="emit('onValueUpdate', $event)" />
  <Dropdown
    v-else-if="datatype === 'http://www.w3.org/2001/XMLSchema#boolean'"
    :options="booleanOptions"
    option-label="name"
    option-value="value"
    v-model:model-value="value"
    @change="emit('onValueUpdate', $event)"
  />
  <InputNumber
    v-else-if="datatype === 'http://www.w3.org/2001/XMLSchema#long' || datatype === 'http://www.w3.org/2001/XMLSchema#integer'"
    v-model:model-value="value"
    @change="emit('onValueUpdate', $event)"
  />
  <Calendar v-else-if="datatype === 'http://endhealth.info/im#DateTime'" v-model:model-value="value" @change="emit('onValueUpdate', $event)" />
</template>

<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import { PropType, onMounted, ref } from "vue";
const props = defineProps({
  datatype: { type: String, required: true },
  propertyValue: { type: Object as PropType<any>, required: false }
});
const emit = defineEmits({ onValueUpdate: (payload: any) => payload });
const booleanOptions = [
  { name: "true", value: true },
  { name: "false", value: false }
];
const value = ref();

onMounted(async () => {});
</script>

<style scoped></style>
