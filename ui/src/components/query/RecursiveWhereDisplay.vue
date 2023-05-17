<template>
  <div class="feature" v-for="(where, index) of wheres">
    <div>
      <span v-if="index" v-html="!parentWhere ? getDisplayFromLogic('and') : getDisplayFromLogic(parentWhere.bool)"></span>
      <span v-if="hasNodeRef(where)" v-html="where.description" @mouseover="show(where, $event)" @mouseleave="hide($event)"></span>
      <span v-else v-html="where.description"></span>
      <span v-if="isArrayHasLength(where.where)">
        <RecursiveWhereDisplay :wheres="where.where" :parent-match="parentMatch" :parent-where="where" :full-query="fullQuery" />
      </span>
    </div>
  </div>
  <OverlayPanel ref="op"> <QueryOverlay :full-query="fullQuery" :variable-name="getNodeRef(hoveredWhere)" /> </OverlayPanel>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getDisplayFromLogic } from "@im-library/helpers/TextQueryBuilder";
import { Match, Query, Where } from "@im-library/interfaces/AutoGen";
import { PropType, Ref, onMounted, watch } from "vue";
import { ref } from "vue";
import QueryOverlay from "./QueryOverlay.vue";

const props = defineProps({
  fullQuery: { type: Object as PropType<Query>, required: true },
  parentMatch: { type: Object as PropType<Match>, required: false },
  parentWhere: { type: Object as PropType<Where>, required: false },
  wheres: { type: Object as PropType<Where[]>, required: true }
});

const op: Ref<any> = ref();
const hoveredWhere: Ref<any> = ref();

function show(where: Where, event: any) {
  hoveredWhere.value = where;
  op.value.show(event);
}

function hide(event: any) {
  op.value.hide(event);
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
