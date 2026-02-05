<template>
  <div id="query-display" class="flex flex-1 flex-col">
    <div v-if="loading" class="flex flex-row"><ProgressSpinner /></div>

    <div v-else-if="!isObjectHasKeys(query)">No expression or query definition found.</div>
    <div v-else class="query-display-container flex flex-col gap-4">
      <template v-if="!eclQuery">
        <SelectButton v-model="selectedDisplayOption" :options="displayOptions" />
        <div class="flex flex-row gap-2">
          <div v-if="isLoggedIn">
            <Button
              label="View arguments"
              @click="
                showArgumentsDisplay();
                runOnConfirm = false;
              "
              :loading="checkingArguments"
            />
          </div>
          <div v-if="isLoggedIn"><Button label="Test run query" @click="testRunQuery" severity="help" /></div>
          <div v-if="isLoggedIn">
            <Button
              label="Run query"
              @click="
                runQuery();
                runOnConfirm = true;
              "
              :loading="checkingArguments"
            />
          </div>
        </div>
      </template>
      <template v-if="query && (selectedDisplayOption == DisplayOptions.RuleView || selectedDisplayOption == DisplayOptions.LogicalView)">
        <div class="query-display-content rec-query-display">
          <span v-if="query.name" v-html="query.name"> </span>
          <div v-if="query.typeOf">
            <span class="field" v-html="query.typeOf.name"></span>
            <span class="include-title text-black-500">with the following features</span>
          </div>
          <RecursiveMatchDisplay
            :match="query"
            :clauseIndex="0"
            :depth="0"
            :inline="false"
            :parent-match="rootQuery"
            :bracketed="false"
            :eclQuery="eclQuery"
            :expanded="query.name === undefined"
          />
        </div>
      </template>
      <div v-else-if="[DisplayOptions.MySQL, DisplayOptions.PostreSQL].includes(selectedDisplayOption)" class="query-display-content flex flex-col gap-4">
        <SQLDisplay :sql="sql" />
      </div>
      <div v-else-if="selectedDisplayOption == DisplayOptions.IML" class="query-display-content flex flex-col gap-4">
        <IMLDisplay v-if="iml" :iml="iml" />
      </div>
      <div v-if="query && query.columnGroup">
        <span>Output columns </span>
        <Button text :icon="!showColumns ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" @click="showColumns = !showColumns"></Button>
        <div v-if="showColumns && query" class="query-display-content flex flex-col gap-4">
          <ColumnGroupDisplay
            v-for="(nestedQuery, index) in query?.columnGroup"
            :match="nestedQuery"
            :key="`nestedQuery-${index}`"
            :matchExpanded="false"
            :returnExpanded="true"
            :index="index"
            :parentQuery="query"
          />
        </div>
      </div>
      <TestQueryResults v-model:show-dialog="showTestResults" :test-query-results="testResults" />
      <ConfirmDialog group="templating">
        <template #message="slotProps">
          <div class="border-surface-200 dark:border-surface-700 flex w-full flex-col items-center gap-4 border-b">
            <div class="confirm-container gap-4">
              <IMFontAwesomeIcon size="2x" :icon="slotProps.message.icon"></IMFontAwesomeIcon>
              <p>{{ slotProps.message.message }}</p>
            </div>
            <ArgumentDisplay :arguments="missingArguments.length ? missingArguments : requestArguments" :show-footer-buttons="false" />
          </div>
        </template>
      </ConfirmDialog>
      <ArgumentDisplayDialog
        :arguments="missingArguments.length ? missingArguments : requestArguments"
        :runOnConfirm="runOnConfirm"
        :showFooterButtons="true"
        v-model:showDialog="showArgumentSelector"
        @arguments-completed="addArgumentsAndRun"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import RecursiveMatchDisplay from "@/components/query/viewer/RecursiveMatchDisplay.vue";
