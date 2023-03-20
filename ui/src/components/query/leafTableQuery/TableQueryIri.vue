<template>
  <div v-if="editMode" @keyup.enter="enterValue">
    <EntitySearch :entity-value="selectedValue" @on-change="onChange" />
    <Button @click="enterValue" icon="fa-solid fa-check" severity="success" text rounded />
    <Button @click="cancel" icon="fa-solid fa-x" severity="danger" text rounded />
  </div>
  <div v-else @dblclick="edit">{{ value.name || value[property] }}</div>
</template>

<script setup lang="ts">
import { ConceptSummary } from "@im-library/interfaces";
import { ref, Ref, onMounted } from "vue";
import EntitySearch from "../EntitySearch.vue";

const props = defineProps({
  editMode: { type: Boolean, required: true },
  property: { type: String, required: true },
  value: { type: Object, required: true }
});

const emit = defineEmits({ onEdit: (payload: string) => payload });
const editValue: Ref<string> = ref("");
const selectedValue: Ref<any> = ref({});

function enterValue() {
  props.value["@id"] = selectedValue.value["@id"];
  props.value.name = selectedValue.value.name;
  props.value[props.property] = editValue.value;
  emit("onEdit", props.property);
}

function edit() {
  emit("onEdit", props.property);
}

function cancel() {
  selectedValue.value["@id"] = props.value["@id"];
  selectedValue.value.name = props.value.name;
  emit("onEdit", props.property);
}

function onChange(cSummaries: ConceptSummary[]) {
  if (cSummaries.length) {
    selectedValue.value["@id"] = cSummaries[0].iri;
    selectedValue.value.name = cSummaries[0].name;
    editValue.value = props.value[props.property];
  }
}

onMounted(() => {
  selectedValue.value = { ...props.value };
  editValue.value = props.value[props.property];
});
</script>

<style scoped></style>
