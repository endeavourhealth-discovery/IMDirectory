<template>
  <div v-if="editMode">
    <EditWhere :where="where" :query-type-iri="queryTypeIri" @on-cancel="editMode = false" />
  </div>

  <div class="property" v-else-if="where.description" v-html="where.description" @dblclick="editMode = true"></div>
  <div v-if="isArrayHasLength(where.where)" v-for="(nestedWhere, index) of where.where">
    <EditDisplayWhere :index="index" :parent-where="where" :where="nestedWhere" :query-type-iri="queryTypeIri" />
  </div>

  <!-- <div class="feature" v-for="(where, index) of wheres"> -->
  <!-- <div>
      <span v-if="index" v-html="parentWhere && parentWhere.boolWhere === 'or' ? getDisplayFromLogic('or') : ''"></span>
      <span v-if="hasNodeRef(where)" v-html="where.description"></span>
      <span v-else-if="hasBigList(where)" v-html="where.description"></span>
      <span v-else v-html="where.description"></span>
      <span v-if="isArrayHasLength(where.where)">
        <EditDisplayWhere :wheres="where.where!" :parent-match="parentMatch" :parent-where="where" />
      </span>
    </div> -->
  <!-- </div> -->
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getDisplayFromLogic } from "@im-library/helpers/QueryDescriptor";
import { Match, Where } from "@im-library/interfaces/AutoGen";
import { Ref, ref } from "vue";
import EditWhere from "../edit/EditWhere.vue";

interface Props {
  parentMatch?: Match;
  parentWhere?: Where;
  index: number;
  where: Where;
  queryTypeIri: string;
}

const props = defineProps<Props>();
const editMode: Ref<boolean> = ref(false);

function hasBigList(where: Where) {
  return (isArrayHasLength(where.in) && where.in!.length > 1) || (isArrayHasLength(where.notIn) && where.notIn!.length > 1);
}

function hasNodeRef(where: Where) {
  return isObjectHasKeys(where, ["nodeRef"]) || isObjectHasKeys(where.relativeTo, ["nodeRef"]);
}
</script>

<style></style>
