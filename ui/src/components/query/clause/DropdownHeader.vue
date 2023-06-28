<template>
  <div class="dropdown-header">
    <Dropdown :options="options" v-model:model-value="whereClause.whereType" />
  </div>
</template>

<script setup lang="ts">
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { WhereClauseUI } from "@im-library/interfaces";
import { Where } from "@im-library/interfaces/AutoGen";
import { PropType, Ref, onMounted, ref, watch } from "vue";
interface Props {
  whereClause: WhereClauseUI;
  options: string[];
}

const props = defineProps<Props>();
</script>

<style scoped>
.dropdown-header {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
</style>
