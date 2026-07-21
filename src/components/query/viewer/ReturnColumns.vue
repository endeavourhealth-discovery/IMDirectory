<template>
  <div>
    <span class="columns-prefix">Columns :</span>
    <span>{{ columnNames.join(",") }}</span>
    <Button :icon="!propertyExpand ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" text @click="toggle"></Button>
    <RecursiveReturnDisplay v-if="propertyExpand" :select="select" />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";

import { isArrayHasLength } from "@endeavour/vue-library/helpers";
import type { Query, Return } from "@endeavour/vue-library/interfaces";

import RecursiveReturnDisplay from "./RecursiveReturnDisplay.vue";

interface Props {
  select: Return[];
  parentQuery: Query;
  expand?: boolean;
}
const props = defineProps<Props>();
const propertyExpand = ref(false);
const columnNames = computed(() => {
  return getColumnNamesFromReturn(props.select);
});

onMounted(() => {
  if (props.expand) propertyExpand.value = props.expand;
});

function toggle() {
  propertyExpand.value = !propertyExpand.value;
}

function getColumnNamesFromReturn(select: Return[]): string[] {
  const asNames = [];
  if (isArrayHasLength(select)) {
    for (const property of select) {
      if (property.function && property.function.name) asNames.push(property.function.name);
      getColumnNamesFromProperty(property, asNames);
    }
  }
  return asNames;
}
function getColumnNamesFromProperty(property: Return, asNames: string[]) {
  if (property.as) {
    let columnName = property.as;
    if (property.units) columnName = columnName + " (" + property.units.name + ")";
    asNames.push(columnName);
  } else {
    let columnName = property.name ? property.name : "->";
    if (property.units) columnName = columnName + " (" + property.units.name + ")";
    asNames.push(columnName);
  }
  if (property.case) {
    let caseLabel = "";
    if (property.case.when) {
      let clause = 0;
      for (const when of property.case.when) {
        clause++;
        caseLabel = caseLabel + " -> if ";
        if (when.exists) {
          caseLabel = caseLabel + "exists ";
        }
        if (when.then) {
          caseLabel = caseLabel + " then " + when.then.value;
        }
      }
      if (property.case.else) {
        caseLabel = caseLabel + " else " + property.case.else.value;
      }
    }
    asNames.push(caseLabel);
  }
  if (property.return) {
    for (const subProperty of property.return) {
      getColumnNamesFromProperty(subProperty, asNames);
    }
  }
  if (property.semanticMap) asNames.push(" ->using map : " + property.semanticMap.name);
}
</script>
<style scoped>
.columns-prefix {
  font-weight: bold;
  padding-right: 0.2rem;
}
</style>
