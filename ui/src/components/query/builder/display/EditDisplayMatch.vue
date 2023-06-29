<template>
  <div class="feature">
    <div v-if="editMode">
      <EntitySelect :edit-node="match" :query-type-iri="queryTypeIri" @on-cancel="editMode = false" />
    </div>
    <div v-else-if="match.description" v-html="match.description" @dblclick="editMode = true"></div>

    <EditDisplayMatch
      v-if="isArrayHasLength(match.match)"
      v-for="(nestedMatch, index) of match.match"
      :index="index"
      :parent-match="match"
      :match="nestedMatch"
      :query-type-iri="queryTypeIri"
    />

    <EditDisplayWhere
      v-if="isArrayHasLength(match.where)"
      v-for="(where, index) of match.where"
      :index="index"
      :parent-match="match"
      :where="where"
      :query-type-iri="queryTypeIri"
    />

    <div v-if="isArrayHasLength(match.path)" v-for="(path, index) of match.path">
      <EditDisplayMatch v-if="isObjectHasKeys(path, ['match'])" :index="index" :parent-path="path" :match="path.match!" :query-type-iri="queryTypeIri" />
    </div>

    <!-- <span v-if="index" v-html="!parentMatch ? getDisplayFromLogic('and') : getDisplayFromLogic(parentMatch.boolMatch!)"></span>
    <span v-if="match.exclude" class="include-title" style="color: red"> exclude if </span>
    <span v-if="match.description" v-html="match.description"> </span>
    <span v-if="!index && match.nodeRef" v-html="getDisplayFromNodeRef(match.nodeRef)"></span>

    <span v-if="isObjectHasKeys(match, ['where']) && isArrayHasLength(match.where)">
      <span v-if="match.where!.length === 1">
        <span v-if="hasNodeRef(match.where![0])" v-html="match.where![0].description"></span>
        <span v-else-if="hasBigList(match.where![0])" v-html="match.where![0].description"></span>
        <span v-else v-html="match.where![0].description"></span>
        <span v-if="isArrayHasLength(match.where![0].where)">
          <EditDisplayWhere :wheres="match.where![0].where!" :parent-match="parentMatch" :parent-where="match.where![0]" />
        </span>
      </span>

      <EditDisplayWhere v-else :wheres="match.where!" :parent-match="match" />
    </span>
    <span v-if="isArrayHasLength(match.orderBy)" v-for="orderBy of match.orderBy"> <div v-html="orderBy.description"></div></span>
    <span v-if="match.variable" v-html="getDisplayFromVariable(match.variable)"></span>

    <span v-if="isArrayHasLength(match.path)">
      <span v-if="isObjectHasKeys(match.path![0].match, ['where']) && isArrayHasLength(match.path![0].match!.where)">
        <span v-if="match.path![0].match!.where!.length == 1">
          <span v-if="hasNodeRef(match.path![0].match!.where![0])" v-html="match.path![0].match!.where![0].description"> </span>
          <span v-else-if="hasBigList(match.path![0].match!.where![0])" v-html="match.path![0].match!.where![0].description"> </span>
          <span v-else v-html="match.path![0].match!.where![0].description"></span>
          <span v-if="isArrayHasLength(match.path![0].match!.where![0].where)">
            <EditDisplayWhere :wheres="match.path![0].match!.where![0].where!" :parent-match="parentMatch" :parent-where="match.path![0].match!.where![0]" />
          </span>
        </span>

        <EditDisplayWhere v-else :wheres="match.path![0].match!.where!" :parent-match="match.path![0].match" />
      </span>
    </span> -->
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match, Path, Where } from "@im-library/interfaces/AutoGen";
import { getDisplayFromLogic, getDisplayFromNodeRef, getDisplayFromVariable } from "@im-library/helpers/QueryDescriptor";
import EditDisplayWhere from "./EditDisplayWhere.vue";
import { Ref, ref } from "vue";
import EntitySelect from "../edit/EntitySelect.vue";

interface Props {
  queryTypeIri: string;
  parentMatch?: Match;
  parentPath?: Path;
  match: Match;
  index: number;
}

const props = defineProps<Props>();

const editMode: Ref<boolean> = ref(false);

function hasNodeRef(where: Where) {
  return isObjectHasKeys(where, ["nodeRef"]) || isObjectHasKeys(where.relativeTo, ["nodeRef"]);
}

function hasBigList(where: Where) {
  return (isArrayHasLength(where.in) && where.in!.length > 1) || (isArrayHasLength(where.notIn) && where.notIn!.length > 1);
}
</script>

<style scoped></style>
