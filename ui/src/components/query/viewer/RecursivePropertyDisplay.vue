<template>
  <div :class="!propertyIndex && property.description ? 'feature' : ''">
    <span class="property-display">
      <span v-if="propertyIndex" :class="parentMatch?.boolWhere ?? 'and'">{{ parentMatch?.boolWhere ?? "and" }}</span>
      <span v-if="hasNodeRef(property)" v-html="property.description" @click="onNodeRefClick(property, $event)"></span>
      <span v-if="property.description" v-html="property.description"></span>
      <span v-else-if="property.displayLabel">{{ property.displayLabel }} </span>
    </span>

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

  <Popover ref="op"> <QueryOverlay :full-query="fullQuery" :variable-name="getNodeRef(clickedProperty)" /> </Popover>
  <Popover ref="op1">
    <ListOverlay :list="list" />
  </Popover>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match, Node, Query, Where } from "@im-library/interfaces/AutoGen";
import { Ref, ref } from "vue";
import QueryOverlay from "./QueryOverlay.vue";
import ListOverlay from "./ListOverlay.vue";
import RecursiveQueryDisplay from "./RecursiveQueryDisplay.vue";

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

function onNodeRefClick(property: Where, event: any) {
  clickedProperty.value = property;
  op.value.toggle(event);
}

function getFullList(property: Where) {
  let fullList: Node[] = [];
  if (isArrayHasLength(property.is)) fullList = fullList.concat(property.is!);
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

.variable-line {
  margin-left: 1rem !important;
}

.node-ref {
  color: rgb(138, 67, 138) !important;
  cursor: pointer !important;
}

.property-display {
  margin-left: 1rem;
}
</style>
