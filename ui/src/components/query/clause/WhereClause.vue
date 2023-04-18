<template>
  <ClassSelect v-if="isObjectHasKeys(property.data, ['http://www.w3.org/ns/shacl#class'])" :selected-property="property" :selected-value="undefined" />
  <DatatypeSelect
    v-else-if="isObjectHasKeys(property.data, ['http://www.w3.org/ns/shacl#datatype'])"
    :datatype="property.data['http://www.w3.org/ns/shacl#datatype'][0]['@id']"
  />
  <div v-else>
    <DropdownHeader :options="['In', 'Not in', 'Is null']" />
    <EntitySearch :entity-value="editEntityValue" />
    <EntailmentOptionsSelect :entailmentOptions="editEntailmentOptions" />
  </div>
</template>

<script setup lang="ts">
import { TreeNode } from "primevue/tree";
import { PropType, Ref, onMounted, ref, watch } from "vue";
import ClassSelect from "./select/ClassSelect.vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import DatatypeSelect from "./select/DatatypeSelect.vue";
import EntitySearch from "../editTextQuery/EntitySearch.vue";
import DropdownHeader from "./DropdownHeader.vue";
import { ConceptSummary } from "@im-library/interfaces";
import { resolveIri } from "@im-library/helpers/TTTransform";
import EntailmentOptionsSelect from "../editTextQuery/EntailmentOptionsSelect.vue";

const props = defineProps({
  property: { type: Object as PropType<TreeNode>, required: true }
});

const editEntityValue: Ref<ConceptSummary> = ref({} as ConceptSummary);
const editEntailmentOptions: Ref<string[]> = ref([]);
watch(
  () => props.property.iri,
  () => {
    initValues();
  }
);

onMounted(async () => {
  initValues();
});

function initValues() {
  console.log(props.property);
  setEntityValue();
}

function setEntityValue() {
  if (isObjectHasKeys(props.property, ["iri"])) {
    editEntityValue.value.iri = props.property.iri;
    editEntityValue.value.name = props.property.name || resolveIri(props.property.iri);
  }
}
</script>

<style scoped></style>
