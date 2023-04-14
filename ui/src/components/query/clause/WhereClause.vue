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
    <EntitySearch :entity-value="undefined" />
  </div>
</template>

<script setup lang="ts">
import { TreeNode } from "primevue/tree";
import { PropType, onMounted } from "vue";
import ClassSelect from "./select/ClassSelect.vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import DatatypeSelect from "./select/DatatypeSelect.vue";
import EntitySearch from "../editTextQuery/EntitySearch.vue";
import DropdownHeader from "./DropdownHeader.vue";
const emit = defineEmits({ onSelectPropertyValue: (payload: TreeNode) => payload });

const props = defineProps({
  property: { type: Object as PropType<TreeNode>, required: true }
});

onMounted(async () => {});
</script>

<style scoped></style>
