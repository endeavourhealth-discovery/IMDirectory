<template>
  <div>
    <h4>Columns:</h4>
    <div class="pl-8">
      <table>
        <tr>
          <th v-for="columnName in columnNames" scope="col">{{ columnName }}</th>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { Return } from "@/interfaces/AutoGen";
import { onMounted, Ref, ref, watch } from "vue";
import { cloneDeep, isEqual } from "lodash-es";

interface Props {
  select: Return[];
}
const props = defineProps<Props>();

const columnNames: Ref<string[]> = ref([]);

onMounted(() => {
  for (const selectReturn of props.select) {
    getStringNamesFromReturn(selectReturn);
  }
});

watch(
  () => cloneDeep(props.select),
  (newValue, oldValue) => {
    if (!isEqual(newValue, oldValue)) {
      columnNames.value = [];
      for (const selectReturn of newValue) {
        getStringNamesFromReturn(selectReturn);
      }
    }
  }
);

function getStringNamesFromReturn(select: Return) {
  if (select.as) columnNames.value.push(select.as);
  if (select.property && isArrayHasLength(select.property)) {
    for (const property of select.property) {
      if (property.as) columnNames.value.push(property.as);
      if (property.return) getStringNamesFromReturn(property.return);
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
