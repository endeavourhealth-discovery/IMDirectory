<template>
  <div v-if="datatype === XMLS.NAMESPACE + 'string'" class="property-input-container">
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
  <div v-else-if="datatype === XMLS.NAMESPACE + 'long' || datatype === XMLS.NAMESPACE + 'integer'" class="property-input-container">
    <Dropdown :options="['is', 'range']" v-model:model-value="whereType" />
    <ComparisonSelect v-if="whereType === 'is'" :where="where" />
    <RangeSelect v-else-if="whereType === 'range'" :from="where.range!.from" :to="where.range!.to" />
  </div>
  <div v-else-if="datatype === IM.NAMESPACE + 'DateTime'" class="property-input-container">
    <DateSelect :where="where" />
  </div>
</template>

<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import { Ref, onMounted, ref, watch } from "vue";
import ComparisonSelect from "./ComparisonSelect.vue";
import RangeSelect from "./RangeSelect.vue";
import { IM, XMLS } from "@im-library/vocabulary";
import { Assignable, Range, Where } from "@im-library/interfaces/AutoGen";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import DateSelect from "./DateSelect.vue";
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
  () => whereType.value,
  () => {
    if (whereType.value === "range" && !isObjectHasKeys(props.where, ["range"])) {
      props.where.range = { from: {} as Assignable, to: {} as Assignable } as Range;
    }
  }
);

onMounted(() => {
  if (isObjectHasKeys(props.where.range)) whereType.value = "range";
  else whereType.value = "is";
});
</script>

<style scoped>
.property-input-container {
  display: flex;
  width: 100%;
  gap: 0.5rem;
}
</style>
