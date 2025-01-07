<template>
  <div id="query-display" class="flex flex-1 flex-col">
    <div v-if="loading" class="flex flex-row"><ProgressSpinner /></div>
    <div v-else-if="!isObjectHasKeys(query)">No expression or query definition found.</div>
    <div v-else class="query-display-container flex flex-col gap-4">
      <div class="flex flex-row gap-2">
        <div v-if="showSqlButton"><Button label="Generate SQL" @click="generateSQL" data-testid="sql-button" /></div>
      </div>
      <div class="query-display">
        <div class="rec-query-display">
          <span v-if="query.name" v-html="query.name"> </span>
          <div v-if="query.typeOf">
            <span class="field" v-html="query.typeOf.name"></span>
            <span class="include-title text-green-500">with the following features</span>
          </div>
          <div v-if="isArrayHasLength(query.match)">
            <MatchSummaryDisplay
              v-for="(nestedQuery, index) of query.match"
              :match="nestedQuery"
              :expanded="false"
              :index="index"
              :operator="query.boolMatch"
            />
          </div>
          <div v-if="isArrayHasLength(query.where)">
            <RecursiveWhereDisplay
              v-for="(nestedWhere, index) in query.where"
              :where="nestedWhere"
              :depth="1"
              :index="index"
              :key="index"
              :operator="query.boolWhere"
              :expandedSet="false"
            />
          </div>
          <div v-if="query.function">
            <span class="field"> Function : {{ query.function?.name }}</span>
            <span v-if="isArrayHasLength(query.function?.argument)" v-for="param in query.function?.argument">
              <ul>
                <li class="tight-spacing">
                  <span class="argument">parameter :{{ param.parameter }}</span>
                  <span v-if="param.valueVariable" class="field"> :,argument: {{ param.valueVariable }}</span>
                </li>
              </ul>
            </span>
          </div>
          <div v-if="query.return">
            <ReturnColumns :select="query.return" :property-expanded="false" class="pl-8" />
          </div>
          <div v-if="isArrayHasLength(query.query)" class="pl-8">
            <Button :icon="!dataSetExpanded ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" text @click="toggle" />
            <span class="text-green-500">The cohort query has the following data set definition</span>
            <span v-if="dataSetExpanded">
              <RecursiveQueryDisplay v-for="nestedQuery of query.query" :query="nestedQuery" :match-expanded="false" :return-expanded="false" />
            </span>
          </div>
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
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import MatchSummaryDisplay from "@/components/query/viewer/MatchSummaryDisplay.vue";
import RecursiveQueryDisplay from "@/components/query/viewer/RecursiveQueryDisplay.vue";
import RecursiveWhereDisplay from "@/components/query/viewer/RecursiveWhereDisplay.vue";
import { QueryService } from "@/services";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { Query } from "@/interfaces/AutoGen";
import { onMounted, watch, Ref, ref, computed } from "vue";
import { useUserStore } from "@/stores/userStore";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";
import ReturnColumns from "@/components/query/viewer/ReturnColumns.vue";

interface Props {
  entityIri?: string;
  definition?: string;
  showSqlButton?: boolean;
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
  loading.value = true;
  if (props.entityIri) query.value = await QueryService.getDisplayFromQueryIri(props.entityIri, true);
  else if (props.definition) query.value = await QueryService.getDisplayFromQuery(JSON.parse(props.definition), true);
  loading.value = false;
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
</style>
