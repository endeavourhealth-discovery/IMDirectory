<template>
  <div :style="{ paddingLeft: '1rem' }">
    <div v-if="loading" class="flex flex-row"><ProgressSpinner /></div>
    <div>
      <span>Entry name :</span>
      <span v-if="datasetEntry.name">{{ datasetEntry.name }}</span>
    </div>

    <div v-if="datasetEntry.and || datasetEntry.or || datasetEntry.where || datasetEntry.is">
      <Button :icon="!matchExpand ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" text @click="matchToggle" />
      <RecursiveMatchDisplay
        v-if="matchExpand"
        :key="index"
        :baseType="baseType"
        :clause-index="index"
        :depth="1"
        :expanded="false"
        :inline="false"
        :match="datasetEntry"
        :operator="Bool.and"
        :parent-match="datasetEntry"
        :parentIndex="0"
      />
    </div>

    <div v-if="datasetEntry.return">
      <ReturnColumns :parentQuery="parentQuery" :select="datasetEntry.return" class="pl-8" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

import { Bool, DisplayMode } from "@endeavour/vue-library/enums";
import { type Match, MatchSchema, type Node, type Query, QuerySchema } from "@endeavour/vue-library/models";

import { QueryService } from "@/services";

import RecursiveMatchDisplay from "./RecursiveMatchDisplay.vue";
import ReturnColumns from "./ReturnColumns.vue";

interface Props {
  matchExpanded: boolean;
  returnExpanded: boolean;
  index: number;
  editMode?: boolean;
  baseType: Node;
}

const props = defineProps<Props>();
const parentQuery = defineModel<Query>("parentQuery", { default: QuerySchema.parse({}) });
const datasetEntry = defineModel<Match>("datasetEntry", { default: MatchSchema.parse({}) });
const matchExpand = ref(true);
const loading = ref(false);

onMounted(async () => {
  await init();
});
function matchToggle() {
  matchExpand.value = !matchExpand.value;
}

async function init() {
  matchExpand.value = props.matchExpanded;
  const datasetEntryAsQuery = QuerySchema.parse(datasetEntry.value);
  datasetEntry.value = await QueryService.getQueryDisplayFromQuery(datasetEntryAsQuery, DisplayMode.ORIGINAL);
}
</script>

<style scoped></style>
