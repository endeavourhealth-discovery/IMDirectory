<template>
  <div v-if="editMode">
    <div v-for="(entity, index) in value[property]">
      <EntitySearch :entity-value="entity" @on-change="onChange($event, entity)" />
      <Button @click="add" icon="fa-solid fa-plus" severity="danger" text rounded />
      <Button @click="cancel" icon="fa-solid fa-check" severity="danger" text rounded />
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
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
const emit = defineEmits({ onEdit: (payload: string) => payload });

const props = defineProps({
  editMode: { type: Boolean, required: true },
  property: { type: String, required: true },
  value: { type: Object, required: true }
});

function edit() {
  emit("onEdit", props.property);
}

function cancel() {
  props.value[props.property] = props.value[props.property].filter((inItem: TTAlias) => inItem.name);
  emit("onEdit", props.property);
}

function add() {
  props.value[props.property].push({ name: "" });
}

function onChange(cSummaries: ConceptSummary[], entity: TTAlias) {
  if (cSummaries.length) {
    entity["@id"] = cSummaries[0].iri;
    entity.name = cSummaries[0].name;
  }
}
</script>

<style scoped></style>
