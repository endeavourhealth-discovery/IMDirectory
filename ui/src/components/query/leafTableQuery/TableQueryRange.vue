<template>
  <div v-if="editMode">
    <div class="p-inputgroup flex-1 range-row">
      from:
      <Dropdown v-model="range.from.operator" :options="operatorOptions" placeholder="Select opearator" class="w-full md:w-14rem" />
      <InputText v-model="range.from.value" placeholder="Value" />
      <InputText v-model="range.from.unit" placeholder="Unit" />
      than
      <InputText v-model="range.from.relativeTo" placeholder="Relative to" />
    </div>
    <div class="p-inputgroup flex-1 range-row">
      to:
      <Dropdown v-model="range.to.operator" :options="operatorOptions" placeholder="Select opearator" class="w-full md:w-14rem" />
      <InputText v-model="range.to.value" placeholder="Value" />
      <InputText v-model="range.to.unit" placeholder="Unit" />
      than
      <InputText v-model="range.to.relativeTo" placeholder="Relative to" />
    </div>
    <Button @click="cancel" icon="fa-solid fa-check" severity="danger" text rounded aria-label="Cancel" />
  </div>
  <div v-else @dblclick="edit">
    from
    <span v-if="range.from.operator">{{ range.from.operator }}</span>
    <span v-if="range.from.value">{{ range.from.value }}</span>
    <span v-if="range.from.unit">{{ range.from.unit }}</span>
    <span v-if="range.from.relativeTo">than {{ range.from.relativeTo }}</span>
    to
    <span v-if="range.to.operator">{{ range.to.operator }}</span>
    <span v-if="range.to.value">{{ range.to.value }}</span>
    <span v-if="range.to.unit">{{ range.to.unit }}</span>
    <span v-if="range.to.relativeTo">than {{ range.to.relativeTo }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef } from "vue";
import { Range } from "@im-library/interfaces/AutoGen";
const emit = defineEmits({ onEdit: (payload: string) => payload });

const props = defineProps({
  editMode: { type: Boolean, required: true },
  property: { type: String, required: true },
  value: { type: Object, required: true }
});
const range: ComputedRef<Range> = computed(() => props.value[props.property]);
const operatorOptions = ["=", ">=", ">", "<=", "startsWith", "contains"];

function edit() {
  emit("onEdit", props.property);
}

function cancel() {
  emit("onEdit", props.property);
}
</script>

<style scoped>
.range-row {
  display: flex;
  align-items: baseline;
}
</style>
