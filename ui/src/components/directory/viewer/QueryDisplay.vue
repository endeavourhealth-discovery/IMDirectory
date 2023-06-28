<template>
  <div class="query-display-container">
    <div class="include-title" style="color: green">include if</div>
    <RecursiveQueryDisplay
      v-if="isArrayHasLength(query.match)"
      :matches="query.match!.filter((match: Match) => !isObjectHasKeys(match, ['exclude']))"
      :full-query="query"
    />
    <RecursiveQueryDisplay
      v-if="isArrayHasLength(query.match)"
      :matches="query.match!.filter((match: Match) => isObjectHasKeys(match, ['exclude']))"
      :full-query="query"
    />
  </div>
</template>

<script setup lang="ts">
import RecursiveQueryDisplay from "@/components/query/RecursiveQueryDisplay.vue";
import { QueryService } from "@/services";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match, Query } from "@im-library/interfaces/AutoGen";
import { onMounted, watch, Ref, ref } from "vue";

interface Props {
  conceptIri: string;
}
const props = defineProps<Props>();

const expandedKeys: Ref<any> = ref({});
const definition: Ref<any> = ref();
const nodes: Ref<any[]> = ref([]);

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
