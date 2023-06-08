<template>
  <div v-if="datatype === XMLS.NAMESPACE + 'string'">
    <Dropdown :options="['is', 'startsWith', 'contains']" v-model:model-value="whereType" />
    <InputText type="text" v-model:model-value="where.value" />
  </div>
  <Dropdown
    v-else-if="datatype === XMLS.NAMESPACE + 'boolean'"
    :options="booleanOptions"
    option-label="name"
    option-value="value"
    v-model:model-value="where.value"
  />
  <div v-else-if="datatype === XMLS.NAMESPACE + 'long' || datatype === XMLS.NAMESPACE + 'integer'">
    <Dropdown :options="['is', 'range']" v-model:model-value="whereType" />
    <ComparisonSelect v-if="whereType === 'is'" :where="where" />
    <RangeSelect v-else-if="whereType === 'range'" :where="where" />
  </div>
  <div v-else-if="datatype === IM.NAMESPACE + 'DateTime'"><Calendar v-model:model-value="selectedValue" @change="emit('onValueUpdate', $event)" /></div>
</template>

<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import { Ref, onMounted, ref, watch } from "vue";
import ComparisonSelect from "../../editTextQuery/ComparisonSelect.vue";
import RangeSelect from "../../editTextQuery/RangeSelect.vue";
import { IM, XMLS } from "@im-library/vocabulary";
import { Assignable, Range, Where } from "@im-library/interfaces/AutoGen";
import { describeWhere } from "@im-library/helpers/QueryDescriptor";
interface Props {
  where: Where;
  datatype: string;
}

const props = defineProps<Props>();
const emit = defineEmits({ onValueUpdate: (payload: any) => payload });
const whereType: Ref<string> = ref("");
const booleanOptions = [
  { name: "true", value: true },
  { name: "false", value: false }
];
const selectedValue: Ref<any> = ref();

watch(
  () => props.where.value,
  () => describeWhere([props.where], "where")
);

watch(
  () => whereType.value,
  () => {
    if (whereType.value === "range") {
      props.where.range = { from: {} as Assignable, to: {} as Assignable } as Range;
    }
  }
);

onMounted(() => {
  whereType.value = "is";
});
</script>

<style scoped></style>
