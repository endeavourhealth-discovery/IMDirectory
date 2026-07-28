<template>
  <ProgressSpinner v-if="loading" />
  <Dialog
    v-if="!eclConversionError.error && !loading"
    id="ecl-builder-dialog"
    :auto-z-index="true"
    :closable="false"
    :contentStyle="{ flexGrow: '100', display: 'flex' }"
    :maximizable="true"
    :modal="true"
    :style="{
      minWidth: '90vw',
      minHeight: '90vh',
      display: 'flex',
      flexFlow: 'column nowrap'
    }"
    :visible="showDialog"
  >
    <template #header>
      <div class="ecl-builder-dialog-header">
        <strong>ECL Builder:</strong>
        <Button icon="fa-regular fa-circle-question" rounded-sm text @click="toggle" />
        <Popover ref="op">Select or drag and drop for grouping</Popover>
      </div>
    </template>
    <div id="builder-string-container">
      <div v-if="!previewECL" id="query-builder-container">
        <ProgressSpinner v-if="loading" />
        <ECLExpressionConstraint v-model:match="build" :index="0" :parentIndex="0" :rootBool="true" @rationalise="rationaliseBooleans" />
        <div v-if="build.where">
          <span class="subtypes-checkbox">Include un-inferred subtypes of the concepts found in this expression </span>
          <Checkbox v-model="checkIncludeSubtypes" v-tooltip="'Select if subtypes are not needed'" :inputId="'subtypeCheck'" binary name="subtypeCheck" />
        </div>

        <small v-if="!build.or && !build.and && !build.where && !build.is && !loading" style="color: red">
          *Move pointer over panel above to add concepts, refinements and groups.
        </small>
      </div>
      <div v-if="previewECL" id="build-string-container">
        <Panel header="Output">
          <div class="field-checkbox">
            <Checkbox v-model="includeTerms" :binary="true" inputId="includeTerms" />
            <label for="includeTerms">Include terms</label>
          </div>
          <div class="string-copy-container">
            <div v-if="eclStringError.error" class="output-string" style="color: red">Error generating ecl text. Please check your inputs are correct.</div>
            <pre v-else class="output-string">{{ queryString }}</pre>
            <Button
              v-clipboard:copy="copyToClipboard()"
              v-clipboard:error="onCopyError"
              v-clipboard:success="onCopy"
              v-tooltip.left="'Copy to clipboard'"
              :disabled="eclConversionError.error"
              icon="fa-solid fa-copy"
            />
          </div>
        </Panel>
      </div>
    </div>
    <template #footer>
      <Button data-testid="cancel-ecl-builder-button" icon="fa-solid fa-xmark" label="Cancel" severity="secondary" @click="closeBuilderDialog" />
      <Button :label="!previewECL ? 'PreviewECL' : 'Show editor'" data-testid="ecl-preview-button" severity="info" @click="preview" />
      <Button data-testid="ecl-validate-button" label="Validate model" severity="help" @click="validateBuild" />
      <Button class="p-button-primary" data-testid="ecl-ok-button" icon="fa-solid fa-check" label="OK" @click="submit" />
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { Ref, onMounted, provide, readonly, ref, watch } from "vue";

import { useCopyToClipboard } from "@endeavour/vue-library/composables";
import { isObjectHasKeys } from "@endeavour/vue-library/helpers";
import { type ECLQueryRequest, type Query, QuerySchema } from "@endeavour/vue-library/models";

import { cloneDeep } from "lodash-es";
import { useDialog } from "primevue/usedialog";

import ECLExpressionConstraint from "@/components/imquery/ECLExpressionConstraint.vue";
import { useEclValidator } from "@/composables/useEclValidator";
import EclService from "@/services/EclService";
import QueryService from "@/services/QueryService";
import { useDialogStore } from "@/stores/dialogStore";

import AlertDialog from "../shared/dynamicDialogs/AlertDialog.vue";

interface Props {
  showDialog?: boolean;
  showNames?: boolean;
  query?: Query;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  eclSubmitted: [payload: ECLQueryRequest];
  eclConversionError: [payload: { error: boolean; message: string }];
  closeDialog: [];
}>();

const dialogStore = useDialogStore();
const checkIncludeSubtypes = ref(false);
const dynamicDialog = useDialog();
const activeInputId = ref("");
const build: Ref<Query> = ref({});
const includeTerms = ref(true);
const forceValidation = ref(false);
const queryString = ref("");
const { copyToClipboard, onCopy, onCopyError } = useCopyToClipboard(queryString);
const { showValidationMessage, showVerificationDialog } = useEclValidator();
const previewECL = ref(false);
const eclConversionError: Ref<{ error: boolean; message: string }> = ref({ error: false, message: "" });
const eclStringError: Ref<{ error: boolean; message: string }> = ref({ error: false, message: "" });
const loading = ref(true);
const childLoadingState: Ref<any> = ref({});
const wasDraggedAndDropped = ref(false);
const op = ref();
const group: Ref<number[]> = ref([]);
provide("wasDraggedAndDropped", wasDraggedAndDropped);
provide("includeTerms", readonly(includeTerms));
provide("forceValidation", readonly(forceValidation));
provide("childLoadingState", childLoadingState);

watch(
  () => cloneDeep(childLoadingState.value),
  async newValue => {
    if (Object.values(newValue).every(item => item === true)) await generateQueryString();
  }
);
watch(
  () => props.showDialog,
  val => {
    if (val) init();
  }
);

