<template>
  <div id="quick-query">
    <div id="quick-query-button">
      <slot name="button" :runQuickQuery="runQuickQuery" />
    </div>
    <div id="quick-query-dialogs">
      <QuickQueryDialog v-model:showDialog="showQuickQueryDialog" :query="query" :query-iri="queryIri" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from "vue";
import QuickQueryDialog from "../editor/shapeComponents/setDefinition/QuickQueryDialog.vue";

interface Props {
  queryIri?: string;
  query?: string;
}

const props = defineProps<Props>();

const showQuickQueryDialog: Ref<boolean> = ref(false);

async function runQuickQuery() {
  showQuickQueryDialog.value = true;
}
</script>

<style scoped></style>
