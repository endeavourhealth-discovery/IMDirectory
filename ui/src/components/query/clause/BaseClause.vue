<template>
  <div class="base-clause">
    <Dropdown v-model="editClauseType" :options="clauseTypes" optionLabel="name" placeholder="Select a type" @change="onClauseTypeSelect" />
    <PropertySelect v-if="editClauseType.name === 'Property'" optionLabel="name" :baseEntityIri="baseEntityIri" :typeValue="typeValue" />
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
  async () => initValues()
);

const editClauseType = ref({} as { name: string; prop: string });
const clauseTypes = ref([
  { name: "Type", prop: "@type" },
  { name: "Set", prop: "@set" },
  { name: "Property", prop: "@id" },
  { name: "Entity", prop: "@id" }
]);

onMounted(() => {
  initValues();
});

function initValues() {
  editClauseType.value = clauseTypes.value.find(tp => tp.name === props.clauseType.name) || clauseTypes.value[0];
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
