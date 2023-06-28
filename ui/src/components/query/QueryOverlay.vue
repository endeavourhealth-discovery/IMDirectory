<template>
  <RecursiveQueryDisplay v-if="'match' === overlayObject.type" :matches="[overlayObject.data]" :full-query="fullQuery" :isVariable="true" />
  <RecursiveWhereDisplay v-else-if="'where' === overlayObject.type" :wheres="[overlayObject.data]" :full-query="fullQuery" />
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match, Query, Where } from "@im-library/interfaces/AutoGen";
import { PropType, Ref, onMounted, ref, watch } from "vue";
import RecursiveQueryDisplay from "./RecursiveQueryDisplay.vue";
import RecursiveWhereDisplay from "./RecursiveWhereDisplay.vue";
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

function findRecursively(found: any[], type: string, matchOrWhere: any): any {
  if (matchOrWhere.variable === props.variableName) found.push({ type: type, data: matchOrWhere });

  if (isArrayHasLength(matchOrWhere.match)) {
    for (const match of matchOrWhere.match) {
      findRecursively(found, "match", match);
    }
  }

  if (isArrayHasLength(matchOrWhere.where)) {
    for (const where of matchOrWhere.where) {
      findRecursively(found, "where", where);
    }
  }
}
</script>

<style scoped></style>
