<template>
  <div class="query-display-container">
    <Button label="Generate SQL" @click="generateSQL" data-testid="sql-button" />
    <div class="include-title" style="color: green">include if</div>
    <RecursiveQueryDisplay v-if="isArrayHasLength(query.match)" v-for="match of query.match" :match="match" :parent-match="undefined" :full-query="query" />
  </div>
  <Dialog header="SQL (Postgres)" :visible="showSql" :modal="true" :style="{ width: '80vw' }" @update:visible="showSql = false">
    <pre>{{ sql }}</pre>
    <template #footer>
      <Button label="Copy to Clipboard" @click="copy" data-testid="copy-button" />
      <Button label="Close" @click="showSql = false" data-testid="close-button" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import RecursiveQueryDisplay from "@/components/query/viewer/RecursiveQueryDisplay.vue";
import { QueryService } from "@/services";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { Query } from "@im-library/interfaces/AutoGen";
import { onMounted, watch, Ref, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";

interface Props {
  entityIri: string;
}
const props = defineProps<Props>();
const query: Ref<Query> = ref({} as Query);
const sql: Ref<string> = ref("");
const showSql: Ref<boolean> = ref(false);
const toast = useToast();

watch(
  () => props.entityIri,
  async newValue => {
    init();
  }
);

onMounted(async () => {
  init();
});

async function init() {
  query.value = await QueryService.getQueryDisplay(props.entityIri);
}

async function generateSQL() {
  sql.value = await QueryService.generateQuerySQL(props.entityIri);
  showSql.value = true;
}

async function copy() {
  await navigator.clipboard.writeText(sql.value);
  toast.add(new ToastOptions(ToastSeverity.SUCCESS, "SQL copied to clipboard"));
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
