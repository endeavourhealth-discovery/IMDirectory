<template>
  <div id="query-display" class="flex flex-1 flex-col">
    <div v-if="loading" class="flex flex-row"><ProgressSpinner /></div>
    <div v-else-if="!isObjectHasKeys(query)">No expression or query definition found.</div>
    <div v-else class="query-display-container flex flex-col gap-4">
      <Tabs id="viewer-tabs" v-model:value="logicalDisplayTab" :lazy="true" @update:value="displayToggle">
        <TabList id="tab-list">
          <Tab value="0">Rule view</Tab>
          <Tab value="1">Logical view</Tab>
        </TabList>
      </Tabs>
      <div class="flex flex-row gap-2">
        <div v-if="showSqlButton"><Button label="Generate SQL" @click="generateSQL" data-testid="sql-button" /></div>
      </div>
      <div class="query-display">
        <div class="rec-query-display">
          <span v-if="query.name" v-html="query.name"> </span>
          <div v-if="query.typeOf">
            <span class="field" v-html="query.typeOf.name"></span>
            <span class="include-title text-black-500">with the following features</span>
          </div>

          <RecursiveMatchDisplay
            :match="query"
            :clauseIndex="-1"
            :depth="0"
            :inline="false"
            :parent-match="query"
            :bracketed="false"
            :expanded="query.name === undefined"
          />
          <template v-if="query.query">
            <RecursiveQueryDisplay v-for="(subQuery, index) in query.query" :key="index" :query="subQuery" :match-expanded="false" :return-expanded="false" />
          </template>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import RecursiveMatchDisplay from "@/components/query/viewer/RecursiveMatchDisplay.vue";
import RecursiveQueryDisplay from "@/components/query/viewer/RecursiveQueryDisplay.vue";
import RecursiveWhereDisplay from "@/components/query/viewer/RecursiveWhereDisplay.vue";
import { QueryService } from "@/services";
import { DisplayMode, Query } from "@/interfaces/AutoGen";
import { computed, onMounted, ref, Ref, watch } from "vue";
import { useUserStore } from "@/stores/userStore";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";
import ReturnColumns from "@/components/query/viewer/ReturnColumns.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { getParentNode } from "@/helpers";

interface Props {
  entityIri?: string;
  definition?: string;
  showSqlButton?: boolean;
  queryDefinition?: Query;
}

const dataSetExpanded = ref(false);
const userStore = useUserStore();
const currentUser = computed(() => userStore.currentUser);
const isLoggedIn = computed(() => userStore.isLoggedIn);
const props = defineProps<Props>();
const query: Ref<Query> = ref({} as Query);
const sql: Ref<string> = ref("");
const showSql: Ref<boolean> = ref(false);
const { copyToClipboard, onCopy, onCopyError } = setupCopyToClipboard(sql);
const loading = ref(true);
const ruleView: Ref<boolean> = ref(true);
const displayMode: Ref<DisplayMode> = ref(DisplayMode.ORIGINAL);
const logicalDisplayTab: Ref<string> = ref("0");

const canTestQuery = computed(() => isLoggedIn.value && (currentUser.value?.roles?.includes("create") || currentUser.value?.roles?.includes("edit")));

const emit = defineEmits({
  navigateTo: (_payload: string) => true
});

watch(
  () => props.definition,
  async () => {
    init();
  }
);

watch(
  () => props.entityIri,
  async () => {
    init();
  }
);

onMounted(async () => {
  init();
});

async function getQuery() {
  if (props.queryDefinition) {
    query.value = await QueryService.getQueryDisplayFromQuery(props.queryDefinition, displayMode.value);
  } else if (props.entityIri) query.value = await QueryService.getDisplayFromQueryIri(props.entityIri, displayMode.value);
}

async function init() {
  loading.value = true;
  await getQuery();
  if (query.value.hasRules) {
    logicalDisplayTab.value = "0";
  } else logicalDisplayTab.value = "1";
  loading.value = false;
}

// Function to handle tab changes
async function displayToggle() {
  if (displayMode.value === DisplayMode.ORIGINAL) {
    if (query.value.hasRules) {
      displayMode.value = DisplayMode.LOGICAL;
    } else displayMode.value = DisplayMode.RULES;
  } else if (displayMode.value === DisplayMode.LOGICAL) {
    displayMode.value = DisplayMode.RULES;
  } else {
    displayMode.value = DisplayMode.LOGICAL;
  }
  await getQuery();
}

async function generateSQL() {
  if (props.entityIri) sql.value = await QueryService.generateQuerySQL(props.entityIri);
  showSql.value = true;
}

function toggle() {
  dataSetExpanded.value = !dataSetExpanded.value;
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

.field {
  padding-right: 1rem;
}

.argument {
  padding-left: 2rem;
}

.rec-query-display {
  padding: 1rem;
}
.refresh-link {
  color: #007bff; /* Blue for visibility */
  font-weight: bold;
  text-decoration: underline;
  font-size: 0.9rem;
  cursor: pointer;
}
#tab-list {
  flex: 0 0 auto;
  display: flex;
}
</style>
