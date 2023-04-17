<template>
  <div class="base-clause">
    <Dropdown v-model="selectedType" :options="clauseTypes" optionLabel="name" placeholder="Select a type" />
    <PropertySelect v-if="selectedType.name === 'Property'" :baseEntityIri="baseEntityIri" :property="{}" @on-select="onPropertySelect" />
    <EntitySearch v-else :entity-value="selectedTypeValue" @on-change="onEntitySearchSelect($event)" />
    <AncestorDescendantSelect :selected="selectedOptions" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref, PropType } from "vue";
import EntitySearch from "../editTextQuery/EntitySearch.vue";
import { Match } from "@im-library/interfaces/AutoGen";
import AncestorDescendantSelect from "../editTextQuery/AncestorDescendantSelect.vue";
import { ConceptSummary, ITextQuery } from "@im-library/interfaces";
import PropertySelect from "../editTextQuery/PropertySelect.vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
const props = defineProps({
  baseEntityIri: { type: String, required: true },
  match: { type: Object as PropType<Match>, required: true }
});

const emit = defineEmits({
  onMatchUpdate: (payload: Match) => payload
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

const editMatch: Ref<Match> = ref({} as Match);

onMounted(() => {
  editMatch.value = { ...props.match };
  setSelectedType();
  setSelectedTypeValue();
  setAncestorDescendants();
});

function setSelectedType() {
  if (isObjectHasKeys(props.match, ["@type"])) selectedType.value = clauseTypes.value[0];
  else if (isObjectHasKeys(props.match, ["@set"])) selectedType.value = clauseTypes.value[1];
  else if (isObjectHasKeys(props.match, ["where", "path"])) selectedType.value = clauseTypes.value[2];
  else selectedType.value = clauseTypes.value[3];
}

function setSelectedTypeValue() {
  selectedTypeValue.value = {
    iri: props.match["@type"] || props.match["@set"] || props.match["@id"],
    name: props.match.name
  } as ConceptSummary;
}

function setAncestorDescendants() {
  if (isObjectHasKeys(props.match, ["ancestorsOf"])) selectedOptions.value.push("ancestorsOf");
  else if (isObjectHasKeys(props.match, ["descendantsOf"])) selectedOptions.value.push("descendantsOf");
  else if (isObjectHasKeys(props.match, ["descendantsOrSelfOf"])) selectedOptions.value.push("descendantsOrSelfOf");
}

function onPropertySelect() {
  props.match.where = [];
  emit("onMatchUpdate", editMatch.value);
}

function onEntitySearchSelect(event: ConceptSummary) {
  const iriProps = ["@id", "@set", "@type"];
  for (const prop of iriProps) {
    delete (editMatch.value as any)[prop];
  }

  (editMatch.value as any)[selectedType.value.prop] = event.iri;
  editMatch.value.name = event.name;
  emit("onMatchUpdate", editMatch.value);
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
