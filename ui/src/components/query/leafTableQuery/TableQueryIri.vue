<template>
  <div v-if="editMode" @keyup.enter="enterValue">
    <EntitySearch :entity-value="(value as any)" @on-change="onChange" />
    <Button @click="cancel" icon="fa-solid fa-x" severity="danger" text rounded aria-label="Cancel" />
  </div>
  <div v-else @dblclick="edit">{{ value[property] }}</div>
</template>

<script setup lang="ts">
import { ConceptSummary } from "@im-library/interfaces";
import { TTAlias } from "@im-library/interfaces/AutoGen";
import { ref, Ref, onMounted } from "vue";
import EntitySearch from "../EntitySearch.vue";

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

function onChange(cSummaries: ConceptSummary[]) {
  if (cSummaries.length) {
    props.value["@id"] = cSummaries[0].iri;
    props.value.name = cSummaries[0].name;
    editValue.value = props.value[props.property];
  }
}

onMounted(() => {
  editValue.value = props.value[props.property];
});
</script>

<style scoped></style>
