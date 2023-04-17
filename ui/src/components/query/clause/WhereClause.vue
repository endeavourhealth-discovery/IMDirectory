<template>
  <ClassSelect
    v-if="isObjectHasKeys(property.data, ['http://www.w3.org/ns/shacl#class'])"
    :selected-property="property"
    :selected-value="undefined"
    @on-select-property-value="emit('onSelectPropertyValue', $event)"
  />
  <DatatypeSelect
    v-else-if="isObjectHasKeys(property.data, ['http://www.w3.org/ns/shacl#datatype'])"
    :datatype="property.data['http://www.w3.org/ns/shacl#datatype'][0]['@id']"
  />
  <div v-else>
    <DropdownHeader :options="['In', 'Not in', 'Is null']" />
    <EntitySearch :entity-value="editEntityValue" />
  </div>
</template>

<script setup lang="ts">
import { TreeNode } from "primevue/tree";
import { PropType, Ref, onMounted, ref } from "vue";
import ClassSelect from "./select/ClassSelect.vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import DatatypeSelect from "./select/DatatypeSelect.vue";
import EntitySearch from "../editTextQuery/EntitySearch.vue";
import DropdownHeader from "./DropdownHeader.vue";
import { ConceptSummary } from "@im-library/interfaces";
import { Where } from "@im-library/interfaces/AutoGen";
const emit = defineEmits({ onSelectPropertyValue: (payload: TreeNode) => payload });

const props = defineProps({
  property: { type: Object as PropType<TreeNode>, required: true },
  selectedWhere: { type: Object as PropType<Where>, required: true }
});

const editEntityValue: Ref<ConceptSummary> = ref({} as ConceptSummary);

onMounted(async () => {});
</script>

<style scoped></style>
