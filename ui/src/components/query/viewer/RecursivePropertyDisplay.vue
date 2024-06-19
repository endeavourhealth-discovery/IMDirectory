<template>
  <div :class="propertyIndex && property.description ? 'feature-indent' : !propertyIndex && property.description ? 'feature' : ''">
    <span v-if="hasNodeRef(property)" v-html="property.description" @click="onNodeRefClick(property, $event)"></span>
    <span v-else-if="hasBigList(property)" v-html="property.description" @click="onPropertyInClick(property, $event)"></span>
    <span v-else v-html="property.description"></span>
    <RecursivePropertyDisplay
      v-if="isArrayHasLength(property.where)"
      v-for="(nestedProperty, index) of property.where"
      :property="nestedProperty"
      :property-index="index"
      :parent-match="parentMatch"
      :parent-property="property"
      :full-query="fullQuery"
    />

    <RecursiveQueryDisplay v-if="isObjectHasKeys(property, ['match'])" :match="property.match!" :parent-match="undefined" :full-query="fullQuery" />
    <RecursiveQueryDisplay v-if="isObjectHasKeys(property, ['return'])" :match="(property as any).return" :parent-match="parentMatch" :full-query="fullQuery" />
  </div>

  <OverlayPanel ref="op"> <QueryOverlay :full-query="fullQuery" :variable-name="getNodeRef(clickedProperty)" /> </OverlayPanel>
  <OverlayPanel ref="op1">
    <ListOverlay :list="list" />
  </OverlayPanel>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match, Node, Query, Where } from "@im-library/interfaces/AutoGen";
import { Ref } from "vue";
import { ref } from "vue";
import QueryOverlay from "./QueryOverlay.vue";
import ListOverlay from "./ListOverlay.vue";
import RecursiveQueryDisplay from "./RecursiveQueryDisplay.vue";
import { getNumberOfListItems } from "@im-library/helpers/QueryDescriptor";

interface Props {
  fullQuery: Query;
  parentMatch?: Match;
  parentProperty?: Where;
  property: Where;
  propertyIndex?: any;
}

const props = defineProps<Props>();

const op: Ref<any> = ref();
const op1: Ref<any> = ref();

const clickedProperty: Ref<Where> = ref({} as Where);
const list: Ref<Node[]> = ref([]);

function hasBigList(property: Where) {
  const numberOfItems = getNumberOfListItems(property);
  return numberOfItems > 1;
}

function onNodeRefClick(property: Where, event: any) {
  clickedProperty.value = property;
  op.value.toggle(event);
}

function onPropertyInClick(property: Where, event: any) {
  list.value = getFullList(property);
  op1.value.toggle(event);
}

function getFullList(property: Where) {
  let fullList: Node[] = [];
  if (isArrayHasLength(property.is)) fullList = fullList.concat(property.is!);
  if (isArrayHasLength(property.isNot)) fullList = fullList.concat(property.isNot!);
  return fullList;
}

function hasNodeRef(property: Where) {
  return isObjectHasKeys(property, ["nodeRef"]) || isObjectHasKeys(property.relativeTo, ["nodeRef"]);
}

function getNodeRef(property: Where) {
  return (property.nodeRef ?? property.relativeTo?.nodeRef) as string;
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

.feature-indent {
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
