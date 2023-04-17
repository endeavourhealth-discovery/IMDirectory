<template>
  <div class="base-clause">
    <Dropdown v-model="selectedType" :options="clauseTypes" optionLabel="name" placeholder="Select a type" @change="emit('onSelectType', $event.value)" />
    <PropertySelect v-if="selectedType.name === 'Property'" :from="from" :property="{}" @on-select="emit('onSelectTypeValue', $event)" />
    <EntitySearch v-else :entity-value="selectedTypeValue" @on-change="emit('onSelectTypeValue', $event)" />
    <AncestorDescendantSelect :selected="selectedOptions" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref, Ref, PropType } from "vue";
import EntitySearch from "../editTextQuery/EntitySearch.vue";
import { Element, Match } from "@im-library/interfaces/AutoGen";
import AncestorDescendantSelect from "../editTextQuery/AncestorDescendantSelect.vue";
import { ConceptSummary, ITextQuery } from "@im-library/interfaces";
import PropertySelect from "../editTextQuery/PropertySelect.vue";
import { TreeNode } from "primevue/tree";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
const props = defineProps({
  from: { type: Object as PropType<ITextQuery>, required: true },
  textQuery: { type: Object as PropType<ITextQuery>, required: true }
});

const emit = defineEmits({
  onSelectType: (payload: { name: string; prop: string }) => payload,
  onSelectTypeValue: (payload: ConceptSummary | TreeNode) => payload
});

const selectedType = ref({} as { name: string; prop: string });
const selectedTypeValue: Ref<ConceptSummary> = ref({} as ConceptSummary);
const selectedOptions: Ref<string[]> = ref([]);

const clauseTypes = ref([
  { name: "Type", prop: "@type" },
  { name: "Set", prop: "@set" },
  { name: "Property", prop: "@id" },
  { name: "Entity", prop: "@id" }
]);

onMounted(() => {
  setSelectedType();
  setSelectedTypeValue();
  setAncestorDescendants();
});

function setSelectedType() {
  if (isObjectHasKeys(props.textQuery.data, ["@type"])) selectedType.value = clauseTypes.value[0];
  else if (isObjectHasKeys(props.textQuery.data, ["@set"])) selectedType.value = clauseTypes.value[1];
  else if (isObjectHasKeys(props.textQuery.data, ["where", "path"])) selectedType.value = clauseTypes.value[2];
  else selectedType.value = clauseTypes.value[3];
}

function setSelectedTypeValue() {
  selectedTypeValue.value = {
    iri: props.textQuery.data["@type"] || props.textQuery.data["@set"] || props.textQuery.data["@id"],
    name: props.textQuery.data.name
  } as ConceptSummary;
}

function setAncestorDescendants() {
  if (isObjectHasKeys(props.textQuery.data, ["ancestorsOf"])) selectedOptions.value.push("ancestorsOf");
  else if (isObjectHasKeys(props.textQuery.data, ["descendantsOf"])) selectedOptions.value.push("descendantsOf");
  else if (isObjectHasKeys(props.textQuery.data, ["descendantsOrSelfOf"])) selectedOptions.value.push("descendantsOrSelfOf");
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
