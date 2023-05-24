<template>
  <div class="feature" v-for="(where, index) of wheres">
    <div>
      <span v-if="index" v-html="parentWhere && parentWhere.bool === 'or' ? getDisplayFromLogic('or') : ''"></span>
      <span v-if="hasNodeRef(where)" v-html="where.description" @click="onNodeRefClick(where, $event)"></span>
      <span v-else-if="hasBigList(where)" v-html="where.description" @click="onWhereInClick(where, $event)"></span>
      <span v-else v-html="where.description"></span>
      <span v-if="isArrayHasLength(where.where)">
        <RecursiveWhereDisplay :wheres="where.where!" :parent-match="parentMatch" :parent-where="where" :full-query="fullQuery" />
      </span>
    </div>
  </div>
  <OverlayPanel ref="op"> <QueryOverlay :full-query="fullQuery" :variable-name="getNodeRef(clickedWhere)" /> </OverlayPanel>
  <OverlayPanel ref="op1">
    <ListOverlay :list="list" />
  </OverlayPanel>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getDisplayFromLogic } from "@im-library/helpers/TextQueryBuilder";
import { Match, Node, Query, Where } from "@im-library/interfaces/AutoGen";
import { Ref } from "vue";
import { ref } from "vue";
import QueryOverlay from "./QueryOverlay.vue";
import ListOverlay from "./ListOverlay.vue";

interface Props {
  fullQuery: Query;
  parentMatch?: Match;
  parentWhere?: Where;
  wheres: Where[];
}

const props = defineProps<Props>();

const op: Ref<any> = ref();
const op1: Ref<any> = ref();

const clickedWhere: Ref<Where> = ref({} as Where);
const list: Ref<Node[]> = ref([]);

function hasBigList(where: Where) {
  return (isArrayHasLength(where.in) && where.in!.length > 1) || (isArrayHasLength(where.notIn) && where.notIn!.length > 1);
}

function onNodeRefClick(where: Where, event: any) {
  clickedWhere.value = where;
  op.value.toggle(event);
}

function onWhereInClick(where: Where, event: any) {
  list.value = (where.in ?? where.notIn) as Node[];
  op1.value.toggle(event);
}

function hasNodeRef(where: Where) {
  return isObjectHasKeys(where, ["nodeRef"]) || isObjectHasKeys(where.relativeTo, ["nodeRef"]);
}

function getNodeRef(where: Where) {
  return (where.nodeRef ?? where.relativeTo?.nodeRef) as string;
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
