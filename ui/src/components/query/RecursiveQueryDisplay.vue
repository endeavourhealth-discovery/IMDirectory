<template>
  <div class="feature" v-for="(match, index) of matches">
    <div v-if="!match.variable">
      <span v-if="index" v-html="!parentMatch ? getDisplayFromLogic('and') : getDisplayFromLogic(parentMatch.boolMatch)"></span>
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
        <span v-if="match.where.length == 1" v-html="match.where[0].description"></span>
        <RecursiveWhereDisplay v-else :wheres="match.where" :parent-match="match" :full-query="fullQuery" />
      </span>
    </div>
    <!-- <div v-else>{{ match }}</div> -->
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import { Match, Query } from "@im-library/interfaces/AutoGen";
import { PropType, Ref, onMounted, ref, watch } from "vue";
import RecursiveWhereDisplay from "./RecursiveWhereDisplay.vue";
import { getDisplayFromLogic } from "@im-library/helpers/TextQueryBuilder";
const props = defineProps({
  fullQuery: { type: Object as PropType<Query>, required: true },
  parentMatch: { type: Object as PropType<Match>, required: false },
  matches: { type: Object as PropType<Match[]>, required: true }
});
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
