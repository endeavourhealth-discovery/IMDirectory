<template>
  <div
    :class="
      matchIndex && (match.description || match.nodeRef || match.name)
        ? 'feature-indent'
        : !matchIndex && (match.description || match.nodeRef || match.name)
          ? 'feature'
          : ''
    "
  >
    <span v-if="match.name" v-html="match.name"> </span>
    <span v-else-if="match.description" v-html="match.description"> </span>
    <span v-else-if="match.displayLabel">{{ match.displayLabel }}</span>
    <RecursiveQueryDisplay
      v-if="isArrayHasLength(match.match)"
      v-for="(nestedMatch, index) of match.match"
      :match="nestedMatch"
      :match-index="index"
      :parent-match="match"
      :full-query="fullQuery"
    />
    <RecursivePropertyDisplay
      v-if="isArrayHasLength(match.where)"
      v-for="property of match.where"
      :property="property"
      :parent-match="match"
      :full-query="fullQuery"
    />
    <span v-if="match.orderBy"> <div v-html="match.orderBy.description"></div></span>
    <span v-if="match.then">
      <RecursiveQueryDisplay :match="match.then" :parent-match="match" :full-query="fullQuery" />
    </span>
    <span v-if="match.variable">{{ "label as " + match.variable }}</span>
    <span v-if="isArrayHasLength(match.query)" class="output">output</span>
    <RecursiveQueryDisplay
      v-if="isArrayHasLength(match.query)"
      v-for="nestedQuery of match.query"
      :match="nestedQuery"
      :parent-match="match"
      :full-query="fullQuery"
    />
    <span v-if="isArrayHasLength(match.return)" class="return">return</span>
    <RecursiveQueryDisplay
      v-if="isArrayHasLength(match.return)"
      v-for="nestedReturn of match.return"
      :match="nestedReturn"
      :parent-match="match"
      :full-query="fullQuery"
    />
  </div>

  <Popover ref="op"> <QueryOverlay :full-query="fullQuery" :variable-name="getNodeRef(clickedNodeRef)" /> </Popover>
  <Popover ref="op1">
    <ListOverlay :list="list" />
  </Popover>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { Match, Node, Query, Where, Return } from "@im-library/interfaces/AutoGen";
import { onMounted, Ref, ref } from "vue";
import RecursivePropertyDisplay from "./RecursivePropertyDisplay.vue";
import QueryOverlay from "./QueryOverlay.vue";
import ListOverlay from "./ListOverlay.vue";

interface Props {
  fullQuery: Query;
  parentMatch?: Match;
  match: Query;
  matchIndex?: number;
}

const props = defineProps<Props>();

const op: Ref<any> = ref();
const clickedNodeRef: Ref<Where | Match> = ref({} as Where);
const list: Ref<Node[]> = ref([]);
const op1: Ref<any> = ref();

function onNodeRefClick(propertyOrMatch: Where | Match, event: any) {
  clickedNodeRef.value = propertyOrMatch;
  op.value.toggle(event);
}

function getNodeRef(propertyOrMatch: Where | Match) {
  return (propertyOrMatch.nodeRef ?? (propertyOrMatch as Where)?.relativeTo?.nodeRef) as string;
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

.return {
  color: lightseagreen;
  padding-left: 0.5rem;
}

.output {
  color: mediumslateblue;
}
</style>
