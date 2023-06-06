<template>
  {{ selectedMatches.length }}
  <div class="feature" v-for="(match, index) of matches">
    <div :class="isSelected(match) ? 'selected' : ''" @click="edit($event, match)">
      <span>{{ isSelected(match) }}</span>
      <span v-if="index" v-html="!parentMatch ? getDisplayFromLogic('and') : getDisplayFromLogic(parentMatch.boolMatch!)"></span>
      <span v-if="match.exclude" class="include-title" style="color: red"> exclude if </span>
      <span v-if="match.description" v-html="match.description"> </span>
      <span v-if="!index && match.nodeRef" v-html="getDisplayFromNodeRef(match.nodeRef)"></span>
      <span v-if="isArrayHasLength(match.match)">
        <RecursiveQueryEdit
          v-if="match.match"
          :include="true"
          :matches="match.match"
          :parent-match="match"
          :full-query="fullQuery"
          :selectedMatches="selectedMatches"
        />
      </span>
      <span v-if="isObjectHasKeys(match, ['where']) && isArrayHasLength(match.where)">
        <span v-if="match.where!.length == 1">
          <span v-if="hasNodeRef(match.where![0])" v-html="match.where![0].description"></span>
          <span v-else-if="hasBigList(match.where![0])" v-html="match.where![0].description"></span>
          <span v-else v-html="match.where![0].description"></span>
          <span v-if="isArrayHasLength(match.where![0].where)">
            <RecursiveWhereEdit :wheres="match.where![0].where!" :parent-match="parentMatch" :parent-where="match.where![0]" :full-query="fullQuery" />
          </span>
        </span>

        <RecursiveWhereEdit v-else :wheres="match.where!" :parent-match="match" :full-query="fullQuery" />
      </span>
      <span v-if="isArrayHasLength(match.orderBy)" v-for="orderBy of match.orderBy"> <div v-html="orderBy.description"></div></span>
      <span v-if="match.variable" v-html="getDisplayFromVariable(match.variable)"></span>
    </div>
  </div>
  <Dialog v-model:visible="editDialog" modal header="Header" :style="{ width: '50vw' }">
    {{ selectedMatches[0] }}
  </Dialog>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match, Query, Where } from "@im-library/interfaces/AutoGen";
import { Ref, ref } from "vue";
import { getDisplayFromLogic, getDisplayFromNodeRef, getDisplayFromVariable } from "@im-library/helpers/QueryDescriptor";
import RecursiveWhereEdit from "./RecursiveWhereEdit.vue";

interface Props {
  fullQuery: Query;
  parentMatch?: Match;
  matches: Match[];
  selectedMatches: Match[];
}

const props = defineProps<Props>();
const editDialog: Ref<boolean> = ref(false);

function edit(event: any, match: Match) {
  if (event.ctrlKey) {
    multiselect(match);
  } else {
    props.selectedMatches.length = 0;
    props.selectedMatches.push(match);
    editDialog.value = true;
  }
}

function multiselect(match: Match) {
  if (isSelected(match)) {
    const toAddList = props.selectedMatches.filter(selected => JSON.stringify(selected) !== JSON.stringify(match));
    props.selectedMatches.length = 0;
    for (const toAddItem of toAddList) {
      props.selectedMatches.push(toAddItem);
    }
  } else props.selectedMatches.push(match);
}

function isSelected(match: Match) {
  return !!props.selectedMatches.find(selected => JSON.stringify(selected) === JSON.stringify(match));
}

function hasNodeRef(where: Where) {
  return isObjectHasKeys(where, ["nodeRef"]) || isObjectHasKeys(where.relativeTo, ["nodeRef"]);
}

function hasBigList(where: Where) {
  return (isArrayHasLength(where.in) && where.in!.length > 1) || (isArrayHasLength(where.notIn) && where.notIn!.length > 1);
}
</script>

<style scoped>
.feature {
  display: flex;
  flex-flow: column;
  margin-left: 1rem;
  margin-top: 0.1rem;
  margin-bottom: 0.1rem;
  cursor: pointer;
}

.feature:hover {
  background-color: var(--highlight-bg);
}

.selected {
  background-color: var(--highlight-bg);
  color: var(--text-color);
  border-color: var(--focus-ring);
  border-radius: var(--border-radius);
}
</style>
