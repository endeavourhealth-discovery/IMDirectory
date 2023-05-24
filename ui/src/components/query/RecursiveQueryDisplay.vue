<template>
  <div class="feature" v-for="(match, index) of matches">
    <div>
      <span v-if="index" v-html="!parentMatch ? getDisplayFromLogic('and') : getDisplayFromLogic(parentMatch.boolMatch)"></span>
      <span v-if="match.exclude" class="include-title" style="color: red"> exclude if </span>
      <span v-if="match.description" v-html="match.description"> </span>
      <span v-if="!index && match.nodeRef" v-html="getDisplayFromNodeRef(match.nodeRef)"></span>
      <span v-if="isArrayHasLength(match.match)">
        <RecursiveQueryDisplay
          v-if="match.match.some((nestedMatch: Match) => !isObjectHasKeys(nestedMatch, ['exclude']))"
          :include="true"
          :matches="match.match.filter((nestedMatch: Match) => !isObjectHasKeys(nestedMatch, ['exclude']))"
          :parent-match="match"
          :full-query="fullQuery"
        />
        <RecursiveQueryDisplay
          v-if="match.match.some((nestedMatch: Match) => isObjectHasKeys(nestedMatch, ['exclude']))"
          :include="false"
          :matches="match.match.filter((nestedMatch: Match) => !isObjectHasKeys(nestedMatch, ['exclude']))"
          :parent-match="match"
          :full-query="fullQuery"
        />
      </span>
      <span v-if="isObjectHasKeys(match, ['where']) && isArrayHasLength(match.where)">
        <span v-if="match.where.length == 1">
          <span v-if="hasNodeRef(match.where[0])" v-html="match.where[0].description" @click="onNodeRefClick(match.where[0], $event)"></span>
          <span v-else-if="hasBigList(match.where[0])" v-html="match.where[0].description" @click="onWhereInClick(match.where[0], $event)"></span>
          <span v-else v-html="match.where[0].description"></span>
          <span v-if="isArrayHasLength(match.where[0].where)">
            <RecursiveWhereDisplay :wheres="match.where[0].where" :parent-match="parentMatch" :parent-where="match.where[0]" :full-query="fullQuery" />
          </span>
        </span>

        <RecursiveWhereDisplay v-else :wheres="match.where" :parent-match="match" :full-query="fullQuery" />
      </span>
      <span v-if="match.variable" v-html="getDisplayFromVariable(match.variable)"></span>
    </div>
  </div>
  <OverlayPanel ref="op"> <QueryOverlay :full-query="fullQuery" :variable-name="getNodeRef(hoveredWhere)" /> </OverlayPanel>
  <OverlayPanel ref="op1">
    <ListOverlay :list="list" />
  </OverlayPanel>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match, Node, Query, Where } from "@im-library/interfaces/AutoGen";
import { PropType, Ref, ref } from "vue";
import RecursiveWhereDisplay from "./RecursiveWhereDisplay.vue";
import { getDisplayFromLogic, getDisplayFromNodeRef, getDisplayFromVariable } from "@im-library/helpers/QueryDescriptor";
import QueryOverlay from "./QueryOverlay.vue";
import ListOverlay from "./ListOverlay.vue";

interface Props {
  fullQuery: Query;
  parentMatch?: Match;
  matches: Match[];
}

const props = defineProps<Props>();

const op: Ref<any> = ref();
const hoveredWhere: Ref<Where> = ref({} as Where);
const list: Ref<Node[]> = ref([]);
const op1: Ref<any> = ref();

function hasNodeRef(where: Where) {
  return isObjectHasKeys(where, ["nodeRef"]) || isObjectHasKeys(where.relativeTo, ["nodeRef"]);
}

function onNodeRefClick(where: Where, event: any) {
  hoveredWhere.value = where;
  op.value.toggle(event);
}

function getNodeRef(where: Where) {
  return where.nodeRef ?? where.relativeTo.nodeRef;
}

function hasBigList(where: Where) {
  return (isArrayHasLength(where.in) && where.in.length > 1) || (isArrayHasLength(where.notIn) && where.notIn.length > 1);
}

function onWhereInClick(where: Where, event: any) {
  list.value = where.in ?? where.notIn;
  op1.value.toggle(event);
}
</script>

<style scoped>
.feature {
  display: flex;
  flex-flow: column;
  margin-left: 1rem;
  margin-top: 0.1rem;
  margin-bottom: 0.1rem;
}
</style>
