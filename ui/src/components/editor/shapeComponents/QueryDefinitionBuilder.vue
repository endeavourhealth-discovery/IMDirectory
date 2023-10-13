<template>
  <div id="cohort-query-definition-editor">
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>
    <div v-else class="content-container" :class="showValidation && invalid && 'invalid'">
      <div class="query-editor-container flex flex-column gap-3">
        <div class="query-editor flex flex-column p-2">
          <CohortEditor v-model:queryDefinition="queryDefinition" />
        </div>
        <div class="flex flex-row gap-2 justify-content-end">
          <div><Button label="Generate SQL" @click="generateSQL" data-testid="sql-button" /></div>
          <QuickQuery :query="queryDefinition">
            <template #button="{ runQuickQuery }">
              <Button icon="pi pi-bolt" label="Test query" severity="help" @click="runQuickQuery" />
            </template>
          </QuickQuery>
        </div>
      </div>
    </div>
    <span class="error-message" v-if="validationErrorMessage"> {{ validationErrorMessage }}</span>

    <Dialog header="SQL (Postgres)" :visible="showSql" :modal="true" :style="{ width: '80vw' }" @update:visible="showSql = false">
      <pre>{{ sql }}</pre>
      <template #footer>
        <Button label="Copy to Clipboard" @click="copy" data-testid="copy-button" />
        <Button label="Close" @click="showSql = false" data-testid="close-button" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import QuickQuery from "@/components/query/QuickQuery.vue";
import CohortEditor from "@/components/query/builder/CohortEditor.vue";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { EditorMode, ToastSeverity } from "@im-library/enums";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { Match, PropertyShape, Query } from "@im-library/interfaces/AutoGen";
import { IM } from "@im-library/vocabulary";
import { Ref, inject, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { cloneDeep } from "lodash";
import { QueryService } from "@/services";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@im-library/models";
import { generateMatchIds } from "@im-library/helpers/QueryBuilder";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: any;
}

const props = defineProps<Props>();

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;
const deleteEntityKey = inject(injectionKeys.editorEntity)?.deleteEntityKey;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const updateValidationCheckStatus = inject(injectionKeys.forceValidation)?.updateValidationCheckStatus;
const valueVariableMap = inject(injectionKeys.valueVariableMap)?.valueVariableMap;
if (forceValidation) {
  watch(forceValidation, async () => {
    if (updateValidity) {
      await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
      if (updateValidationCheckStatus) updateValidationCheckStatus(key);
      showValidation.value = true;
    }
  });
}
const toast = useToast();
const route = useRoute();
const loading = ref(true);
const queryDefinition: Ref<Query> = ref({ match: [] as Match[] } as Query);
const validationErrorMessage: Ref<string | undefined> = ref();
const invalid = ref(false);
const showValidation = ref(false);
const showSql: Ref<boolean> = ref(false);
const sql: Ref<string> = ref("");

const key = props.shape.path["@id"];

watch(
  () => cloneDeep(queryDefinition.value),
  async () => {
    updateEntity();
    if (updateValidity && valueVariableMap) {
      await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
      showValidation.value = true;
    }
  }
);

onMounted(async () => {
  loading.value = true;
  await init();
  loading.value = false;
});

async function init() {
  QueryService.getQueryDisplay;
  if (props.value) {
    const definition = JSON.parse(props.value);
    const labeledQuery = await QueryService.getLabeledQuery(definition);
    queryDefinition.value = generateMatchIds(labeledQuery);
  } else queryDefinition.value = generateDefaultQuery();
}
async function generateSQL() {
  // sql.value = await QueryService.generateQuerySQL(props.entityIri);
  showSql.value = true;
}

async function copy() {
  await navigator.clipboard.writeText(sql.value);
  toast.add(new ToastOptions(ToastSeverity.SUCCESS, "SQL copied to clipboard"));
}

function generateDefaultQuery() {
  return { match: [] as Match[] } as Query;
}

function updateEntity() {
  if (!isArrayHasLength(queryDefinition.value.match) && deleteEntityKey) deleteEntityKey(key);
  else {
    const imDefinition: any = {};
    imDefinition[IM.DEFINITION] = JSON.stringify(cloneDeep(queryDefinition.value));
    if (entityUpdate) entityUpdate(imDefinition);
  }
}
</script>

<style>
#cohort-query-definition-editor {
  height: 100%;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column;
}

.invalid {
  border-color: var(--red-500);
}

.validate-error {
  color: var(--red-500);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
}

.query-editor-container {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
}

.query-editor {
  height: 60vh;
  overflow-y: auto;
  border: 1px solid var(--surface-border);
  background-color: #ffffff;
}
</style>
