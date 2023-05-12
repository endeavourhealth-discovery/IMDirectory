<template>
  <ul class="feature">
    <li v-for="where of wheres">
      <div v-html="where.description"></div>
      <div v-if="isArrayHasLength(where.where)"><RecursiveWhereDisplay :wheres="where.where" :parent-match="parentMatch" :parent-where="where" /></div>
      <!-- <div v-else>{{ match }}</div> -->
    </li>
  </ul>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import { Match, Where } from "@im-library/interfaces/AutoGen";
import { PropType, onMounted, watch } from "vue";
const props = defineProps({
  parentMatch: { type: Object as PropType<Match>, required: false },
  parentWhere: { type: Object as PropType<Where>, required: false },
  wheres: { type: Object as PropType<Where[]>, required: true }
});

onMounted(async () => {});

function hasIri(where: Where) {
  return isObjectHasKeys(where, ["@id"]) || isObjectHasKeys(where, ["@set"]) || isObjectHasKeys(where, ["@type"]);
}
</script>

<style scoped>
.feature {
  display: flex;
  flex-flow: column;
}
</style>
