<template>
  <ul class="feature">
    <li v-for="match of matches">
      <div v-if="match.description" v-html="match.description"></div>
      <div v-if="isArrayHasLength(match.match)"><RecursiveQueryDisplay :matches="match.match" :parent-match="match" /></div>
      <div v-if="isObjectHasKeys(match, ['where']) && isArrayHasLength(match.where)">
        <div v-if="match.where.length == 1" v-html="match.where[0].description"></div>
        <RecursiveWhereDisplay v-else :wheres="match.where" :parent-match="match" />
      </div>
      <!-- <div v-else>{{ match }}</div> -->
    </li>
  </ul>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import { Match } from "@im-library/interfaces/AutoGen";
import { PropType, onMounted, watch } from "vue";
import RecursiveWhereDisplay from "./RecursiveWhereDisplay.vue";
const props = defineProps({
  parentMatch: { type: Object as PropType<Match>, required: false },
  matches: { type: Object as PropType<Match[]>, required: true }
});

onMounted(async () => {});

function hasIri(match: Match) {
  return isObjectHasKeys(match, ["@id"]) || isObjectHasKeys(match, ["@set"]) || isObjectHasKeys(match, ["@type"]);
}
</script>

<style scoped>
.feature {
  display: flex;
  flex-flow: column;
}
</style>
