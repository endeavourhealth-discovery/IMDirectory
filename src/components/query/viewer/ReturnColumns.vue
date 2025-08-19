<template>
  <div>
    <span class="columns-prefix">Columns :</span>
    <span>{{ columnNames.join(",") }}</span>
    <Button text :icon="!propertyExpand ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" @click="toggle"></Button>
    <RecursiveReturnDisplay v-if="propertyExpand" :select="select" :parentQuery="parentQuery" />
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { Return, Query } from "@/interfaces/AutoGen";
import { onMounted, Ref, ref } from "vue";
import RecursiveReturnDisplay from "./RecursiveReturnDisplay.vue";

interface Props {
  select: Return;
  parentQuery: Query;
}
const props = defineProps<Props>();
const editSelect = ref({ ...props.select });
const propertyExpand = ref(false);
const columnNames: Ref<string[]> = ref([]);

onMounted(() => {
  getColumnNamesFromReturn(editSelect.value);
});

function toggle() {
  propertyExpand.value = !propertyExpand.value;
}

function getColumnNamesFromReturn(select: Return) {
  if (select.as) columnNames.value.push(select.as);
  if (select.function && select.function.name) columnNames.value.push(select.function.name);
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
.columns-prefix {
  font-weight: bold;
  padding-right: 0.2rem;
}
</style>
