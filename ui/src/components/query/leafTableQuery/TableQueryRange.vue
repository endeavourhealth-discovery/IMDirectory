<template>
  <div v-if="editMode">
    <div class="p-inputgroup flex-1 range-row">
      from:
      <Dropdown v-model="editRange.from.operator" :options="operatorOptions" placeholder="Select opearator" class="w-full md:w-14rem" />
      <InputText v-model="editRange.from.value" placeholder="Value" />
      <InputText v-model="editRange.from.unit" placeholder="Unit" />
      than
      <InputText v-model="editRange.from.relativeTo" placeholder="Relative to" />
    </div>
    <div class="p-inputgroup flex-1 range-row">
      to:
      <Dropdown v-model="editRange.to.operator" :options="operatorOptions" placeholder="Select opearator" class="w-full md:w-14rem" />
      <InputText v-model="editRange.to.value" placeholder="Value" />
      <InputText v-model="editRange.to.unit" placeholder="Unit" />
      than
      <InputText v-model="editRange.to.relativeTo" placeholder="Relative to" />
    </div>
    <Button @click="enterValue" icon="fa-solid fa-check" severity="success" text rounded />
    <Button @click="cancel" icon="fa-solid fa-x" severity="danger" text rounded />
  </div>
  <div v-else-if="editRange.from" @dblclick="edit">
    from
    <span v-if="editRange.from.operator">{{ editRange.from.operator }}</span>
    <span v-if="editRange.from.value">{{ editRange.from.value }}</span>
    <span v-if="editRange.from.unit">{{ editRange.from.unit }}</span>
    <span v-if="editRange.from.relativeTo">than {{ editRange.from.relativeTo }}</span>
    to
    <span v-if="editRange.to.operator">{{ editRange.to.operator }}</span>
    <span v-if="editRange.to.value">{{ editRange.to.value }}</span>
    <span v-if="editRange.to.unit">{{ editRange.to.unit }}</span>
    <span v-if="editRange.to.relativeTo">than {{ editRange.to.relativeTo }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, Ref } from "vue";
import { Range } from "@im-library/interfaces/AutoGen";
const emit = defineEmits({ onEdit: (payload: string) => payload });

const props = defineProps({
  editMode: { type: Boolean, required: true },
  property: { type: String, required: true },
  value: { type: Object, required: true }
});
const editRange: Ref<Range> = ref({} as Range);
const operatorOptions = ["=", ">=", ">", "<=", "startsWith", "contains"];

function edit() {
  emit("onEdit", props.property);
}

function cancel() {
  emit("onEdit", props.property);
}

function enterValue() {
  props.value[props.property] = { ...editRange.value };
  emit("onEdit", props.property);
}

onMounted(() => {
  editRange.value = { ...props.value[props.property] };
});
</script>

<style scoped>
.range-row {
  display: flex;
  align-items: baseline;
}
</style>
