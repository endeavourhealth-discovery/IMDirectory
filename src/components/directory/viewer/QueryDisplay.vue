<template>
  <div id="query-display" class="flex flex-1 flex-col">
    <div v-if="loading" class="flex flex-row"><ProgressSpinner /></div>
    <div v-else-if="!isObjectHasKeys(query)">No expression or query definition found.</div>
    <div v-else class="query-display-container flex flex-col gap-4">
      <SelectButton v-model="logicalDisplayTab" :options="logicalDisplayOptions" />
      <div class="flex flex-row gap-2">
        <div v-if="isLoggedIn"><Button label="Test run query" @click="testRunQuery" severity="help" /></div>
        <div v-if="isLoggedIn"><Button label="Run query" @click="runQuery" /></div>
      </div>
      <div v-if="[DisplayOption.RuleView, DisplayOption.LogicalView].includes(logicalDisplayTab)" class="query-display-view flex flex-col gap-4">
        <div class="query-display">
          <div v-if="loadingQuery"><ProgressSpinner /></div>
          <div v-else class="rec-query-display">
            <span v-if="query.name" v-html="query.name"> </span>
            <div v-if="query.typeOf">
              <span class="field" v-html="query.typeOf.name"></span>
              <span class="include-title text-black-500">with the following features</span>
            </div>
            <span v-if="query.rule">
              <div class="tree-node-wrapper">
                <span v-for="(nestedQuery, index) in query.rule" :key="index">
                  <RecursiveMatchDisplay
                    :match="nestedQuery"
                    :key="`nestedQueryDisplay-${index}`"
                    :clause-index="index"
                    :property-index="index"
                    :parentOperator="Bool.rule"
                    :depth="0"
                    :parent-match="query"
                    :bracketed="false"
                    :edit-mode="editMode"
                    :eclQuery="eclQuery"
                  />
                </span>
              </div>
            </span>
            <span v-else>
              <RecursiveMatchDisplay
                :match="query"
                :clauseIndex="-1"
                :depth="0"
                :inline="false"
                :parent-match="rootQuery"
                :bracketed="false"
                :editMode="editMode"
                :eclQuery="eclQuery"
                :expanded="query.name === undefined"
              />
            </span>
          </div>
        </div>
      </div>
      <div v-else-if="logicalDisplayTab === DisplayOption.MySQL" class="query-display-view flex flex-col gap-4">
        <SQLDisplay :sql="sql" />
      </div>
      <div v-else-if="logicalDisplayTab === DisplayOption.PostgreSQL" class="query-display-view flex flex-col gap-4">
        <SQLDisplay :sql="mysql" />
      </div>
      <div v-else-if="query.dataSet && logicalDisplayTab === DisplayOption.DatasetDefinition" class="query-display-view flex flex-col gap-4">
        <DataSetDisplay
          v-for="(nestedQuery, index) in query.dataSet"
          :query="nestedQuery"
          :key="`nestedQuery-${index}`"
          :matchExpanded="false"
          :returnExpanded="true"
          :index="index"
          :editMode="editMode"
        />
      </div>
    </div>
    <TestQueryResults v-model:show-dialog="showTestResults" :test-query-results="testResults" />
  </div>
</template>

<script setup lang="ts">
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import RecursiveMatchDisplay from "@/components/query/viewer/RecursiveMatchDisplay.vue";
import DataSetDisplay from "@/components/query/viewer/DataSetDisplay.vue";
import { QueryService } from "@/services";
import { Bool, DisplayMode, Query, QueryRequest } from "@/interfaces/AutoGen";
import { computed, onMounted, ref, Ref, watch } from "vue";
import { IM } from "@/vocabulary";
import { useUserStore } from "@/stores/userStore";
import { useConfirm } from "primevue/useconfirm";
import { useRouter } from "vue-router";
import SQLDisplay from "./SQLDisplay.vue";
import TestQueryResults from "@/components/queryRunner/TestQueryResults.vue";

interface Props {
  entityIri?: string;
  definition?: string;
  queryDefinition?: Query;
  editMode?: boolean;
  entityType?: string;
  eclQuery?: boolean;
  showDataset?: boolean;
}

enum DisplayOption {
  RuleView = "Rule view",
  LogicalView = "Logical view",
  MySQL = "MySQL",
  PostgreSQL = "PostgreSQL",
  DatasetDefinition = "Dataset definition"
}

const confirm = useConfirm();
const router = useRouter();

const dataSetExpanded = ref(false);
const userStore = useUserStore();
const currentUser = computed(() => userStore.currentUser);
const isLoggedIn = computed(() => userStore.isLoggedIn);
const props = defineProps<Props>();
const query: Ref<Query> = ref<Query>(props.queryDefinition ?? ({} as Query));
const rootQuery = ref({} as Query);
const sql: Ref<string> = ref("");
const mysql: Ref<string> = ref("");
const loading = ref(true);
const loadingQuery = ref(false);
const displayMode: Ref<DisplayMode> = ref(DisplayMode.ORIGINAL);
const logicalDisplayTab: Ref<DisplayOption> = ref(DisplayOption.RuleView);
watch(logicalDisplayTab, () => {
  displayToggle();
});
const logicalDisplayOptions: Ref<DisplayOption[]> = ref([]);
const showTestResults = ref(false);
const testResults: Ref<string[]> = ref([]);

