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
const props = defineProps({
  whereClause: { type: Object as PropType<WhereClauseUI>, required: true },
  options: { type: Object as PropType<string[]>, required: true }
});
</script>

<style scoped>
.dropdown-header {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
</style>
