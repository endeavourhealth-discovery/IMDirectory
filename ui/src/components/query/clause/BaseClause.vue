<template>
  <div class="base-clause">
    <Dropdown v-model="editClauseType" :options="clauseTypes" optionLabel="name" placeholder="Select a type" @change="onClauseTypeSelect" />
    <PropertySelect v-if="editClauseType.name === 'Property'" optionLabel="name" :baseEntityIri="baseEntityIri" :typeValue="(typeValue as any)" />
    <EntitySearch v-else :entity-value="typeValue" />
    <EntailmentOptionsSelect :entailmentOptions="entailmentOptions" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, PropType, watch } from "vue";
import EntitySearch from "../editTextQuery/EntitySearch.vue";
import EntailmentOptionsSelect from "../editTextQuery/EntailmentOptionsSelect.vue";
import { ConceptSummary } from "@im-library/interfaces";
import PropertySelect from "../editTextQuery/PropertySelect.vue";
const props = defineProps({
  baseEntityIri: { type: String, required: true },
  clauseType: { type: Object as PropType<{ name: string; prop: string }>, required: true },
  typeValue: { type: Object as PropType<ConceptSummary>, required: true },
  entailmentOptions: { type: Object as PropType<string[]>, required: true }
});

watch(
  () => props.typeValue.iri,
  () => initValues()
);

const editClauseType = ref({} as { name: string; prop: string });
const clauseTypes = [
  { name: "Type", prop: "@type" },
  { name: "Set", prop: "@set" },
  { name: "Property", prop: "@id" },
  { name: "Entity", prop: "@id" }
];

onMounted(() => {
  initValues();
});

function initValues() {
  editClauseType.value = clauseTypes.find(tp => tp.name === props.clauseType.name) || clauseTypes[0];
}

function onClauseTypeSelect() {
  props.clauseType.name = editClauseType.value.name;
  props.clauseType.prop = editClauseType.value.prop;
}
</script>

<style scoped>
.base-clause {
  display: flex;
  flex-flow: row;
  height: 100%;
  width: 100%;
}
</style>
