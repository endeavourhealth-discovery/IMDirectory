<template>
  <div class="query-display-container">
    <div class="include-title" style="color: green">include if</div>
    <RecursiveQueryDisplay v-if="isArrayHasLength(query.match)" :matches="query.match!" :full-query="query" />
  </div>
</template>

<script setup lang="ts">
import RecursiveQueryDisplay from "@/components/query/viewer/RecursiveQueryDisplay.vue";
import { QueryService } from "@/services";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { Query } from "@im-library/interfaces/AutoGen";
import { onMounted, watch, Ref, ref } from "vue";

interface Props {
  conceptIri: string;
}
const props = defineProps<Props>();
const query: Ref<Query> = ref({} as Query);
watch(
  () => props.conceptIri,
  async newValue => {
    init();
  }
);

onMounted(async () => {
  init();
});

async function init() {
  query.value = await QueryService.getQueryDisplay(props.conceptIri);
}
</script>

<style scoped>
.query-display-container {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
}
</style>