watch(includeTerms, async () => await generateQueryString());

onMounted(async () => {
  await init();
});

function toggle(event: any) {
  op.value.toggle(event);
}

async function init() {
  loading.value = true;
  if (props.query) {
    await createBuildFromQuery(props.query);
  } else createDefaultBuild();
  if (build.value?.is && build.value.is.match) {
    checkIncludeSubtypes.value = true;
    build.value = build.value.is.match;
  }
  loading.value = false;
}
function createDefaultBuild() {
  build.value = {};
}
async function rationaliseBooleans() {
  if (build.value) build.value = await QueryService.flattenBooleans(build.value);
}

async function createBuildFromQuery(query: Query) {
  build.value = cloneDeep(query!);
}

async function preview() {
  if (!previewECL.value && build.value) {
    let rationalised = await QueryService.optimiseECLQuery(QuerySchema.parse(build.value));
    rationalised = QuerySchema.parse(includeSubtypes(rationalised));
    const eclQuery = await EclService.getECLFromQuery(rationalised, includeTerms.value);
    queryString.value = eclQuery.ecl!;
  }
  previewECL.value = !previewECL.value;
}

function includeSubtypes(query: Query): Query {
  if (checkIncludeSubtypes.value) {
    return QuerySchema.parse({ is: { descendantsOrSelfOf: true, match: query } });
  } else return query;
}

async function submit(): Promise<void> {
  if (build.value) {
    build.value = await QueryService.optimiseECLQuery(QuerySchema.parse(build.value));
    const rationalised = includeSubtypes(build.value);
    const eclQuery = await EclService.getECLFromQuery(QuerySchema.parse(rationalised), props.showNames);
    if (eclQuery.status && !eclQuery.status.valid) {
      await displayValidationMessage(true, eclQuery.status.message);
    } else emit("eclSubmitted", eclQuery);
  }
}

function closeBuilderDialog(): void {
  emit("closeDialog");
}

async function generateQueryString() {
  if (!isObjectHasKeys(childLoadingState.value) || Object.values(childLoadingState.value).every(item => item === true)) {
    try {
      const buildClone = cloneDeep(build.value);
      stripIds(buildClone);
      stripValidation(buildClone);
      queryString.value = "";
      if (build.value && Object.keys(build.value).length > 0) {
        const eclQuery = await EclService.getECLFromQuery(build.value, includeTerms.value);
        queryString.value = eclQuery.ecl!;
        eclStringError.value = { error: false, message: "" };
      }
    } catch (err: any) {
      eclStringError.value = { error: true, message: err.message };
    }
  }
}

async function validateBuild() {
  const verificationDialog = showVerificationDialog(dynamicDialog);
  const eclQuery = await EclService.validateModelFromQuery(build.value);
  if (eclQuery.status && !eclQuery.status.valid) {
    verificationDialog.close();
    await displayValidationMessage(true, eclQuery.status.message);
  } else {
    build.value = eclQuery.query!;
    verificationDialog.close();
    await displayValidationMessage(!eclQuery.status!.valid);
  }
}

async function displayValidationMessage(invalid: boolean | undefined, message?: string) {
  if (!invalid) {
    await dialogStore.open(AlertDialog, {
      props: { modal: true, style: { width: "30vw" }, closable: false },
      data: {
        icon: "fa-regular fa-circle-check",
        title: "Success",
        text: "All entities are valid.",
        confirmButtonText: "Close"
      }
    });
  } else {
    await dialogStore.open(AlertDialog, {
      props: { modal: true, style: { width: "30vw" }, closable: false },
      data: {
        icon: "fa-regular fa-circle-exclamation",
        title: "Warning",
        text: message ? message : "Invalid values found. Please review your entries.",
        confirmButtonText: "Close"
      }
    });
  }
}

function stripIds(idBuild: any) {
  if (idBuild) {
    delete idBuild.id;
    if (idBuild.items?.length) {
      for (const [index, item] of idBuild.items.entries()) {
        stripIds(item);
      }
    } else if (idBuild.type === "ExpressionConstraint") {
      if (idBuild.conceptBool) {
        stripIds(idBuild.conceptBool);
      }
      if (idBuild.refinementItems) {
        for (const [index, item] of idBuild.refinementItems.entries()) {
          stripIds(item);
        }
      }
    }
  }
}

function stripValidation(build: any) {
  delete build.validation;
  if (build.items?.length) {
    for (const item of build.items) {
      stripValidation(item);
    }
  } else if (build.refinementItems?.length) {
    for (const item of build.refinementItems) {
      stripValidation(item);
    }
  }
}
</script>

<style scoped>
.swal2-container {
  z-index: 3000 !important;
}
#ecl-builder-dialog {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

#builder-string-container {
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
}

#query-builder-container {
  width: 100%;
  height: 100%; /* ← ADD THIS */
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  overflow: auto;
}

#build-string-container {
  width: 100%;
  flex: 0 1 auto;
  display: flex;
  flex-flow: column nowrap;
}

.output-string {
  background-color: var(--p-content-background);
  border: 1px solid var(--p-textarea-border-color);
  border-radius: var(--p-textarea-border-radius);
  padding: 1rem;
  margin: 0;
  height: 100%;
  flex-grow: 100;
  overflow-y: auto;
  tab-size: 4;
}

.string-copy-container {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.ecl-builder-dialog-header {
  display: flex;
  flex-flow: row;
  align-items: baseline;
  justify-content: space-between;
  font-size: larger;
}
</style>
