<template>
  <div>
    Select:
    <MultiSelect class="multi-select" v-model="selectedProperties" :options="optionProperties" optionLabel="label" @update:modelValue="onUpdate" />
  </div>
  <div>
    Order by:
    <MultiSelect class="multi-select" v-model="selectedOrderBy" :options="selectedProperties" optionLabel="label" @update:modelValue="onUpdate" />
  </div>
  <div>Direction: <Dropdown v-model="selectedDirection" :options="directionOptions" @update:modelValue="onUpdate" /></div>
  <div>Limit: <InputNumber v-model="selectedLimit" @update:modelValue="onUpdate" /></div>
  <div>
    Group by:
    <MultiSelect class="multi-select" v-model="selectedGroupBy" :options="selectedProperties" optionLabel="label" @update:modelValue="onUpdate" />
  </div>
</template>

<script setup lang="ts">
import { SortDirection } from "@im-library/enums";
import { DatasetObject, UIProperty } from "@im-library/interfaces";
import { onMounted, PropType, Ref, ref } from "vue";

const props = defineProps({
  selectProperties: { type: Array as PropType<Array<any>>, required: true },
  optionProperties: { type: Array as PropType<Array<UIProperty>>, required: true }
});

const emit = defineEmits({
  onUpdate: (payload: DatasetObject) => true
});

const selectedProperties: Ref<UIProperty[]> = ref([]);
const selectedOrderBy: Ref<UIProperty[]> = ref([]);
const selectedGroupBy: Ref<UIProperty[]> = ref([]);
const directionOptions: Ref<string[]> = ref([]);
const selectedDirection: Ref<string> = ref("");
const selectedLimit: Ref<number> = ref(0);

onMounted(async () => {
  initOptions();
});

function onUpdate() {
  const datasetObject = {} as DatasetObject;
  if (selectedProperties.value.length) {
    datasetObject.selectedProperties = selectedProperties.value;
  }
  if (selectedOrderBy.value.length) {
    datasetObject.selectedOrderBy = selectedOrderBy.value;
  }
  if (selectedGroupBy.value.length) {
    datasetObject.selectedGroupBy = selectedGroupBy.value;
  }
  if (selectedDirection.value) {
    datasetObject.selectedDirection = selectedDirection.value;
  }
  if (selectedLimit.value) {
    datasetObject.selectedLimit = selectedLimit.value;
  }
  emit("onUpdate", datasetObject);
}

function initOptions() {
  const directionValues = Object.values(SortDirection);
  directionValues.length = 2;
  directionOptions.value = directionValues;
}
</script>

<style scoped></style>