const emit = defineEmits({
  navigateTo: (_payload: string) => true
});

watch(
  () => props.definition,
  async () => {
    await init();
  }
);

watch(
  () => props.entityIri,
  async () => {
    await init();
  }
);

watch(logicalDisplayTab, async () => {
  if (logicalDisplayTab.value === DisplayOption.LogicalView) {
    displayMode.value = DisplayMode.LOGICAL;
    await getQuery();
  } else if (logicalDisplayTab.value === DisplayOption.RuleView) {
    displayMode.value = DisplayMode.RULES;
    await getQuery();
  }
});

watch(showTestResults, () => {
  if (!showTestResults) testResults.value = [];
});

onMounted(async () => {
  await init();
});

async function getQuery() {
  loadingQuery.value = true;
  if (query.value.typeOf) {
    query.value = await QueryService.getQueryDisplayFromQuery(query.value, displayMode.value);
  } else if (props.entityIri) query.value = await QueryService.getDisplayFromQueryIri(props.entityIri, displayMode.value);
  loadingQuery.value = false;
}

async function getSQL() {
  if (props.entityIri) {
    sql.value = await QueryService.generateQuerySQL(props.entityIri, "MYSQL");
    mysql.value = await QueryService.generateQuerySQL(props.entityIri, "POSTGRESQL");
  }
}

async function init() {
  loading.value = true;
  setLogicalDisplayOptions();
  await getQuery();
  await getSQL();
  if (query.value.rule) {
    logicalDisplayTab.value = DisplayOption.RuleView;
  } else logicalDisplayTab.value = DisplayOption.LogicalView;
  loading.value = false;
}

function setLogicalDisplayOptions() {
  if (props.showDataset)
    logicalDisplayOptions.value = [
      DisplayOption.RuleView,
      DisplayOption.LogicalView,
      DisplayOption.MySQL,
      DisplayOption.PostgreSQL,
      DisplayOption.DatasetDefinition
    ];
  else logicalDisplayOptions.value = [DisplayOption.RuleView, DisplayOption.LogicalView, DisplayOption.MySQL, DisplayOption.PostgreSQL];
}

// Function to handle tab changes
async function displayToggle() {
  if (displayMode.value === DisplayMode.ORIGINAL) {
    if (query.value.rule) {
      displayMode.value = DisplayMode.LOGICAL;
    } else displayMode.value = DisplayMode.RULES;
  } else if (displayMode.value === DisplayMode.LOGICAL) {
    displayMode.value = DisplayMode.RULES;
  } else {
    displayMode.value = DisplayMode.LOGICAL;
  }
  await getQuery();
}

function runQuery() {
  confirm.require({
    message: "Are you sure you want to run this query '" + query.value.name + "'?",
    header: "Run query",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "No",
      severity: "secondary",
      outlined: true
    },
    acceptProps: {
      label: "Yes"
    },
    accept: async () => {
      await addQueryToRunnerQueue();
      router.push({ name: "QueryRunner" });
    },
    reject: () => confirm.close()
  });
}

async function addQueryToRunnerQueue() {
  const request: QueryRequest = { query: query.value };
  await QueryService.addQueryToRunnerQueue(request);
}

async function testRunQuery() {
  confirm.require({
    message: "Are you sure you want to test run this query '" + query.value.name + "'?",
    header: "Test run query",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "No",
      severity: "secondary",
      outlined: true
    },
    acceptProps: {
      label: "Yes"
    },
    accept: async () => {
      const request: QueryRequest = { query: query.value };
      testResults.value = await QueryService.testRunQuery(request);
      showTestResults.value = true;
    },
    reject: () => confirm.close()
  });
}
</script>

<style scoped>
.query-display-container {
  width: 100%;
  height: 100%;
}

#query-display {
  display: flex;
  flex: 1 1 auto;
}

.query-display-view {
  overflow: auto;
}

.query-display {
  max-height: 100vh;
  border: 1px solid var(--p-textarea-border-color);
}

.field {
  padding-right: 1rem;
}

.tree-node-wrapper {
  position: relative;
  padding-left: 0rem;
}

.tree-node-wrapper::before {
  content: "";
  position: absolute;
  top: 0;
  width: 0.1rem;
  height: 100%;
  border-left: 0.1rem dotted #999;
}

.rec-query-display {
  padding: 1rem;
}
#tab-list {
  flex: 0 0 auto;
  display: flex;
}
</style>
<script setup lang="ts"></script>
