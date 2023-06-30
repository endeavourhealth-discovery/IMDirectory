<template>
  <div class="feature" v-for="(where, index) of wheres">
    <div>
      <span v-if="index" v-html="parentWhere && parentWhere.boolWhere === 'or' ? getDisplayFromLogic('or') : ''"></span>
      <span v-if="hasNodeRef(where)" v-html="where.description"></span>
      <span v-else-if="hasBigList(where)" v-html="where.description"></span>
      <span v-else v-html="where.description"></span>
      <span v-if="isArrayHasLength(where.where)">
        <EditDisplayWhere :wheres="where.where!" :parent-match="parentMatch" :parent-where="where" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getDisplayFromLogic } from "@im-library/helpers/QueryDescriptor";
import { Match, Where } from "@im-library/interfaces/AutoGen";

interface Props {
  parentMatch?: Match;
  parentWhere?: Where;
  wheres: Where[];
}

const props = defineProps<Props>();

function hasBigList(where: Where) {
  return (isArrayHasLength(where.in) && where.in!.length > 1) || (isArrayHasLength(where.notIn) && where.notIn!.length > 1);
}

function hasNodeRef(where: Where) {
  return isObjectHasKeys(where, ["nodeRef"]) || isObjectHasKeys(where.relativeTo, ["nodeRef"]);
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
