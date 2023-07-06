<template>
  <div class="feature" v-for="(match, index) of matches">
    <div>
      <span v-if="index" v-html="!parentMatch ? getDisplayFromLogic('and') : getDisplayFromLogic(parentMatch.bool!)"></span>
      <span v-if="match.exclude" class="include-title" style="color: red"> exclude if </span>
      <span v-if="match.description" v-html="match.description"> </span>

      <span v-if="match.nodeRef" v-html="getDisplayFromNodeRef(match.nodeRef)" @click="onNodeRefClick(match, $event)"></span>
      <span v-if="isArrayHasLength(match.match)">
        <RecursiveQueryDisplay v-if="match.match" :include="true" :matches="match.match" :parent-match="match" :full-query="fullQuery" />
      </span>
      <span v-if="isObjectHasKeys(match, ['where']) && isArrayHasLength(match.property)">
        <span v-if="match.property!.length == 1">
          <span v-if="hasNodeRef(match.property![0])" v-html="match.property![0].description" @click="onNodeRefClick(match.property![0], $event)"></span>
          <span
            v-else-if="hasBigList(match.property![0])"
            v-html="match.property![0].description"
            @click="onPropertyInClick(match.property![0], $event)"
          ></span>
          <span v-else v-html="match.property![0].description"></span>
          <span v-if="isArrayHasLength(match.property![0].property)">
            <RecursiveWhereDisplay
              :properties="match.property![0].property!"
              :parent-match="parentMatch"
              :parent-property="match.property![0]"
              :full-query="fullQuery"
            />
          </span>
        </span>

        <RecursiveWhereDisplay v-else :properties="match.property!" :parent-match="match" :full-query="fullQuery" />
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
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match, Node, Query, Property } from "@im-library/interfaces/AutoGen";
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
const clickedNodeRef: Ref<Property | Match> = ref({} as Property);
const list: Ref<Node[]> = ref([]);
const op1: Ref<any> = ref();

function hasNodeRef(property: Property) {
  return isObjectHasKeys(property, ["nodeRef"]) || isObjectHasKeys(property.relativeTo, ["nodeRef"]);
}

function onNodeRefClick(propertyOrMatch: Property | Match, event: any) {
  clickedNodeRef.value = propertyOrMatch;
  op.value.toggle(event);
}

function getNodeRef(propertyOrMatch: Property | Match) {
  return (propertyOrMatch.nodeRef ?? (propertyOrMatch as Property)?.relativeTo?.nodeRef) as string;
}

function hasBigList(property: Property) {
  return (isArrayHasLength(property.in) && property.in!.length > 1) || (isArrayHasLength(property.notIn) && property.notIn!.length > 1);
}

function onPropertyInClick(property: Property, event: any) {
  list.value = (property.in ?? property.notIn) as Node[];
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
