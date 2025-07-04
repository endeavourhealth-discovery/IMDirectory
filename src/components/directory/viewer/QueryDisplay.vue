<template>
  <div id="query-display" class="flex flex-1 flex-col">
    <Tabs v-if="!(entityType === IM.VALUESET)" id="viewer-tabs" v-model:value="activeTab" :lazy="true" scrollable>
      <TabList id="tab-list">
        <Tab value="0">Rule view</Tab>
        <Tab value="1">Logical view</Tab>
        <Tab value="2">MySQL</Tab>
        <Tab value="3">PostgreSQL</Tab>
        <Tab v-if="showDataset" value="4">Dataset definition</Tab>
      </TabList>
    </Tabs>
    <div class="flex flex-row gap-2">
      <div v-if="isLoggedIn"><Button label="Test run query" @click="testRunQuery" severity="help" /></div>
      <div v-if="isLoggedIn"><Button label="Run query" @click="runQuery" /></div>
    </div>
    <div v-if="loading" class="flex flex-row"><ProgressSpinner /></div>
    <div v-else-if="activeTab === '0' || activeTab === '1'" class="query-display-container flex flex-col gap-4">
      <div v-if="!isObjectHasKeys(query)">No expression or query definition found.</div>
      <div v-else-if="query" class="query-display">
        <div class="rec-query-display">
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
    <div v-else-if="activeTab === '2' || activeTab === '3'" class="query-display-container flex flex-col gap-4">
      <SQLDisplay :sql="sql" />
    </div>
    <div v-else-if="query?.dataSet && activeTab === '4'" class="query-display-container flex flex-col gap-4">
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
import SQLDisplay from "./SQLDisplay.vue";
import { useUserStore } from "@/stores/userStore";
import { useConfirm } from "primevue/useconfirm";
import { useRouter } from "vue-router";

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
const activeTab = ref("0");
const sql: Ref<string> = ref("");
const loading = ref(true);
const showTestResults = ref(false);
const testResults: Ref<string[]> = ref([]);

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

watch(activeTab, async () => {
  switch (activeTab.value) {
    case "0":
      query.value = await getQueryDisplay(DisplayMode.RULES);
      break;
    case "1":
      query.value = await getQueryDisplay(DisplayMode.LOGICAL);
      break;
    case "2":
      if (props.entityIri) sql.value = await QueryService.generateQuerySQL(props.entityIri, "MYSQL");
      break;
    case "3":
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
  if (query.value?.rule) {
    activeTab.value = "0";
  } else activeTab.value = "1";
  loading.value = false;
}

async function getQueryDisplay(displayMode: DisplayMode) {
  if (query.value?.typeOf) {
    return await QueryService.getQueryDisplayFromQuery(query.value, displayMode);
  } else if (props.entityIri) return await QueryService.getDisplayFromQueryIri(props.entityIri, displayMode);
  return undefined;
}

function runQuery() {
  if (query.value) {
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
}

async function addQueryToRunnerQueue() {
  if (query.value) {
    const request: QueryRequest = { query: query.value };
    await QueryService.addQueryToRunnerQueue(request);
  }
}

async function testRunQuery() {
  if (query.value) {
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
          const request: QueryRequest = { query: query.value };
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
