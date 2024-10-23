<template>
  <div :style="{ paddingLeft: '1rem' }">
    <span v-if="!query.match && !query.where && !query.return">
      <span v-if="query.name" style="padding-left: 2rem">{{ query.name }}</span>
    </span>

    <span v-if="isArrayHasLength(query.match) || isArrayHasLength(query.where) || isArrayHasLength(query.return)">
      <Button text :icon="!matchExpand ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-up'" @click="matchToggle" />
      <span v-if="query.name">{{ query.name }}</span>
      <span v-if="matchExpand && isArrayHasLength(query.match)">
        <RecursiveMatchDisplay
          v-for="(nestedQuery, index) in query.match"
          :inline="false"
          :match="nestedQuery"
          :key="index"
          :index="index"
          :depth="1"
          :operator="query.boolMatch"
          :expanded="false"
        />
      </span>
      <span v-if="matchExpand && isArrayHasLength(query.where)">
        <RecursiveWhereDisplay
          v-for="(nestedWhere, index) in query.where"
          :where="nestedWhere"
          :depth="1"
          :index="index"
          :key="index"
          :operator="query.boolWhere"
          :expanded="false"
        />
      </span>
      <span v-if="matchExpand && isArrayHasLength(query.return)">
        <div class="pl-8 text-green-500">Fields (columns)</div>
        <RecursiveReturnDisplay v-for="nestedReturn in query.return" :select="nestedReturn" :inline="false" :pathLevel="0" />
      </span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { Query, Match } from "@im-library/interfaces/AutoGen";
import { onMounted, Ref, ref } from "vue";
import RecursiveWhereDisplay from "./RecursiveWhereDisplay.vue";
import RecursiveMatchDisplay from "./RecursiveMatchDisplay.vue";
import RecursiveReturnDisplay from "./RecursiveReturnDisplay.vue";

interface Props {
  query: Query;
  matchExpanded: boolean;
  returnExpanded: boolean;
}

const props = defineProps<Props>();
const matchExpand = ref(props.matchExpanded);

function matchToggle() {
  matchExpand.value = !matchExpand.value;
}
</script>

<style scoped>
.button-chevron {
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.return {
  color: var(--p-teal-500);
  padding-left: 0.5rem;
}

.output {
  color: var(--p-indigo-500);
}
</style>
