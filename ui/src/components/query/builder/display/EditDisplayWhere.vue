<template>
  <EditWhere v-if="editMode" :where="editWhere" :query-type-iri="queryTypeIri" :match="parentMatch" @on-cancel="editMode = false" @on-save="save" />
  <div class="property" v-else-if="where.description" v-html="where.description" @dblclick="editMode = true"></div>
  <div v-if="isArrayHasLength(where.where)" v-for="(nestedWhere, index) of where.where">
    <EditDisplayWhere :index="index" :parent-where="where" :where="nestedWhere" :query-type-iri="queryTypeIri" />
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { describeWhere, getDisplayFromLogic } from "@im-library/helpers/QueryDescriptor";
import { Match, Where } from "@im-library/interfaces/AutoGen";
import { Ref, onMounted, ref } from "vue";
import EditWhere from "../edit/EditWhere.vue";
import _ from "lodash";

interface Props {
  parentMatch?: Match;
  parentWhere?: Where;
  index: number;
  where: Where;
  queryTypeIri: string;
}

const props = defineProps<Props>();
const editMode: Ref<boolean> = ref(false);
const editWhere: Ref<Where> = ref({} as Where);

onMounted(() => {
  editWhere.value = _.cloneDeep(props.where);
});

function save() {
  for (const key of Object.keys(props.where)) {
    delete (props.where as any)[key];
  }
  for (const key of Object.keys(editWhere.value)) {
    (props.where as any)[key] = (editWhere.value as any)[key];
  }
  describeWhere([props.where], "where");
  editMode.value = false;
}
</script>

<style></style>
