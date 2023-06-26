<template>
  <div>
    <span v-if="index" v-html="!parentMatch ? getDisplayFromLogic('and') : getDisplayFromLogic(parentMatch.boolMatch!)"></span>
    <span v-if="match.exclude" class="include-title" style="color: red"> exclude if </span>
    <span v-if="match.description" v-html="match.description"> </span>
    <span v-if="!index && match.nodeRef" v-html="getDisplayFromNodeRef(match.nodeRef)"></span>

    <span v-if="isObjectHasKeys(match, ['where']) && isArrayHasLength(match.where)">
      <span v-if="match.where!.length === 1">
        <span v-if="hasNodeRef(match.where![0])" v-html="match.where![0].description"></span>
        <span v-else-if="hasBigList(match.where![0])" v-html="match.where![0].description"></span>
        <span v-else v-html="match.where![0].description"></span>
        <span v-if="isArrayHasLength(match.where![0].where)">
          <RecursiveWhereEdit :wheres="match.where![0].where!" :parent-match="parentMatch" :parent-where="match.where![0]" />
        </span>
      </span>

      <RecursiveWhereEdit v-else :wheres="match.where!" :parent-match="match" />
    </span>
    <span v-if="isArrayHasLength(match.orderBy)" v-for="orderBy of match.orderBy"> <div v-html="orderBy.description"></div></span>
    <span v-if="match.variable" v-html="getDisplayFromVariable(match.variable)"></span>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match, Where } from "@im-library/interfaces/AutoGen";
import { getDisplayFromLogic, getDisplayFromNodeRef, getDisplayFromVariable } from "@im-library/helpers/QueryDescriptor";
import RecursiveWhereEdit from "../edit/RecursiveWhereEdit.vue";

interface Props {
  parentMatch?: Match;
  match: Match;
  index: number;
  baseEntityMatch: Match;
}

const props = defineProps<Props>();

function hasNodeRef(where: Where) {
  return isObjectHasKeys(where, ["nodeRef"]) || isObjectHasKeys(where.relativeTo, ["nodeRef"]);
}

function hasBigList(where: Where) {
  return (isArrayHasLength(where.in) && where.in!.length > 1) || (isArrayHasLength(where.notIn) && where.notIn!.length > 1);
}
</script>

<style scoped>
/* .feature {
  display: flex;
  flex-flow: column;
  margin-left: 1rem;
  margin-top: 0.1rem;
  margin-bottom: 0.1rem;
  cursor: pointer;
}

.feature:hover {
  background-color: var(--highlight-bg);
} */

.selected {
  border: 1px dotted;
  background-color: var(--highlight-bg);
  color: var(--text-color);
  border-color: var(--focus-ring);
  border-radius: var(--border-radius);
}

.p-dialog-content {
  height: 100% !important;
}
</style>
