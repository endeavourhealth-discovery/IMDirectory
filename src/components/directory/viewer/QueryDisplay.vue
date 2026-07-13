<template>
  <div id="query-display" class="flex flex-1 flex-col">
    <div v-if="loading" class="flex flex-row"><ProgressSpinner /></div>

    <div v-else-if="!isObjectHasKeys(query)">No expression or query definition found.</div>
    <div v-else class="query-display-container flex flex-col gap-4">
      <template v-if="!eclQuery">
        <SelectButton v-model="selectedDisplayOption" :options="displayOptions" />
      </template>
      <template
        v-if="
          query &&
          (selectedDisplayOption == DisplayOptions.RuleView ||
            selectedDisplayOption == DisplayOptions.LogicalView ||
            selectedDisplayOption == DisplayOptions.Original)
        "
      >
        <div class="query-display-content rec-query-display">
          <span v-if="query.name" v-html="query.name"> </span>
          <div v-if="query.typeOf">
            <span class="field" v-html="query.typeOf.name"></span>
            <span class="include-title text-black-500">with the following features</span>
          </div>
          <template v-if="boolGroup">
            <div :style="{ marginLeft: `0rem` }">
              <div
                v-for="(nestedQuery, index) in boolGroup"
                :key="`nestedQueryDisplay-${index}`"
                :class="operator === Bool.rule && index > 0 ? 'rule-box' : ''"
              >
                <RecursiveMatchDisplay
                  :baseType="baseType"
                  :clause-index="index"
                  :depth="1"
                  :eclQuery="eclQuery"
                  :match="nestedQuery as Match"
                  :parent-match="query"
                  :parent-operator="operator"
                />
              </div>
            </div>
          </template>
          <template v-else>
            <div>
              <RecursiveMatchDisplay
                :baseType="baseType"
                :clauseIndex="0"
                :depth="0"
                :eclQuery="eclQuery"
                :expanded="query.name === undefined"
                :match="query"
                :parent-match="rootQuery"
              />
            </div>
          </template>
        </div>
      </template>
      <div v-else-if="[DisplayOptions.MySQL, DisplayOptions.PostreSQL].includes(selectedDisplayOption)" class="query-display-content flex flex-col gap-4">
        <SQLDisplay :sql="sql" />
      </div>
      <div v-if="query && query.columnGroup">
        <span>Output columns </span>
        <Button :icon="!showColumns ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" text @click="showColumns = !showColumns"></Button>
        <div v-if="showColumns && query" class="query-display-content flex flex-col gap-4">
          <ColumnGroupDisplay
            v-for="(_, index) in query.columnGroup"
            :key="`nestedQuery-${index}`"
            v-model:datasetEntry="query.columnGroup[index]"
            :baseType="baseType"
            :index="index"
            :matchExpanded="true"
            :parentQuery="query"
            :returnExpanded="true"
          />
        </div>
      </div>
      <div v-if="query && query.return">
        <span>Returns:</span>
        <ReturnColumns :parentQuery="query!" :select="query.return" class="pl-8" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Ref, computed, onMounted, provide, ref, watch } from "vue";

import { Bool, DisplayMode } from "@endeavour/vue-library/enums";
import { isObjectHasKeys } from "@endeavour/vue-library/helpers";
import type { Argument, Match, Node, Query, QueryRequest } from "@endeavour/vue-library/models";

import { cloneDeep } from "lodash-es";

import ColumnGroupDisplay from "@/components/query/viewer/ColumnGroupDisplay.vue";
import RecursiveMatchDisplay from "@/components/query/viewer/RecursiveMatchDisplay.vue";
import ReturnColumns from "@/components/query/viewer/ReturnColumns.vue";
import { getBoolGroup, getBooleanOperator } from "@/helpers/buildQuery";
import { QueryService } from "@/services";

import SQLDisplay from "./SQLDisplay.vue";

enum DisplayOptions {
  RuleView = "Rule view",
  LogicalView = "Logical view",
  Original = "Original view",
  MySQL = "MySQL",
  PostreSQL = "PostgreSQL"
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

const showColumns = ref(false);

const query: Ref<Query | undefined> = ref<Query | undefined>(props.queryDefinition);
const rootQuery = ref({} as Query);
const sql: Ref<string> = ref("");
const loading = ref(true);
const displayMode: Ref<DisplayMode> = ref(DisplayMode.ORIGINAL);
const displayOptions: Ref<string[]> = ref([]);
const selectedDisplayOption: Ref<DisplayOptions> = ref(DisplayOptions.LogicalView);
const requestArguments: Ref<Argument[]> = ref([]);
const baseType: Ref<Node> = ref({});
const deepQuery: Ref<Query | undefined> = ref();
const originalDisplay: Ref<DisplayMode> = ref(DisplayMode.ORIGINAL);
const operator = computed(() => {
  return getBooleanOperator("Match", query.value);
});
const boolGroup = computed(() => {
  return getBoolGroup("Match", query.value);
});
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
    case DisplayOptions.Original:
      if (displayMode.value != DisplayMode.ORIGINAL) query.value = await getQueryDisplay(DisplayMode.ORIGINAL);
      displayMode.value = DisplayMode.ORIGINAL;
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
  if (query.value && query.value.rule) {
    originalDisplay.value = DisplayMode.RULES;
  } else originalDisplay.value = DisplayMode.ORIGINAL;
  baseType.value = query!.value!.typeOf!;
  deepQuery.value = cloneDeep(query.value);
  displayMode.value = query.value?.rule ? DisplayMode.RULES : DisplayMode.LOGICAL;
  setDisplayOptions();
  if (originalDisplay.value === DisplayMode.RULES) selectedDisplayOption.value = DisplayOptions.RuleView;
  else selectedDisplayOption.value = DisplayOptions.Original;
  // if (isLoggedIn.value) {
  // hasPermissionQueryExecute.value = await CasbinService.hasPermission(Resource.QUERY, Action.EXECUTE);
  //}
  loading.value = false;
}

function setDisplayOptions() {
  if (originalDisplay.value == DisplayMode.RULES) {
    displayOptions.value = [DisplayOptions.RuleView, DisplayOptions.LogicalView, DisplayOptions.MySQL, DisplayOptions.PostreSQL];
  } else {
    displayOptions.value = [DisplayOptions.Original, DisplayOptions.RuleView, DisplayOptions.LogicalView, DisplayOptions.MySQL, DisplayOptions.PostreSQL];
  }
}

async function getQueryDisplay(displayMode: DisplayMode) {
  if (query.value?.iri) return await QueryService.getDisplayFromQueryIri(query.value.iri, displayMode);
  else if (query.value?.typeOf) {
    return await QueryService.getQueryDisplayFromQuery(query.value, displayMode);
  } else if (props.entityIri) return await QueryService.getDisplayFromQueryIri(props.entityIri, displayMode);
  return undefined;
}

async function getQueryRequestFromQueryIri() {
  if (query.value?.iri) {
    const queryDisplay = await QueryService.getDisplayFromQueryIri(query.value.iri, DisplayMode.LOGICAL);
    return { query: queryDisplay, argument: requestArguments.value };
  }
  return {} as QueryRequest;
}
</script>

<style scoped>
.rule-box {
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
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

.field {
  padding-right: 1rem;
}

.rec-query-display {
  padding: 1rem;
}
</style>
