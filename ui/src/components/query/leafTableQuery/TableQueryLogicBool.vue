<template>
  <div v-if="editMode" @keyup.enter="enterValue">
    {{ property }}: <Dropdown type="text" v-model="editValue" :options="booleans" />
    <Button @click="enterValue" icon="fa-solid fa-check" severity="success" text rounded />
    <Button @click="cancel" icon="fa-solid fa-x" severity="danger" text rounded />
  </div>
  <div v-else @dblclick="edit">{{ property }}: {{ value[property] }}</div>
</template>

<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import { ref, Ref, onMounted } from "vue";

const props = defineProps({
  editMode: { type: Boolean, required: true },
  property: { type: String, required: true },
  value: { type: Object, required: true }
});

const emit = defineEmits({ onEdit: (payload: string) => payload });
const editValue: Ref<string> = ref("");
const booleans = ["and", "or"];

function enterValue() {
  props.value[props.property] = editValue.value;
  emit("onEdit", props.property);
}

function edit() {
  emit("onEdit", props.property);
}

function cancel() {
  editValue.value = props.value[props.property];
  emit("onEdit", props.property);
}

onMounted(() => {
  editValue.value = props.value[props.property];
});
</script>

<style scoped></style>
