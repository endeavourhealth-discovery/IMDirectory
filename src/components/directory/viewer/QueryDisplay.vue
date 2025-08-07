<template>
  <div id="query-display" class="flex flex-1 flex-col">
    <div v-if="loading" class="flex flex-row"><ProgressSpinner /></div>
    <div v-if="!isObjectHasKeys(query)">No expression or query definition found.</div>
    <div v-else class="query-display-container flex flex-col gap-4">
      <SelectButton v-model="selectedDisplayOption" :options="displayOptions" />
      <div class="flex flex-row gap-2">
        <div v-if="isLoggedIn"><Button label="View arguments" @click="checkArguments" :loading="checkingArguments" /></div>
        <div v-if="isLoggedIn"><Button label="Test run query" @click="testRunQuery" severity="help" /></div>
        <div v-if="isLoggedIn"><Button label="Run query" @click="runQuery" :loading="checkingArguments" /></div>
      </div>
      <div v-if="[DisplayOptions.LogicalView, DisplayOptions.RuleView].includes(selectedDisplayOption)" class="query-display-content">
        <div v-if="query" class="rec-query-display">
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
      <div v-else-if="[DisplayOptions.MySQL, DisplayOptions.PostreSQL].includes(selectedDisplayOption)" class="query-display-content flex flex-col gap-4">
        <SQLDisplay :sql="sql" />
      </div>
      <div v-else-if="[DisplayOptions.DatasetDefinition].includes(selectedDisplayOption) && query" class="query-display-content flex flex-col gap-4">
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
      <TestQueryResults v-model:show-dialog="showTestResults" :test-query-results="testResults" />
      <ArgumentSelector v-model:showDialog="showArgumentSelector" :missingArguments="missingArguments" @arguments-completed="addArgumentsAndRun" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import RecursiveMatchDisplay from "@/components/query/viewer/RecursiveMatchDisplay.vue";
import DataSetDisplay from "@/components/query/viewer/DataSetDisplay.vue";
import { QueryService } from "@/services";
import { Argument, ArgumentReference, Bool, DisplayMode, Query, QueryRequest } from "@/interfaces/AutoGen";
import { computed, onMounted, ref, Ref, watch } from "vue";
import { IM, XSD } from "@/vocabulary";
import SQLDisplay from "./SQLDisplay.vue";
import { useUserStore } from "@/stores/userStore";
import { useConfirm } from "primevue/useconfirm";
import { useRouter } from "vue-router";
import TestQueryResults from "@/components/queryRunner/TestQueryResults.vue";
import ArgumentSelector from "@/components/queryRunner/ArgumentSelector.vue";

enum DisplayOptions {
  RuleView = "Rule view",
  LogicalView = "Logical view",
  MySQL = "MySQL",
  PostreSQL = "PostgreSQL",
  DatasetDefinition = "Dataset definition"
}

interface Props {
  entityIri?: string;
  definition?: string;
  queryDefinition?: Query;
  editMode?: boolean;
  entityType?: string;
  eclQuery?: boolean;
  showDataset?: boolean;
}

const props = defineProps<Props>();

const userStore = useUserStore();
const confirm = useConfirm();
const router = useRouter();

const isLoggedIn = computed(() => userStore.isLoggedIn);

const query: Ref<Query | undefined> = ref<Query | undefined>(props.queryDefinition);
const rootQuery = ref({} as Query);
const sql: Ref<string> = ref("");
const loading = ref(true);
const showTestResults = ref(false);
const testResults: Ref<string[]> = ref([]);
const displayMode: Ref<DisplayMode> = ref(DisplayMode.ORIGINAL);

const displayOptions: Ref<string[]> = ref([]);
const selectedDisplayOption: Ref<DisplayOptions> = ref(DisplayOptions.LogicalView);
const showArgumentSelector = ref(false);
const checkingArguments = ref(false);
const missingArguments: Ref<ArgumentReference[]> = ref([]);
const requestArguments: Ref<Argument[]> = ref([]);

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

