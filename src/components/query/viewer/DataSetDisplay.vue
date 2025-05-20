<template>
  <div :style="{ paddingLeft: '1rem' }">
    <div v-if="loading" class="flex flex-row"><ProgressSpinner /></div>
    <span v-if="dataSet.name">{{ dataSet.name }}</span>
    <ClauseEditorMenus v-if="editMode" editor="queryEditor" v-model:query="dataSet" v-model:parentQuery="parentQuery" class="relative inline-block" />
    <span v-if="dataSet.return">
      <span v-if="dataSet.return.as">Group : {{ dataSet.return.as }}</span>
    </span>
    <Button
      v-if="hasCriteria(dataSet) || dataSet.return"
      text
      :icon="!matchExpand ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'"
      @click="matchToggle"
    />
    <span v-if="matchExpand && hasCriteria(dataSet)">
      <span>If :</span>
      <RecursiveMatchDisplay
        :inline="false"
        :match="dataSet"
        :key="index"
        :clause-index="index"
        :property-index="index"
        :depth="1"
        :operator="Bool.and"
        :expanded="false"
        :parent-match="query"
      />
      <span v-if="dataSet.where">
        <RecursiveWhereDisplay
          :where="dataSet.where"
          :depth="0"
          :property-index="index"
          :key="index"
          :index="index"
          :operator="Bool.and"
          :expandedSet="false"
          :editMode="editMode"
          :inline="!dataSet.where.and && !dataSet.where.or"
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
import { Bool, DisplayMode, Query } from "@/interfaces/AutoGen";
import { onMounted, watch, ref } from "vue";
import RecursiveWhereDisplay from "./RecursiveWhereDisplay.vue";
import RecursiveMatchDisplay from "./RecursiveMatchDisplay.vue";
import ReturnColumns from "./ReturnColumns.vue";
import { QueryService } from "@/services";
import ClauseEditorMenus from "@/components/imquery/ClauseEditorMenus.vue";

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

function hasCriteria(query: Query): boolean {
  if (query.instanceOf || query.and || query.or || query.where) {
    return true;
  }
  return false;
}

onMounted(async () => {
  init();
});
async function init() {
  if (!dataSet.value.return) {
    if (dataSet.value.iri) {
      dataSet.value = await QueryService.getDisplayFromQueryIri(dataSet.value.iri, DisplayMode.ORIGINAL);
    } else dataSet.value = await QueryService.getQueryDisplayFromQuery(dataSet.value, DisplayMode.ORIGINAL);
  }
}
watch(
  () => props.query,
  async () => {
    if (!props.query.return && props.query.iri) {
      dataSet.value = await QueryService.getDisplayFromQueryIri(props.query.iri, DisplayMode.ORIGINAL);
    }
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
/*
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
*/
</style>
