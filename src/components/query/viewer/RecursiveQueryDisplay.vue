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
          :expandedSet="false"
        />
      </span>
      <div v-if="matchExpand && query.return && isArrayHasLength(query.return)">
        <ReturnColumns :select="query.return" class="pl-8" />
        <h3 class="pl-8">Column paths:</h3>
        <div class="pl-8">
          <small class="pl-8 text-green-500">*Path [Column title]</small>
          <RecursiveReturnDisplay v-for="nestedReturn in query.return" :select="nestedReturn" />
        </div>
      </div>
    </span>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { Query, Match } from "@/interfaces/AutoGen";
import { onMounted, Ref, ref } from "vue";
import RecursiveWhereDisplay from "./RecursiveWhereDisplay.vue";
import RecursiveMatchDisplay from "./RecursiveMatchDisplay.vue";
import RecursiveReturnDisplay from "./RecursiveReturnDisplay.vue";
import ReturnColumns from "./ReturnColumns.vue";

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
