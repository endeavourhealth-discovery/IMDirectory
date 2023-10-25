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
import QuickQueryDialog from "./QuickQueryDialog.vue";
import { Query } from "@im-library/interfaces/AutoGen";

interface Props {
  queryIri?: string;
  query?: Query;
}

const props = defineProps<Props>();

const showQuickQueryDialog: Ref<boolean> = ref(false);

async function runQuickQuery() {
  showQuickQueryDialog.value = true;
}
</script>

<style scoped></style>
