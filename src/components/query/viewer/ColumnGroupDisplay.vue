<template>
  <div :style="{ paddingLeft: '1rem' }">
    <div v-if="loading" class="flex flex-row"><ProgressSpinner /></div>
    <div v-if="datasetEntry.name">Name : {{ datasetEntry.name }}</div>

    <div v-if="datasetEntry.return">
      <div v-if="datasetEntry.and || datasetEntry.or || datasetEntry.where || datasetEntry.is">
        <Button text :icon="!matchExpand ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" @click="matchToggle" />
        <RecursiveMatchDisplay
          v-if="matchExpand"
          :inline="false"
          :match="datasetEntry"
          :key="index"
          :clause-index="index"
          :parentIndex="0"
          :depth="1"
          :operator="Bool.and"
          :expanded="false"
          :parent-match="datasetEntry"
          :baseType="baseType"
        />
      </div>
      <span v-if="datasetEntry.orderBy">{{ datasetEntry.orderBy.description }}</span>
      <div v-if="datasetEntry.return">
        <ReturnColumns :select="datasetEntry.return" class="pl-8" :parentQuery="parentQuery" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

import { Bool, DisplayMode } from "vue-library/enums";
import type { Match, Node, Query } from "vue-library/interfaces";

import { QueryService } from "@/services";

import RecursiveMatchDisplay from "./RecursiveMatchDisplay.vue";
import RecursiveWhereDisplay from "./RecursiveWhereDisplay.vue";
import ReturnColumns from "./ReturnColumns.vue";

interface Props {
  matchExpanded: boolean;
  returnExpanded: boolean;
  index: number;
  editMode?: boolean;
  baseType: Node;
}

const props = defineProps<Props>();
const parentQuery = defineModel<Query>("parentQuery", { default: {} });
const datasetEntry = defineModel<Match>("datasetEntry", { default: {} });
const matchExpand = ref(false);
const loading = ref(false);

onMounted(async () => {
  await init();
});
function matchToggle() {
  matchExpand.value = !matchExpand.value;
}

async function init() {
  matchExpand.value = props.matchExpanded;
  datasetEntry.value = await QueryService.getQueryDisplayFromQuery(datasetEntry.value, DisplayMode.ORIGINAL);
}
</script>

<style scoped></style>
