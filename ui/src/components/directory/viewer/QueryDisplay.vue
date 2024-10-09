<template>
  <div id="query-display">
    <div v-if="!isObjectHasKeys(query)">No definition found.</div>
    <div v-else class="query-display-container flex flex-col gap-4">
      <div class="flex flex-row gap-2">
        <div v-if="showSqlButton"><Button label="Generate SQL" @click="generateSQL" data-testid="sql-button" /></div>
      </div>
      <div class="query-display">
        <div class="rec-query-display">
          <span v-if="query.name" v-html="query.name"> </span>
          <div v-if="query.typeOf">
            <span :class="'field'" v-html="query.typeOf.name"></span>
            <span class="include-title" style="color: green">with the following features</span>
          </div>
          <MatchSummaryDisplay
              v-if="isArrayHasLength(query.match)"
              v-for="(nestedQuery, index) of query.match"
              :match="nestedQuery"
              :expanded="false"
              />
          <div v-if="isArrayHasLength(query.query)"  style="padding-left: 2rem">
            <Button class="button-chevron" @click="toggle" >
              <IMFontAwesomeIcon
                  :icon="!dataSetExpanded ? ['fa-solid','fa-chevron-right'] :  ['fa-solid','fa-chevron-up']"
                  :style="'color: blue'"
                  class="mr-2"
                  fixed-width
              />
            </Button>
              <span style="color:green">The cohort query has the following data set definition</span>

            <span v-if="dataSetExpanded">

          <RecursiveQueryDisplay v-if="dataSetExpanded"
              v-for="(nestedQuery, index) of query.query"
              :query="nestedQuery"
              :match-expanded="false"
              :return-expanded="false"
          />
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
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import MatchSummaryDisplay from "@/components/query/viewer/MatchSummaryDisplay.vue";
import RecursiveQueryDisplay from "@/components/query/viewer/RecursiveQueryDisplay.vue";
import { QueryService } from "@/services";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Query} from "@im-library/interfaces/AutoGen";
import { onMounted, watch, Ref, ref, computed } from "vue";
import { useUserStore } from "@/stores/userStore";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";


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

const canTestQuery = computed(() => isLoggedIn.value && (currentUser.value?.roles?.includes("create") || currentUser.value?.roles?.includes("edit")));

const toggle = () => {
  dataSetExpanded.value= !dataSetExpanded.value;
};
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
  if (props.entityIri) query.value = await QueryService.getDisplayFromQueryIri(props.entityIri, true);
  else if (props.definition) query.value = await QueryService.getDisplayFromQuery(JSON.parse(props.definition), true);
}

async function generateSQL() {
  if (props.entityIri) sql.value = await QueryService.generateQuerySQL(props.entityIri);
  showSql.value = true;
}
</script>

<style scoped>

.button-chevron {
  background-color: transparent;
  border: none;
  cursor: pointer;
}
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
  padding-right : 1rem;
}

.rec-query-display {
  padding: 1rem;
}
</style>
