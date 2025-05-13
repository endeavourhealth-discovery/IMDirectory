<template>
  <div :style="{ paddingLeft: '1rem' }">
    <div v-if="loading" class="flex flex-row"><ProgressSpinner /></div>
    <Button text :icon="!matchExpand ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" @click="matchToggle" />
    <span v-if="!query.match && !query.where && !query.return">
      <span v-if="query.name" style="padding-left: 2rem">{{ query.name }}</span>
    </span>

    <span v-if="isArrayHasLength(query.match) || isArrayHasLength(query.where) || query.return">
      <span v-if="query.name">{{ query.name }}</span>
      <span v-if="matchExpand && isArrayHasLength(query.match)">
        <RecursiveMatchEditor
          v-for="(nestedQuery, index) in query.match"
          :inline="false"
          :match="nestedQuery"
          :key="index"
          :clause-index="index"
          :depth="1"
          :operator="query.bool"
          :expanded="false"
          :parent-match="query"
        />
      </span>
      <span v-if="matchExpand && isArrayHasLength(query.where)">
        <RecursiveWhereEditor
          v-for="(nestedWhere, index) in query.where"
          :where="nestedWhere"
          :depth="1"
          :index="index"
          :key="index"
          :operator="query.bool"
          :expandedSet="false"
          :inline="index === 0"
        />
      </span>
      <div v-if="matchExpand && query.return">
        <ReturnColumns :select="query.return" :property-expanded="false" class="pl-8" />
      </div>
    </span>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { Query, DisplayMode } from "@/interfaces/AutoGen";
import { ref } from "vue";
import RecursiveWhereEditor from "./RecursiveWhereEditor.vue";
import RecursiveMatchEditor from "./RecursiveMatchEditor.vue";
import ReturnColumns from "./ReturnColumns.vue";
import { QueryService } from "@/services";

const props = defineProps<{
  query: Query;
  matchExpanded: boolean;
  returnExpanded: boolean;
}>();
const matchExpand = ref(props.matchExpanded);
const loading = ref(false);

async function matchToggle() {
  await expandQuery();
  matchExpand.value = !matchExpand.value;
}

async function expandQuery() {
  loading.value = true;
  if (props.query.iri) {
    const definedQuery = await QueryService.getDisplayFromQueryIri(props.query.iri!, DisplayMode.ORIGINAL);
    props.query.match = definedQuery.match;
    props.query.where = definedQuery.where;
    props.query.return = definedQuery.return;
  }
  loading.value = false;
}
</script>
