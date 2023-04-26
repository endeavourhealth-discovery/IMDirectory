<template>
  <div>
    <PropertySelect optionLabel="name" :baseEntityIri="baseEntityIri" :property="whereClause.whereProperty" />
    <EntailmentOptionsSelect :entailmentOptions="whereClause.whereEntailment" />
  </div>
  <ClassSelect
    v-if="isObjectHasKeys(whereClause.whereProperty.data, [SHACL.CLASS])"
    :selected-property="whereClause.whereProperty"
    :selected-value="whereClause.whereValue"
  />
  <DatatypeSelect
    v-else-if="isObjectHasKeys(whereClause.whereProperty.data, [SHACL.DATATYPE])"
    :datatype="whereClause.whereProperty.data[SHACL.DATATYPE][0]['@id']"
    :whereClause="whereClause"
  />
  <div v-else>
    <DropdownHeader :options="['in', 'notIn', 'isNull']" :where-clause="whereClause" />
    <EntitySearch :entity-value="editEntityValue" />
    <EntailmentOptionsSelect :entailmentOptions="editEntailmentOptions" />
  </div>
  <Divider />
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
