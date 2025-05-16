<template>
  <div id="query-display" class="flex flex-1 flex-col">
    <div v-if="loading" class="flex flex-row"><ProgressSpinner /></div>
    <div v-else-if="!isObjectHasKeys(query)">No expression or query definition found.</div>
    <div v-else class="query-display-container flex flex-col gap-4">
      <SelectButton v-if="!(entityType === IM.VALUE_SET)" v-model="logicalDisplayTab" :options="logicalDisplayOptions" />
      <div class="flex flex-row gap-2">
        <div v-if="showSqlButton"><Button label="Generate SQL" @click="generateSQL" data-testid="sql-button" /></div>
        <div><Button label="Run query" @click="runQuery" /></div>
      </div>
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
                :expanded="query.name === undefined"
              />
            </span>
            <Dialog header="SQL (Postgres)" :visible="showSql" :modal="true" :style="{ width: '80vw' }" @update:visible="showSql = false">
              <SQLDisplay :sql="sql" />
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
      <div v-if="query.dataSet && activeTab === '2'" class="query-display-container flex flex-col gap-4">
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
  </div>
</template>

<script setup lang="ts">
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import RecursiveMatchDisplay from "@/components/query/viewer/RecursiveMatchDisplay.vue";
import DataSetDisplay from "@/components/query/viewer/DataSetDisplay.vue";
import { QueryService } from "@/services";
import { Bool, DisplayMode, Query } from "@/interfaces/AutoGen";
import { computed, onMounted, ref, Ref, watch } from "vue";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";
import ReturnColumns from "@/components/query/viewer/ReturnColumns.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { getParentNode } from "@/helpers";
import SQLDisplay from "./SQLDisplay.vue";
import { useConfirm } from "primevue/useconfirm";
import { useRouter } from "vue-router";
import { IM } from "@/vocabulary";
import { useUserStore } from "@/stores/userStore";

interface Props {
  entityIri?: string;
  definition?: string;
  showSqlButton?: boolean;
  queryDefinition?: Query;
  editMode?: boolean;
  entityType?: string;
  eclQuery?: boolean;
  showDataset?: boolean;
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
const activeTab = ref("0");
const sql: Ref<string> = ref("");
const showSql: Ref<boolean> = ref(false);
const { copyToClipboard, onCopy, onCopyError } = setupCopyToClipboard(sql);
const loading = ref(true);
const displayMode: Ref<DisplayMode> = ref(DisplayMode.ORIGINAL);
const logicalDisplayTab: Ref<string> = ref("0");
watch(logicalDisplayTab, () => {
  displayToggle();
});
const logicalDisplayOptions: Ref<string[]> = ref([]);

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

watch(
  () => props.showDataset,
  async () => await init()
);

watch(activeTab, newVal => {
  if (activeTab.value === "1") displayMode.value = DisplayMode.LOGICAL;
  else if (activeTab.value === "0") displayMode.value = DisplayMode.RULES;
  getQuery();
});

onMounted(async () => {
  init();
});

async function getQuery() {
  if (query.value.typeOf) {
    query.value = await QueryService.getQueryDisplayFromQuery(query.value, displayMode.value);
  } else if (props.entityIri) query.value = await QueryService.getDisplayFromQueryIri(props.entityIri, displayMode.value);
}

async function init() {
  loading.value = true;
  await getQuery();
  setLogicalDisplayOptions();
  if (query.value.rule) {
    logicalDisplayTab.value = "Rule view";
  } else logicalDisplayTab.value = "Logical view";
  loading.value = false;
}

function setLogicalDisplayOptions() {
  if (props.showDataset) logicalDisplayOptions.value = ["Rule view", "Logical view", "Dataset definition"];
  else logicalDisplayOptions.value = ["Rule view", "Logical view"];
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

async function generateSQL() {
  if (props.entityIri) sql.value = await QueryService.generateQuerySQL(props.entityIri);
  showSql.value = true;
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
    accept: async () => router.push({ name: "QueryRunner" }),
    reject: () => confirm.close()
  });
}

function toggle() {
  dataSetExpanded.value = !dataSetExpanded.value;
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
