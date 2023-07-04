<template>
  <EditWhere v-if="editMode" :where="where" :query-type-iri="queryTypeIri" :match="parentMatch" @on-cancel="editMode = false" />
  <div class="property" v-else-if="where.description" v-html="where.description" @dblclick="editMode = true"></div>
  <div v-if="isArrayHasLength(where.where)" v-for="(nestedWhere, index) of where.where">
    <EditDisplayWhere :index="index" :parent-where="where" :where="nestedWhere" :query-type-iri="queryTypeIri" />
  </div>
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
</script>

<style></style>
