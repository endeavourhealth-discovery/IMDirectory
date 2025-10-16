<template>
  <div :style="{ paddingLeft: '1rem' }">
    <div v-if="loading" class="flex flex-row"><ProgressSpinner /></div>
    <div v-if="dataSet.name">Name : {{ dataSet.name }}</div>
    <div v-if="dataSet.return">
      <span v-if="dataSet.return.as">Group : {{ dataSet.return.as }}</span>
    </div>
    <div v-else>{{ parentQuery.typeOf?.name }} internal id</div>

    <div v-if="dataSet.return">
      <div v-if="dataSet.and || dataSet.or || dataSet.where || dataSet.isCohort">
        <span>filter:</span>
        <Button text :icon="!matchExpand ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" @click="matchToggle" />
        <RecursiveMatchDisplay
          v-if="matchExpand"
          :inline="false"
          :match="dataSet"
          :key="index"
          :clause-index="index"
          :depth="1"
          :operator="Bool.and"
          :expanded="false"
          :parent-match="dataSet"
        />
      </div>
      <span v-if="dataSet.orderBy">{{ dataSet.orderBy.description }}</span>
      <div v-if="dataSet.return">
        <ReturnColumns :select="dataSet.return" class="pl-8" :parentQuery="parentQuery" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bool, DisplayMode, Match, Query } from "@/interfaces/AutoGen";
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
  match: Match;
}

const props = defineProps<Props>();
const parentQuery = defineModel<Query>("parentQuery", { default: {} });
const matchExpand = ref(false);
const loading = ref(false);
const dataSet = ref({ ...props.match });

onMounted(async () => {
  await init();
});
function matchToggle() {
  matchExpand.value = !matchExpand.value;
}

async function init() {
  dataSet.value = await QueryService.getQueryDisplayFromQuery(dataSet.value, DisplayMode.ORIGINAL);
}
watch(
  () => props.match,
  async () => {
    dataSet.value = await QueryService.getQueryDisplayFromQuery(dataSet.value, DisplayMode.ORIGINAL);
  }
);
</script>

<style scoped></style>
