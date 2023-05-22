<template>
  <div class="query-display-container">
    <div class="include-title" style="color: green">include if</div>
    <RecursiveQueryDisplay
      v-if="isArrayHasLength(query.match)"
      :matches="query.match.filter(match => !isObjectHasKeys(match, ['exclude']))"
      :full-query="query"
    />
    <RecursiveQueryDisplay
      v-if="isArrayHasLength(query.match)"
      :matches="query.match.filter(match => isObjectHasKeys(match, ['exclude']))"
      :full-query="query"
    />
  </div>
</template>

<script setup lang="ts">
import RecursiveQueryDisplay from "@/components/query/RecursiveQueryDisplay.vue";
import { QueryService } from "@/services";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Query } from "@im-library/interfaces/AutoGen";
import { onMounted, watch, Ref, ref } from "vue";
const props = defineProps({
  conceptIri: { type: String, required: true }
});

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
