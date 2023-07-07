<template>
  <RecursiveQueryDisplay v-if="'match' === overlayObject.type" :match="overlayObject.data" :full-query="fullQuery" :isVariable="true" />
  <RecursivePropertyDisplay v-else-if="'property' === overlayObject.type" :property="overlayObject.data" :full-query="fullQuery" />
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match, Query, Property } from "@im-library/interfaces/AutoGen";
import { PropType, Ref, onMounted, ref, watch } from "vue";
import RecursiveQueryDisplay from "./RecursiveQueryDisplay.vue";
import RecursivePropertyDisplay from "./RecursivePropertyDisplay.vue";
interface Props {
  fullQuery: Query;
  variableName: string;
}

const props = defineProps<Props>();

onMounted(() => {
  overlayObject.value = findNestedQuery();
});

const overlayObject: Ref<{ type: string; data: any }> = ref({ type: "", data: "" });

function findNestedQuery() {
  const found = [] as any[];
  if (isArrayHasLength(props.fullQuery.match))
    for (const match of props.fullQuery.match!) {
      findRecursively(found, "match", match);
    }
  return found[0] ?? {};
}

function findRecursively(found: any[], type: string, matchOrProperty: any): any {
  if (matchOrProperty.variable === props.variableName) found.push({ type: type, data: matchOrProperty });

  if (isArrayHasLength(matchOrProperty.match)) {
    for (const match of matchOrProperty.match) {
      findRecursively(found, "match", match);
    }
  }

  if (isArrayHasLength(matchOrProperty.property)) {
    for (const property of matchOrProperty.property) {
      findRecursively(found, "property", property);
    }
  }
}
</script>

<style scoped></style>
