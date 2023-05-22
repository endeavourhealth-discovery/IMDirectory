<template>
  <div class="feature" v-for="(where, index) of wheres">
    <div>
      {{ hasBigList(where) }}
      <span v-if="index" v-html="!parentWhere ? getDisplayFromLogic('and') : getDisplayFromLogic(parentWhere.bool)"></span>
      <span v-if="hasNodeRef(where)" v-html="where.description" @click="onNodeRefClick(where, $event)"></span>
      <span v-else-if="hasBigList(where)" v-html="where.description" @click="onWhereInClick(where, $event)"></span>
      <span v-else v-html="where.description"></span>
      <span v-if="isArrayHasLength(where.where)">
        <RecursiveWhereDisplay :wheres="where.where" :parent-match="parentMatch" :parent-where="where" :full-query="fullQuery" />
      </span>
    </div>
  </div>
  <OverlayPanel ref="op"> <QueryOverlay :full-query="fullQuery" :variable-name="getNodeRef(hoveredWhere)" /> </OverlayPanel>
  <OverlayPanel ref="op1">
    <div v-for="item in list">{{ item.name }}</div>
  </OverlayPanel>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getDisplayFromLogic } from "@im-library/helpers/TextQueryBuilder";
import { Match, Node, Query, Where } from "@im-library/interfaces/AutoGen";
import { PropType, Ref } from "vue";
import { ref } from "vue";
import QueryOverlay from "./QueryOverlay.vue";

interface Props {
  fullQuery: Query;
  parentMatch?: Match;
  parentWhere?: Where;
  wheres: Where[];
}

const props = defineProps<Props>();

const op: Ref<any> = ref();
const op1: Ref<any> = ref();

const hoveredWhere: Ref<Where> = ref({} as Where);
const list: Ref<Node[]> = ref([]);

function hasBigList(where: Where) {
  return (isArrayHasLength(where.in) && where.in.length > 1) || (isArrayHasLength(where.notIn) && where.notIn.length > 1);
}

function onNodeRefClick(where: Where, event: any) {
  hoveredWhere.value = where;
  op.value.toggle(event);
}

function onWhereInClick(where: Where, event: any) {
  list.value = where.in ?? where.notIn;
  op1.value.toggle(event);
}

function hasNodeRef(where: Where) {
  return isObjectHasKeys(where, ["nodeRef"]) || isObjectHasKeys(where.relativeTo, ["nodeRef"]);
}

function getNodeRef(where: Where) {
  return where.nodeRef ?? where.relativeTo.nodeRef;
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
  color: blueviolet !important;
  cursor: pointer !important;
}
</style>
