<template>
  <div :style="{ paddingLeft: '1rem' }">
    <div v-if="loading" class="flex flex-row"><ProgressSpinner /></div>
    <span v-if="dataSet.name">{{ dataSet.name }}</span>
    <ClauseEditorMenus v-if="editMode" editor="queryEditor" v-model:query="dataSet" v-model:parentQuery="parentQuery" class="relative inline-block" />

    <span v-if="dataSet.return">
      <span v-if="dataSet.return.as">Group : {{ dataSet.return.as }}</span>
    </span>
    <Button v-if="dataSet.match || dataSet.return" text :icon="!matchExpand ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" @click="matchToggle" />
    <span v-if="matchExpand && (isArrayHasLength(dataSet.match) || isArrayHasLength(dataSet.where))">
      <span>If :</span>
      <RecursiveMatchDisplay
        v-for="(nestedQuery, index) in dataSet.match"
        :inline="false"
        :match="nestedQuery"
        :key="index"
        :clause-index="index"
        :property-index="index"
        :depth="1"
        :operator="dataSet.bool"
        :expanded="false"
        :parent-match="query"
      />
      <span v-if="isArrayHasLength(dataSet.where)">
        <RecursiveWhereDisplay
          v-for="(nestedWhere, index) in dataSet.where"
          :where="nestedWhere"
          :depth="0"
          :property-index="index"
          :key="index"
          :index="index"
          :operator="dataSet.bool"
          :expandedSet="false"
          :editMode="editMode"
          :inline="!nestedWhere.where"
        />
      </span>
    </span>
    <span v-if="dataSet.orderBy">{{ dataSet.orderBy.description }}</span>
    <div v-if="dataSet.return && matchExpand">
      <ReturnColumns :select="dataSet.return" :property-expanded="false" class="pl-8" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { DisplayMode, Query } from "@/interfaces/AutoGen";
import { onMounted, watch, ref, toRaw } from "vue";
import RecursiveWhereDisplay from "./RecursiveWhereDisplay.vue";
import RecursiveMatchDisplay from "./RecursiveMatchDisplay.vue";
import ReturnColumns from "./ReturnColumns.vue";
import { QueryService } from "@/services";
import ClauseEditorMenus from "@/components/imquery/ClauseEditorMenus.vue";
import { cloneDeep } from "lodash-es";

interface Props {
  matchExpanded: boolean;
  returnExpanded: boolean;
  index: number;
  editMode?: boolean;
  query: Query;
}

const props = defineProps<Props>();
const parentQuery = defineModel<Query>("parentQuery", { default: {} });
const matchExpand = ref(props.matchExpanded);
const loading = ref(false);
const dataSet = ref({ ...props.query });

async function matchToggle() {
  matchExpand.value = !matchExpand.value;
}

onMounted(async () => {
  init();
});
async function init() {
  if (!dataSet.value.return) {
    if (dataSet.value["@id"]) {
      dataSet.value = await QueryService.getDisplayFromQueryIri(dataSet.value["@id"], DisplayMode.ORIGINAL);
    } else dataSet.value = await QueryService.getQueryDisplayFromQuery(dataSet.value, DisplayMode.ORIGINAL);
  }
}
watch(
  () => props.query,
  async () => {
    if (!props.query.return && props.query["@id"]) {
      dataSet.value = await QueryService.getDisplayFromQueryIri(props.query["@id"], DisplayMode.ORIGINAL);
    }
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
.button-chevron {
  background-color: transparent;
  border: none;
  cursor: pointer;
}
.field {
  padding-right: 0.2rem;
}
.rule {
  font-weight: bold;
  padding-right: 1rem;
}

.return {
  color: var(--p-teal-500);
  padding-left: 0.5rem;
}

.output {
  color: var(--p-indigo-500);
}
</style>
