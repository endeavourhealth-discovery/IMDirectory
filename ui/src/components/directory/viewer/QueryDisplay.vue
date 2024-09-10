<template>
  <div id="query-display">
    <div v-if="!isObjectHasKeys(query)">No definition found.</div>
    <div v-else class="query-display-container flex flex-col gap-4">
      <div class="flex flex-row gap-2">
        <div v-if="showSqlButton"><Button label="Generate SQL" @click="generateSQL" data-testid="sql-button" /></div>
      </div>
      <div class="query-display">
        <div class="rec-query-display">
          <div class="include-title" style="color: green">include if</div>
          <RecursiveQueryDisplay v-if="query" :match="query" :parent-match="undefined" :full-query="query" />
        </div>
      </div>
    </div>
    <Dialog header="SQL (Postgres)" :visible="showSql" :modal="true" :style="{ width: '80vw' }" @update:visible="showSql = false">
      <pre>{{ sql }}</pre>
      <template #footer>
        <Button
          label="Copy to Clipboard"
          v-tooltip.left="'Copy to clipboard'"
          v-clipboard:copy="copyToClipboard()"
          v-clipboard:success="onCopy"
          v-clipboard:error="onCopyError"
          data-testid="copy-button"
        />
        <Button label="Close" @click="showSql = false" data-testid="close-button" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import RecursiveQueryDisplay from "@/components/query/viewer/RecursiveQueryDisplay.vue";
import { QueryService } from "@/services";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Query } from "@im-library/interfaces/AutoGen";
import { onMounted, watch, Ref, ref, computed } from "vue";
import { useUserStore } from "@/stores/userStore";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";

interface Props {
  entityIri?: string;
  definition?: string;
  showSqlButton?: boolean;
}

const userStore = useUserStore();
const currentUser = computed(() => userStore.currentUser);
const isLoggedIn = computed(() => userStore.isLoggedIn);
const props = defineProps<Props>();
const query: Ref<Query> = ref({} as Query);
const sql: Ref<string> = ref("");
const showSql: Ref<boolean> = ref(false);
const { copyToClipboard, onCopy, onCopyError } = setupCopyToClipboard(sql);

const canTestQuery = computed(() => isLoggedIn.value && (currentUser.value?.roles?.includes("create") || currentUser.value?.roles?.includes("edit")));

watch(
  () => props.definition,
  async newValue => {
    init();
  }
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
  if (props.entityIri) query.value = await QueryService.getQueryDisplay(props.entityIri, true);
  else if (props.definition) query.value = await QueryService.getQueryDisplayFromQuery(JSON.parse(props.definition), true);
}

async function generateSQL() {
  if (props.entityIri) sql.value = await QueryService.generateQuerySQL(props.entityIri);
  showSql.value = true;
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
  max-height: 100vh;
  border: 1px solid var(--p-textarea-border-color);
}

.rec-query-display {
  padding: 1rem;
}
</style>
