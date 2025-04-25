<template>
  <div v-if="columnNames.length > 0">
    <h4>Columns:</h4>
    <div class="pl-8">
      <span v-html="columnNames.join(', ')" />
    </div>
    <Button text :icon="!propertyExpand ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" @click="toggle" />
    <span>GraphQL</span>
    <span v-if="propertyExpand">
      <RecursiveReturnDisplay :select="select" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { Return } from "@/interfaces/AutoGen";
import { onMounted, Ref, ref, watch } from "vue";
import { cloneDeep, isEqual } from "lodash-es";
import RecursiveReturnDisplay from "./RecursiveReturnDisplay.vue";

interface Props {
  select: Return;
  propertyExpanded: boolean;
}
const props = defineProps<Props>();
const propertyExpand = ref(props.propertyExpanded);

const columnNames: Ref<string[]> = ref([]);
onMounted(() => {
  getColumnNamesFromReturn(props.select);
});

function toggle() {
  propertyExpand.value = !propertyExpand.value;
}
watch(
  () => cloneDeep(props.select),
  (newValue, oldValue) => {
    if (!isEqual(newValue, oldValue)) {
      columnNames.value = [];
      getColumnNamesFromReturn(newValue);
    }
  }
);

function getColumnNamesFromReturn(select: Return) {
  if (select.as) columnNames.value.push(select.as);
  if (select.property && isArrayHasLength(select.property)) {
    for (const property of select.property) {
      if (property.as) {
        columnNames.value.push(property.as);
      }
      if (property.return) {
        if (property.name) getColumnNamesFromReturn(property.return);
      }
    }
  }
}
</script>

<style scoped>
th,
td {
  border: 1px solid var(--p-content-border-color);
  padding: 8px 10px;
}
</style>
