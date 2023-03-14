<template>
  <div v-if="editMode" @keyup.enter="enterValue">
    {{ property }}: <InputText type="text" v-model="editValue" />
    <Button @click="cancel" icon="fa-solid fa-x" severity="danger" text rounded aria-label="Cancel" />
  </div>
  <div v-else @dblclick="edit">{{ property }}: {{ value[property] }}</div>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted } from "vue";

const props = defineProps({
  editMode: { type: Boolean, required: true },
  property: { type: String, required: true },
  value: { type: Object, required: true }
});

const emit = defineEmits({ onEdit: (payload: string) => payload });
const editValue: Ref<string> = ref("");

function enterValue() {
  props.value[props.property] = editValue.value;
  emit("onEdit", props.property);
}

function edit() {
  emit("onEdit", props.property);
}

function cancel() {
  emit("onEdit", props.property);
}

onMounted(() => {
  editValue.value = props.value[props.property];
});
</script>

<style scoped></style>
