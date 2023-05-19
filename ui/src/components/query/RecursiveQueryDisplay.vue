<template>
  <div class="feature" v-for="(match, index) of matches">
    <div v-if="!match.variable || isVariable">
      <span v-if="index" v-html="!parentMatch ? getDisplayFromLogic('and') : getDisplayFromLogic(parentMatch.boolMatch)"></span>
      <span v-if="match.exclude" class="include-title" style="color: red"> exclude if </span>
      <span v-if="match.description" v-html="match.description"> </span>
      <span v-if="isArrayHasLength(match.match)">
        <RecursiveQueryDisplay
          v-if="match.match.some(nestedMatch => !isObjectHasKeys(nestedMatch, ['exclude']))"
          :include="true"
          :matches="match.match.filter(nestedMatch => !isObjectHasKeys(nestedMatch, ['exclude']))"
          :parent-match="match"
          :full-query="fullQuery"
        />
        <RecursiveQueryDisplay
          v-if="match.match.some(nestedMatch => isObjectHasKeys(nestedMatch, ['exclude']))"
          :include="false"
          :matches="match.match.filter(nestedMatch => !isObjectHasKeys(nestedMatch, ['exclude']))"
          :parent-match="match"
          :full-query="fullQuery"
        />
      </span>
      <span v-if="isObjectHasKeys(match, ['where']) && isArrayHasLength(match.where)">
        <span v-if="match.where.length == 1">
          <span v-if="hasNodeRef(match.where[0])" v-html="match.where[0].description" @click="onNodeRefClick(match.where[0], $event)"> </span>
          <span v-else v-html="match.where[0].description"></span>
        </span>

        <RecursiveWhereDisplay v-else :wheres="match.where" :parent-match="match" :full-query="fullQuery" />
      </span>
    </div>
    <!-- <div v-else>{{ match }}</div> -->
  </div>
  <OverlayPanel ref="op"> <QueryOverlay :full-query="fullQuery" :variable-name="getNodeRef(hoveredWhere)" /> </OverlayPanel>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match, Query, Where } from "@im-library/interfaces/AutoGen";
import { PropType, Ref, ref } from "vue";
import RecursiveWhereDisplay from "./RecursiveWhereDisplay.vue";
import { getDisplayFromLogic } from "@im-library/helpers/TextQueryBuilder";
import QueryOverlay from "./QueryOverlay.vue";
const props = defineProps({
  fullQuery: { type: Object as PropType<Query>, required: true },
  parentMatch: { type: Object as PropType<Match>, required: false },
  matches: { type: Object as PropType<Match[]>, required: true },
  isVariable: { type: Boolean }
});

const op: Ref<any> = ref();
const hoveredWhere: Ref<any> = ref();

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
