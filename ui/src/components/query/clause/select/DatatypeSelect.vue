<template>
  <div v-if="datatype === XMLS.NAMESPACE + 'string'">
    <DropdownHeader :options="['is', 'startsWith', 'contains']" :whereClause="whereClause" />
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
    <DropdownHeader :options="['is', 'range']" :whereClause="whereClause" />
    <ComparisonSelect v-if="whereClause.whereType === 'is'" :where="whereClause.whereValue" />
    <RangeSelect v-else-if="whereClause.whereType === 'range'" :range="whereClause.whereValue" />
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
import { WhereClauseUI } from "@im-library/interfaces";
const props = defineProps({
  datatype: { type: String, required: true },
  whereClause: { type: Object as PropType<WhereClauseUI>, required: true }
});
const emit = defineEmits({ onValueUpdate: (payload: any) => payload });
const booleanOptions = [
  { name: "true", value: true },
  { name: "false", value: false }
];
const selectedValue: Ref<any> = ref();
</script>

<style scoped></style>
