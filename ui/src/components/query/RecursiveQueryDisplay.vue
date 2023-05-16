<template>
  <div>{{ include }}-{{ include ? "Include if" : "Exclude if" }}</div>
  <ul class="feature">
    <li v-for="(match, index) of matches">
      <span v-if="index" v-html="!parentMatch ? getDisplayFromLogic('and') : getDisplayFromLogic(parentMatch.boolMatch)"></span>
      <span v-if="match.description" v-html="match.description"></span>
      <span v-if="isArrayHasLength(match.match)">
        <RecursiveQueryDisplay
          v-if="match.match.some(nestedMatch => !isObjectHasKeys(nestedMatch, ['exclude']))"
          :include="true"
          :matches="match.match.filter(match => !isObjectHasKeys(match, ['exclude']))"
        />
        <RecursiveQueryDisplay
          v-if="match.match.some(nestedMatch => isObjectHasKeys(nestedMatch, ['exclude']))"
          :include="false"
          :matches="match.match.filter(match => !isObjectHasKeys(match, ['exclude']))"
        />
      </span>
      <span v-if="isObjectHasKeys(match, ['where']) && isArrayHasLength(match.where)">
        <span v-if="match.where.length == 1" v-html="match.where[0].description"></span>
        <RecursiveWhereDisplay v-else :wheres="match.where" :parent-match="match" />
      </span>
      <!-- <div v-else>{{ match }}</div> -->
    </li>
  </ul>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import { Match } from "@im-library/interfaces/AutoGen";
import { PropType, Ref, onMounted, ref, watch } from "vue";
import RecursiveWhereDisplay from "./RecursiveWhereDisplay.vue";
import { getDisplayFromLogic } from "@im-library/helpers/TextQueryBuilder";
const props = defineProps({
  parentMatch: { type: Object as PropType<Match>, required: false },
  matches: { type: Object as PropType<Match[]>, required: true },
  include: { type: Boolean, required: true }
});

onMounted(() => {});

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
