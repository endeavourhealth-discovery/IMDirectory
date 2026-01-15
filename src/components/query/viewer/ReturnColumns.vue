<template>
  <div>
    <span class="columns-prefix">Columns :</span>
    <span>{{ columnNames.join(",") }}</span>
    <Button text :icon="!propertyExpand ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" @click="toggle"></Button>
    <RecursiveReturnDisplay v-if="propertyExpand" :select="select" />
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { Return, Query } from "@/interfaces/AutoGen";
import { onMounted, Ref, ref } from "vue";
import RecursiveReturnDisplay from "./RecursiveReturnDisplay.vue";

interface Props {
  select: Return[];
  parentQuery: Query;
  expand?: boolean;
}
const props = defineProps<Props>();
const propertyExpand = ref(false);
const columnNames: Ref<string[]> = ref([]);

onMounted(() => {
  getColumnNamesFromReturn(props.select);
  if (props.expand) propertyExpand.value = props.expand;
});

function toggle() {
  propertyExpand.value = !propertyExpand.value;
}

function getColumnNamesFromReturn(select: Return[]) {
  if (isArrayHasLength(select)) {
    for (const property of select) {
      if (property.function && property.function.name) columnNames.value.push(property.function.name);
      getColumnNamesFromProperty(property);
    }
  }
}
function getColumnNamesFromProperty(property: Return) {
  if (property.as) {
    columnNames.value.push(property.as);
  } else columnNames.value.push(property.name ? property.name : "->");
  if (property.return) {
    for (const subProperty of property.return) {
      getColumnNamesFromProperty(subProperty);
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
