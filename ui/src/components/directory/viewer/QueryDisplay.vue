<template>
  <div class="query-display-container flex flex-column gap-3">
    <div class="flex flex-row gap-2">
      <div><Button label="Generate SQL" @click="generateSQL" data-testid="sql-button" /></div>
      <QuickQuery :query-iri="entityIri" v-if="canTestQuery">
        <template #button="{ runQuickQuery }">
          <Button icon="pi pi-bolt" label="Test query" severity="help" @click="runQuickQuery" class="quick-query-button" />
        </template>
      </QuickQuery>
    </div>
    <div class="query-display">
      <div class="rec-query-display">
        <div class="include-title" style="color: green">include if</div>
        <RecursiveQueryDisplay v-if="isArrayHasLength(query.match)" v-for="match of query.match" :match="match" :parent-match="undefined" :full-query="query" />
      </div>
    </div>
  </div>
  <Dialog header="SQL (Postgres)" :visible="showSql" :modal="true" :style="{ width: '80vw' }" @update:visible="showSql = false">
    <pre>{{ sql }}</pre>
    <template #footer>
      <Button label="Test" @click="test" data-testid="test-button" />
      <Button label="Copy to Clipboard" @click="copy" data-testid="copy-button" />
      <Button label="Close" @click="showSql = false" data-testid="close-button" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import RecursiveQueryDisplay from "@/components/query/viewer/RecursiveQueryDisplay.vue";
import { DirectService, Env, QueryService } from "@/services";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { Query } from "@im-library/interfaces/AutoGen";
import { onMounted, watch, Ref, ref, computed } from "vue";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";
import QuickQuery from "@/components/query/QuickQuery.vue";
import { useUserStore } from "@/stores/userStore";

interface Props {
  entityIri: string;
}

const userStore = useUserStore();
const directService = new DirectService();

const props = defineProps<Props>();
const query: Ref<Query> = ref({} as Query);
const sql: Ref<string> = ref("");
const showSql: Ref<boolean> = ref(false);
const toast = useToast();
const canTestQuery = computed(
  () => userStore.isLoggedIn && (userStore.currentUser?.roles?.includes("create") || userStore.currentUser?.roles?.includes("edit"))
);

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

async function test() {
  const queryId = await QueryService.queueQuery(props.entityIri);
  window.open(Env.DIRECTORY_URL + "QueryQueue/" + queryId, "QueryQueue");
}
</script>

<style scoped>
.query-display-container {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
}

.query-display {
  height: 100vh;
  overflow-y: auto;
  border: 1px solid var(--surface-border);
}

.rec-query-display {
  padding: 1rem;
}
</style>
