<template>
  <div class="feature">
    <div>
      <span v-if="match.description" v-html="match.description"> </span>
      <span v-if="match.nodeRef" v-html="getDisplayFromNodeRef(match.nodeRef)" @click="onNodeRefClick(match, $event)"></span>
      <span v-if="isArrayHasLength(match.match)">
        <RecursiveQueryDisplay v-for="nestedMatch of match.match" :match="nestedMatch" :parent-match="match" :full-query="fullQuery" />
      </span>
      <span v-if="isArrayHasLength(match.property)">
        <RecursivePropertyDisplay v-for="property of match.property" :property="property" :parent-match="match" :full-query="fullQuery" />
      </span>
      <span v-if="isArrayHasLength(match.orderBy)" v-for="orderBy of match.orderBy"> <div v-html="orderBy.description"></div></span>
      <span v-if="match.variable" v-html="getDisplayFromVariable(match.variable)"></span>
    </div>
  </div>
  <OverlayPanel ref="op"> <QueryOverlay :full-query="fullQuery" :variable-name="getNodeRef(clickedNodeRef)" /> </OverlayPanel>
  <OverlayPanel ref="op1">
    <ListOverlay :list="list" />
  </OverlayPanel>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { Match, Node, Query, Property } from "@im-library/interfaces/AutoGen";
import { Ref, ref } from "vue";
import RecursivePropertyDisplay from "./RecursivePropertyDisplay.vue";
import { getDisplayFromNodeRef, getDisplayFromVariable } from "@im-library/helpers/QueryDescriptor";
import QueryOverlay from "./QueryOverlay.vue";
import ListOverlay from "./ListOverlay.vue";

interface Props {
  fullQuery: Query;
  parentMatch?: Match;
  match: Match;
}

const props = defineProps<Props>();

const op: Ref<any> = ref();
const clickedNodeRef: Ref<Property | Match> = ref({} as Property);
const list: Ref<Node[]> = ref([]);
const op1: Ref<any> = ref();

function onNodeRefClick(propertyOrMatch: Property | Match, event: any) {
  clickedNodeRef.value = propertyOrMatch;
  op.value.toggle(event);
}

function getNodeRef(propertyOrMatch: Property | Match) {
  return (propertyOrMatch.nodeRef ?? (propertyOrMatch as Property)?.relativeTo?.nodeRef) as string;
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
