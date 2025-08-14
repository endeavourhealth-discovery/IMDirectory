<template>
  <div :style="{ paddingLeft: '1rem' }">
    <div v-if="loading" class="flex flex-row"><ProgressSpinner /></div>
    <div v-if="dataSet.name">Name : {{ dataSet.name }}</div>
    <div v-if="dataSet.return">
      <span v-if="dataSet.return.as">Group : {{ dataSet.return.as }}</span>
    </div>
    <div v-else>{{ parentQuery.typeOf?.name }} internal id</div>

    <div v-if="hasCriteria(dataSet) || dataSet.return">
      <div v-if="hasCriteria(dataSet)">
        <span>If the following:</span>
        <Button v-if="hasCriteria(dataSet)" text :icon="!matchExpand ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" @click="matchToggle" />
        <RecursiveMatchDisplay
          v-if="matchExpand"
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
      </div>
      <span v-if="dataSet.return && dataSet.return.orderBy">{{ dataSet.return.orderBy.description }}</span>
      <div v-if="dataSet.return">
        <ReturnColumns :select="dataSet.return" class="pl-8" :parentQuery="parentQuery" />
      </div>
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

interface Props {
  matchExpanded: boolean;
  returnExpanded: boolean;
  index: number;
  editMode?: boolean;
  query: Query;
}

const props = defineProps<Props>();
const parentQuery = defineModel<Query>("parentQuery", { default: {} });
const matchExpand = ref(false);
const loading = ref(false);
const dataSet = ref({ ...props.query });

onMounted(async () => {
  await init();
});
function matchToggle() {
  matchExpand.value = !matchExpand.value;
}

function hasCriteria(query: Query): boolean {
  if (query.instanceOf || query.and || query.or || query.where) {
    return true;
  }
  return false;
}

async function init() {
  if (dataSet.value.iri) {
    dataSet.value = await QueryService.getDisplayFromQueryIri(dataSet.value.iri, DisplayMode.ORIGINAL);
  } else dataSet.value = await QueryService.getQueryDisplayFromQuery(dataSet.value, DisplayMode.ORIGINAL);
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

<style scoped></style>
