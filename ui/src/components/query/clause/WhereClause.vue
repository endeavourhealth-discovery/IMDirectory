<template>
  <PropertySelect optionLabel="name" :baseEntityIri="baseEntityIri" :typeValue="editProperty" />
  <ClassSelect v-if="isObjectHasKeys(editProperty.data, [SHACL.CLASS])" :selected-property="editProperty" :selected-value="undefined" />
  <DatatypeSelect v-else-if="isObjectHasKeys(editProperty.data, [SHACL.DATATYPE])" :datatype="editProperty.data[SHACL.DATATYPE][0]['@id']" />
  <div v-else>
    <DropdownHeader :options="['In', 'Not in', 'Is null']" />
    <EntitySearch :entity-value="editEntityValue" />
    <EntailmentOptionsSelect :entailmentOptions="editEntailmentOptions" />
  </div>
</template>

<script setup lang="ts">
import { PropType, Ref, onMounted, ref, watch } from "vue";
import ClassSelect from "./select/ClassSelect.vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import DatatypeSelect from "./select/DatatypeSelect.vue";
import EntitySearch from "../editTextQuery/EntitySearch.vue";
import DropdownHeader from "./DropdownHeader.vue";
import { MatchClauseUI, ConceptSummary, TreeNode, WhereClauseUI } from "@im-library/interfaces";
import { resolveIri } from "@im-library/helpers/TTTransform";
import EntailmentOptionsSelect from "../editTextQuery/EntailmentOptionsSelect.vue";
import { SHACL } from "@im-library/vocabulary";
import PropertySelect from "../editTextQuery/PropertySelect.vue";

const props = defineProps({
  baseEntityIri: { type: String, required: true },
  baseClause: { type: Object as PropType<MatchClauseUI>, required: true },
  whereClause: { type: Object as PropType<WhereClauseUI>, required: true }
});

const editProperty: Ref<TreeNode> = ref({} as TreeNode);
const editEntityValue: Ref<ConceptSummary> = ref({} as ConceptSummary);
const editEntailmentOptions: Ref<string[]> = ref([]);
watch(
  () => editProperty.value.iri,
  () => {
    initValues();
  }
);

onMounted(() => {
  initValues();
});

function initValues() {
  setEntityValue();
}

function setEntityValue() {
  if (isObjectHasKeys(editProperty.value, ["iri"])) {
    editEntityValue.value.iri = editProperty.value.iri;
    editEntityValue.value.name = editProperty.value.name || resolveIri(editProperty.value.iri);
  }
}
</script>

<style scoped></style>
