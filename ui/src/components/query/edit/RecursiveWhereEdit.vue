<template>
  <div class="feature" v-for="(where, index) of wheres">
    <div>
      <span v-if="index" v-html="parentWhere && parentWhere.bool === 'or' ? getDisplayFromLogic('or') : ''"></span>
      <span v-if="hasNodeRef(where)" v-html="where.description"></span>
      <span v-else-if="hasBigList(where)" v-html="where.description"></span>
      <span v-else v-html="where.description"></span>
      <span v-if="isArrayHasLength(where.where)">
        <RecursiveWhereEdit :wheres="where.where!" :parent-match="parentMatch" :parent-where="where" :full-query="fullQuery" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getDisplayFromLogic } from "@im-library/helpers/TextQueryBuilder";
import { Match, Query, Where } from "@im-library/interfaces/AutoGen";

interface Props {
  fullQuery: Query;
  parentMatch?: Match;
  parentWhere?: Where;
  wheres: Where[];
}

const props = defineProps<Props>();

function hasBigList(where: Where) {
  return (isArrayHasLength(where.in) && where.in!.length > 1) || (isArrayHasLength(where.notIn) && where.notIn!.length > 1);
}

function hasNodeRef(where: Where) {
  return isObjectHasKeys(where, ["nodeRef"]) || isObjectHasKeys(where.relativeTo, ["nodeRef"]);
}
</script>

<style>
.feature {
  display: flex;
  flex-flow: column;
  margin-left: 1rem;
  margin-top: 0.1rem;
  margin-bottom: 0.1rem;
}

.variable {
  color: rgb(78, 2, 150) !important;
}

.variable-line {
  margin-left: 1rem !important;
}

.node-ref {
  color: rgb(138, 67, 138) !important;
  cursor: pointer !important;
}
</style>
