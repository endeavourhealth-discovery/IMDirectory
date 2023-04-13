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
  <EntitySearch v-else :entity-value="undefined" />
</template>

<script setup lang="ts">
import { TreeNode } from "primevue/tree";
import { PropType, onMounted } from "vue";
import ClassSelect from "./ClassSelect.vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import DatatypeSelect from "./DatatypeSelect.vue";
import EntitySearch from "../editTextQuery/EntitySearch.vue";
const emit = defineEmits({ onSelectPropertyValue: (payload: TreeNode) => payload });

const props = defineProps({
  property: { type: Object as PropType<TreeNode>, required: true }
});

onMounted(async () => {});
</script>

<style scoped></style>
