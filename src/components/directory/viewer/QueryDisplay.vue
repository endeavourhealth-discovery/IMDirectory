<template>
  <div id="query-display" class="flex flex-1 flex-col">
    <div v-if="loading" class="flex flex-row"><ProgressSpinner /></div>
    <Tabs v-if="!(entityType === IM.VALUESET)" id="viewer-tabs" v-model:value="activeTab" :lazy="true" scrollable>
      <TabList id="tab-list">
        <Tab value="0">Rule view</Tab>
        <Tab value="1">Logical view</Tab>
        <Tab value="2">MySQL</Tab>
        <Tab value="3">PostgreSQL</Tab>
        <Tab v-if="showDataset" value="4">Dataset definition</Tab>
      </TabList>
    </Tabs>
    <div v-if="activeTab === '0' || activeTab === '1'" class="query-display-container flex flex-col gap-4">
      <div v-if="!isObjectHasKeys(query)">No expression or query definition found.</div>
      <div class="query-display">
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
    <div v-if="activeTab === '2'" class="query-display-container flex flex-col gap-4">
      <pre>{{ sql }}</pre>
    </div>
    <div v-if="activeTab === '3'" class="query-display-container flex flex-col gap-4">
      <pre>{{ mysql }}</pre>
    </div>
    <div v-if="query.dataSet && activeTab === '4'" class="query-display-container flex flex-col gap-4">
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
</template>

<script setup lang="ts">
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import RecursiveMatchDisplay from "@/components/query/viewer/RecursiveMatchDisplay.vue";
import DataSetDisplay from "@/components/query/viewer/DataSetDisplay.vue";
import { QueryService } from "@/services";
import { Bool, DisplayMode, Query } from "@/interfaces/AutoGen";
import { onMounted, ref, Ref, watch } from "vue";
import { IM } from "@/vocabulary";

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
const query: Ref<Query> = ref<Query>(props.queryDefinition ?? ({} as Query));
const rootQuery = ref({} as Query);
const activeTab = ref("0");
const sql: Ref<string> = ref("");
const mysql: Ref<string> = ref("");
const loading = ref(true);
const displayMode: Ref<DisplayMode> = ref(DisplayMode.ORIGINAL);

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
  if (activeTab.value === "1") displayMode.value = DisplayMode.LOGICAL;
  else if (activeTab.value === "0") displayMode.value = DisplayMode.RULES;
  await getQuery();
});

onMounted(async () => {
  await init();
});

async function getQuery() {
  if (query.value.typeOf) {
    query.value = await QueryService.getQueryDisplayFromQuery(query.value, displayMode.value);
  } else if (props.entityIri) query.value = await QueryService.getDisplayFromQueryIri(props.entityIri, displayMode.value);
}

async function getSQL() {
  if (props.entityIri) {
    sql.value = await QueryService.generateQuerySQL(props.entityIri, "MYSQL");
    mysql.value = await QueryService.generateQuerySQL(props.entityIri, "POSTGRESQL");
  }
}

async function init() {
  loading.value = true;
  await getQuery();
  await getSQL();
  if (query.value.rule) {
    activeTab.value = "0";
  } else activeTab.value = "1";
  loading.value = false;
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
<script setup lang="ts"></script>