watch(selectedDisplayOption, async (newValue, oldValue) => {
  if (!newValue) selectedDisplayOption.value = oldValue;
  switch (selectedDisplayOption.value) {
    case DisplayOptions.RuleView:
      if (displayMode.value != DisplayMode.RULES) query.value = await getQueryDisplay(DisplayMode.RULES);
      displayMode.value = DisplayMode.RULES;
      break;
    case DisplayOptions.LogicalView:
      if (displayMode.value != DisplayMode.LOGICAL) query.value = await getQueryDisplay(DisplayMode.LOGICAL);
      displayMode.value = DisplayMode.LOGICAL;
      break;
    case DisplayOptions.MySQL:
      if (props.entityIri) sql.value = await QueryService.generateQuerySQL(props.entityIri, "MYSQL");
      break;
    case DisplayOptions.PostreSQL:
      if (props.entityIri) sql.value = await QueryService.generateQuerySQL(props.entityIri, "POSTGRESQL");
      break;
    default:
      break;
  }
});

onMounted(async () => {
  await init();
});

async function init() {
  loading.value = true;
  if (!query.value?.typeOf) {
    if (props.entityIri) query.value = await QueryService.getDisplayFromQueryIri(props.entityIri, DisplayMode.ORIGINAL);
  }
  displayMode.value = query.value?.rule ? DisplayMode.RULES : DisplayMode.LOGICAL;
  setDisplayOptions();
  if (query.value?.rule) {
    selectedDisplayOption.value = DisplayOptions.RuleView;
  } else DisplayOptions.LogicalView;
  loading.value = false;
}

function setDisplayOptions() {
  if (props.showDataset)
    displayOptions.value = [
      DisplayOptions.RuleView,
      DisplayOptions.LogicalView,
      DisplayOptions.MySQL,
      DisplayOptions.PostreSQL,
      DisplayOptions.DatasetDefinition
    ];
  else displayOptions.value = [DisplayOptions.RuleView, DisplayOptions.LogicalView, DisplayOptions.MySQL, DisplayOptions.PostreSQL];
}

async function getQueryDisplay(displayMode: DisplayMode) {
  if (query.value?.typeOf) {
    return await QueryService.getQueryDisplayFromQuery(query.value, displayMode);
  } else if (props.entityIri) return await QueryService.getDisplayFromQueryIri(props.entityIri, displayMode);
  return undefined;
}

async function checkArguments(): Promise<boolean> {
  if (query.value) {
    checkingArguments.value = true;
    const request: QueryRequest = { query: query.value, argument: requestArguments.value };
    missingArguments.value = await QueryService.findMissingArguments(request);
    if (isArrayHasLength(missingArguments.value)) {
      showArgumentSelector.value = true;
      checkingArguments.value = false;
      return false;
    }
    checkingArguments.value = false;
  }
  return true;
}

async function runQuery() {
  if (query.value) {
    const argumentsVerified = await checkArguments();
    if (!argumentsVerified) return;
    confirm.require({
      message: "Are you sure you want to run this query '" + query.value.name + "'?" + requestArguments.value.toString(),
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
}

async function addArgumentsAndRun(completedArguments: Argument[]) {
  requestArguments.value = completedArguments;
  await runQuery();
}

async function addQueryToRunnerQueue() {
  if (query.value) {
    const request: QueryRequest = await getQueryRequestFromQueryIri();
    await QueryService.addQueryToRunnerQueue(request);
  }
}

async function getQueryRequestFromQueryIri() {
  if (query.value?.iri) {
    const queryDisplay = await QueryService.getDisplayFromQueryIri(query.value.iri, DisplayMode.LOGICAL);
    return { query: queryDisplay, argument: requestArguments.value };
  }
  return {} as QueryRequest;
}

async function testRunQuery() {
  if (query.value) {
    const argumentsVerified = await checkArguments();
    if (!argumentsVerified) return;
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
        if (query.value) {
          const request: QueryRequest = { query: query.value, argument: requestArguments.value };
          testResults.value = await QueryService.testRunQuery(request);
          showTestResults.value = true;
        }
      },
      reject: () => confirm.close()
    });
  }
}
</script>

<style scoped>
.query-display-container {
  width: 100%;
  height: 100%;
}

.query-display-content {
  overflow: auto;
}

#query-display {
  display: flex;
  flex: 1 1 auto;
}

.query-display-view {
  overflow: auto;
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

.button-bar {
  flex: 0 1 auto;
  padding: 1rem 1rem 1rem 0;
  gap: 0.5rem;
  display: flex;
  flex-flow: row;
  justify-content: flex-end;
}
</style>
