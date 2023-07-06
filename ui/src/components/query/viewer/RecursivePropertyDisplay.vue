<template>
  <div class="feature" v-for="(property, index) of properties">
    <div>
      <span v-if="index" v-html="parentProperty && parentProperty.bool === 'or' ? getDisplayFromLogic('or') : ''"></span>
      <span v-if="hasNodeRef(property)" v-html="property.description" @click="onNodeRefClick(property, $event)"></span>
      <span v-else-if="hasBigList(property)" v-html="property.description" @click="onPropertyInClick(property, $event)"></span>
      <span v-else v-html="property.description"></span>
      <span v-if="isArrayHasLength(property.property)">
        <RecursivePropertyDisplay :properties="property.property!" :parent-match="parentMatch" :parent-property="property" :full-query="fullQuery" />
      </span>
    </div>
  </div>
  <OverlayPanel ref="op"> <QueryOverlay :full-query="fullQuery" :variable-name="getNodeRef(clickedProperty)" /> </OverlayPanel>
  <OverlayPanel ref="op1">
    <ListOverlay :list="list" />
  </OverlayPanel>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match, Node, Query, Property } from "@im-library/interfaces/AutoGen";
import { Ref } from "vue";
import { ref } from "vue";
import QueryOverlay from "./QueryOverlay.vue";
import ListOverlay from "./ListOverlay.vue";
import { getDisplayFromLogic } from "@im-library/helpers/QueryDescriptor";

interface Props {
  fullQuery: Query;
  parentMatch?: Match;
  parentProperty?: Property;
  properties: Property[];
}

const props = defineProps<Props>();

const op: Ref<any> = ref();
const op1: Ref<any> = ref();

const clickedProperty: Ref<Property> = ref({} as Property);
const list: Ref<Node[]> = ref([]);

function hasBigList(property: Property) {
  return (isArrayHasLength(property.in) && property.in!.length > 1) || (isArrayHasLength(property.notIn) && property.notIn!.length > 1);
}

function onNodeRefClick(property: Property, event: any) {
  clickedProperty.value = property;
  op.value.toggle(event);
}

function onPropertyInClick(property: Property, event: any) {
  list.value = (property.in ?? property.notIn) as Node[];
  op1.value.toggle(event);
}

function hasNodeRef(property: Property) {
  return isObjectHasKeys(property, ["nodeRef"]) || isObjectHasKeys(property.relativeTo, ["nodeRef"]);
}

function getNodeRef(property: Property) {
  return (property.nodeRef ?? property.relativeTo?.nodeRef) as string;
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
