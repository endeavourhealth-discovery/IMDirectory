<template>
  <div id="cohort-query-definition-editor">
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>
    <div v-else :class="showValidation && invalid && 'invalid'" class="content-container">
      <div id="editor-button-bar" class="button-bar">
        <Button data-testid="edit-button" icon="fa-solid fa-pen-to-square" label="Edit Query" @click="showBuilder" />
      </div>
      <div class="query-editor-container flex flex-col gap-4">
        <div class="query-editor flex flex-col p-2">
          <QueryDisplay :entiryIri="iri" :showSqlButton="false" :queryDefinition="queryDefinition" :editMode="true" />
        </div>
      </div>
    </div>
    <div class="validate-error-container"></div>
    <span v-if="validationErrorMessage && showValidation" class="validate-error"> {{ validationErrorMessage }}</span>

    <Dialog :modal="true" :style="{ width: '80vw' }" :visible="showSql" header="SQL (Postgres)" @update:visible="showSql = false">
      <pre>{{ sql }}</pre>
      <template #footer>
        <Button
          v-clipboard:copy="copyToClipboard()"
          v-clipboard:error="onCopyError"
          v-clipboard:success="onCopy"
          v-tooltip.left="'Copy to clipboard'"
          data-testid="copy-button"
          label="Copy to Clipboard"
        ></Button>
        <Button data-testid="close-button" label="Close" @click="showSql = false" />
      </template>
    </Dialog>
  </div>
  <div>
  <CohortEditor
    v-if="showEditor"
    :showDialog="showEditor"
    v-model:query="queryDefinition"
    @closeDialog="showEditor = false"
  />
  </div>
</template>

<script lang="ts" setup>
import injectionKeys from "@/injectionKeys/injectionKeys";
import { EditorMode } from "@/enums";
import { DisplayMode, PropertyShape, Query } from "@/interfaces/AutoGen";
import { IM } from "@/vocabulary";
import { inject, onMounted, Ref, ref, watch } from "vue";
import { cloneDeep } from "lodash-es";
import { QueryService } from "@/services";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";
import QueryDisplay from "@/components/directory/viewer/QueryDisplay.vue";

import CohortEditor from "@/components/imquery/CohortEditor.vue";

interface Props {
  mode: EditorMode;
  shape: PropertyShape;
  value?: any;
}

const props = defineProps<Props>();

const iri = "http://endhealth.info/im#CohortDefinition";
const showEditor = ref(false);
const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const editorEntity = inject(injectionKeys.editorEntity)!.editorEntity;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;
const deleteEntityKey = inject(injectionKeys.editorEntity)?.deleteEntityKey;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const updateValidationCheckStatus = inject(injectionKeys.forceValidation)?.updateValidationCheckStatus;
const valueVariableMap = inject(injectionKeys.valueVariableMap)!.valueVariableMap;
if (forceValidation) {
  watch(forceValidation, async () => {
    if (updateValidity) {
      await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
      if (updateValidationCheckStatus) updateValidationCheckStatus(key);
      showValidation.value = true;
    }
  });
}
const loading = ref(true);
const queryDefinition: Ref<Query | undefined> = ref();
const validationErrorMessage: Ref<string | undefined> = ref();
const invalid = ref(false);
const showValidation = ref(false);
const showSql: Ref<boolean> = ref(false);
const sql: Ref<string> = ref("");
const { copyToClipboard, onCopy, onCopyError } = setupCopyToClipboard(sql);

const key = props.shape.path.iri;

watch(
  () => cloneDeep(queryDefinition.value),
  async newValue => {
    updateEntity();
    if (updateValidity && valueVariableMap) {
      if (newValue) await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
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
  if (props.value) {
    const definition = JSON.parse(props.value);
    const labeledQuery = await QueryService.getQueryDisplayFromQuery(definition, DisplayMode.ORIGINAL);
    queryDefinition.value = labeledQuery;
  } else {
    queryDefinition.value = await generateDefaultQuery();
  }
}

async function generateDefaultQuery() {
  return await QueryService.getDefaultQuery();
}

function showBuilder(): void {
  showEditor.value = true;
}

function updateEntity() {
  if (queryDefinition.value && deleteEntityKey) deleteEntityKey(key);
  else {
    const imDefinition: any = {};
    imDefinition[IM.DEFINITION] = JSON.stringify(cloneDeep(queryDefinition.value));
    if (entityUpdate) entityUpdate(imDefinition);
  }
}
</script>

<style scoped>
.validate-error {
  color: var(--p-red-500);
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
  overflow-y: auto;
  border: 1px solid;
  background-color: var(--p-default);
  border-radius: var(--p-content-border-radius);
}

.validate-error {
  color: var(--p-red-500);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
}

.invalid {
  border: 1px solid var(--p-red-500);
  border-radius: 5px;
  padding: 0.25rem;
}

.validate-error-container {
  width: 100%;
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
