<template>
  <div v-if="editMode">
    <div v-for="entity in selected">
      <EntitySearch :entity-value="entity" @on-change="onChange" />
      <Button @click="add" icon="fa-solid fa-plus" severity="info" text rounded />
      <Button @click="updateValue" icon="fa-solid fa-check" severity="success" text rounded />
      <Button @click="cancel" icon="fa-solid fa-x" severity="danger" text rounded />
    </div>
  </div>
  <div v-else @dblclick="edit">
    <li v-for="item of value[property]">
      {{ item.name || item["@id"] || item["@set"] || item["@type"] }}
    </li>
  </div>
</template>

<script setup lang="ts">
import EntitySearch from "../EntitySearch.vue";
import { ConceptSummary } from "@im-library/interfaces";
import { TTAlias } from "@im-library/interfaces/AutoGen";
import { Ref, ref, onMounted } from "vue";
const emit = defineEmits({ onEdit: (payload: string) => payload });

const props = defineProps({
  editMode: { type: Boolean, required: true },
  property: { type: String, required: true },
  value: { type: Object, required: true }
});

const selected: Ref<TTAlias[]> = ref({} as TTAlias[]);

function edit() {
  emit("onEdit", props.property);
}

function cancel() {
  selected.value = [...props.value[props.property]];
  emit("onEdit", props.property);
}

function updateValue() {
  props.value[props.property] = selected.value.filter((inItem: TTAlias) => inItem.name);
  emit("onEdit", props.property);
}

function add() {
  selected.value.push({ name: "" } as TTAlias);
}

function onChange(cSummaries: ConceptSummary[]) {
  for (const cSummary of cSummaries) {
    selected.value.push({
      "@id": cSummary.iri,
      name: cSummary.name
    } as TTAlias);
  }
}

onMounted(() => {
  selected.value = [...props.value[props.property]];
});
</script>

<style scoped></style>
