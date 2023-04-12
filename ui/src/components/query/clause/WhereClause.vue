<template>
  where
  <!-- <ValueSelect
    v-if="isObjectHasKeys(property.data, [SHACL.CLASS]) || isObjectHasKeys(property.data, [SHACL.NODE])"
    :selected-property="property"
    :from="from"
    :selectedValue="value"
  /> -->
</template>

<script setup lang="ts">
import { TreeNode } from "primevue/tree";
import { PropType, onMounted, watch } from "vue";
import ValueSelect from "../editTextQuery/ValueSelect.vue";
const props = defineProps({
  property: { type: Object as PropType<TreeNode>, required: true }
});

onMounted(async () => {});
</script>

<style scoped></style>