import ColumnGroupDisplay from "@/components/query/viewer/ColumnGroupDisplay.vue";
import { Env, QueryService } from "@/services";
import { Action, Argument, ArgumentReference, Bool, DisplayMode, IMLLanguage, Query, QueryRequest, Resource, UserRole } from "@/interfaces/AutoGen";
import { computed, onMounted, provide, ref, Ref, watch } from "vue";
import SQLDisplay from "./SQLDisplay.vue";
import IMLDisplay from "./IMLDisplay.vue";
import { useUserStore } from "@/stores/userStore";
import { useConfirm } from "primevue/useconfirm";
import { useRouter } from "vue-router";
import TestQueryResults from "@/components/directory/viewer/queryDisplay/TestQueryResults.vue";
import ArgumentDisplay from "@/components/directory/viewer/queryDisplay/ArgumentDisplay.vue";
import ArgumentDisplayDialog from "@/components/directory/viewer/queryDisplay/ArgumentDisplayDialog.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { manageRoleGroup } from "@/helpers/buildQuery";

enum DisplayOptions {
  RuleView = "Rule view",
  LogicalView = "Logical view",
  MySQL = "MySQL",
  PostreSQL = "PostgreSQL",
  IML = "IMLanguage"
}

interface Props {
  entityIri?: string;
  definition?: string;
  queryDefinition?: Query;
  entityType?: string;
  eclQuery?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  navigateTo: [payload: string];
}>();
const userStore = useUserStore();
const confirm = useConfirm();
const router = useRouter();

const isLoggedIn = computed(() => userStore.isLoggedIn);
const currentUser = computed(() => userStore.currentUser);
const showColumns = ref(false);

const query: Ref<Query | undefined> = ref<Query | undefined>(props.queryDefinition);
const rootQuery = ref({} as Query);
const sql: Ref<string> = ref("");
const iml: Ref<IMLLanguage | undefined> = ref();
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
const runOnConfirm = ref(false);
const hasPermissionQueryExecute = ref(false);
provide("queryIri", props.entityIri);
provide("displayMode", displayMode);

watch(
  () => props.definition,
  async () => {
    await init();
  }
);

watch(
  () => props.queryDefinition,
  () => {
    query.value = props.queryDefinition;
  }
);

watch(
  () => props.entityIri,
  async () => {
    await init();
  }
);

watch(currentUser, async () => {
  hasPermissionQueryExecute.value = currentUser.value?.roles.includes(UserRole.EXECUTOR)!!;
});

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
    case DisplayOptions.IML:
      if (props.entityIri) iml.value = await QueryService.generateQueryIML(props.entityIri);
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
  if (query.value?.rule) selectedDisplayOption.value = DisplayOptions.RuleView;
  else selectedDisplayOption.value = DisplayOptions.LogicalView;
  // if (isLoggedIn.value) {
  // hasPermissionQueryExecute.value = await CasbinService.hasPermission(Resource.QUERY, Action.EXECUTE);
  //}
  loading.value = false;
}

function setDisplayOptions() {
  displayOptions.value = [DisplayOptions.RuleView, DisplayOptions.LogicalView, DisplayOptions.MySQL, DisplayOptions.PostreSQL, DisplayOptions.IML];
}

async function getQueryDisplay(displayMode: DisplayMode) {
  if (query.value?.typeOf) {
    return await QueryService.getQueryDisplayFromQuery(query.value, displayMode);
  } else if (props.entityIri) return await QueryService.getDisplayFromQueryIri(props.entityIri, displayMode);
  return undefined;
}

async function showArgumentsDisplay() {
  showArgumentSelector.value = true;
  await checkArguments();
}

async function checkArguments(): Promise<boolean> {
  if (query.value && query.value.iri) {
    checkingArguments.value = true;
    const request: QueryRequest = { query: query.value, argument: requestArguments.value };
    missingArguments.value = await QueryService.findMissingArguments(request);
    if (missingArguments.value.length) showArgumentSelector.value = true;
    checkingArguments.value = false;
  }
  return !missingArguments.value.length;
}

async function runQuery() {
  if (query.value) {
    const argumentsVerified = await checkArguments();
    if (!argumentsVerified) return;
    confirm.require({
      group: "templating",
      message: "Are you sure you want to run this query '" + query.value.name + "' with the following arguments: \n",
      header: "Run query",
      icon: "fa-regular fa-circle-exclamation",
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
        window.open(`${Env.QUERY_RUNNER}`, "_blank");
      },
      reject: () => confirm.close()
    });
  }
}

async function addArgumentsAndRun(completedArguments: Argument[], run: boolean) {
  requestArguments.value = completedArguments;
  showArgumentSelector.value = false;
  if (run) await runQuery();
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
.confirm-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 80%;
}
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
