<template>
  <div>
    <h4>Columns:</h4>
    <div class="pl-8">
      <span v-html="columnNames.join(', ')" />
      <Button text :icon="!propertyExpand ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" @click="toggle" />
      <span v-if="propertyExpand">
        <RecursiveReturnDisplay :select="select" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { Return, ReturnProperty } from "@/interfaces/AutoGen";
import { onMounted, Ref, ref, watch } from "vue";
import { cloneDeep, isEqual } from "lodash-es";
import RecursiveReturnDisplay from "./RecursiveReturnDisplay.vue";

interface Props {
  propertyExpanded: boolean;
  select: Return;
}
const props = defineProps<Props>();
const editSelect = ref({ ...props.select });
const propertyExpand = ref(props.propertyExpanded);

const columnNames: Ref<string[]> = ref([]);

onMounted(() => {
  getColumnNamesFromReturn(editSelect.value);
});

function toggle() {
  propertyExpand.value = !propertyExpand.value;
}

function getColumnNamesFromReturn(select: Return) {
  if (select.as) columnNames.value.push(select.as);
  if (select.property && isArrayHasLength(select.property)) {
    for (const property of select.property) {
      if (property.return) {
        getColumnNamesFromReturn(property.return);
      } else {
        if (property.as) {
          columnNames.value.push(property.as);
        } else columnNames.value.push(property.name ? property.name : "->");
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
