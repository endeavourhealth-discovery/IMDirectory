<template>
  <ProgressSpinner v-if="loading" />
  <Dialog
    v-if="!eclConversionError.error && !loading"
    :visible="showDialog"
    :modal="true"
    :closable="false"
    :maximizable="true"
    :style="{
      minWidth: '90vw',
      minHeight: '90vh',
      display: 'flex',
      flexFlow: 'column nowrap'
    }"
    :contentStyle="{ flexGrow: '100', display: 'flex' }"
    :auto-z-index="true"
    id="ecl-builder-dialog"
  >
    <template #header>
      <div class="ecl-builder-dialog-header">
        <strong>ECL Builder:</strong>
        <Button icon="fa-regular fa-circle-question" text rounded-sm @click="toggle" />
        <Popover ref="op">Select or drag and drop for grouping</Popover>
      </div>
    </template>
    <div id="builder-string-container">
      <div v-if="!previewECL" id="query-builder-container">
        <ProgressSpinner v-if="loading" />
        <ExpressionConstraint
          v-else
          v-model:match="build"
          :rootBool="true"
          :index="0"
          :parentOperator="'and'"
          :activeInputId="activeInputId"
          @activateInput="activeInputId = $event"
          @rationalise="rationaliseBooleans"
        />
        <small style="color: red" v-if="!build.or && !build.and && !build.where && !build.is && !loading">
          *Move pointer over panel above to add concepts, refinements and groups.
        </small>
      </div>
      <div v-if="previewECL" id="build-string-container">
        <Panel header="Output">
          <div class="field-checkbox">
            <Checkbox inputId="includeTerms" v-model="includeTerms" :binary="true" />
            <label for="includeTerms">Include terms</label>
          </div>
          <div class="string-copy-container">
            <div v-if="eclStringError.error" class="output-string" style="color: red">Error generating ecl text. Please check your inputs are correct.</div>
            <pre v-else class="output-string">{{ queryString }}</pre>
            <Button
              icon="fa-solid fa-copy"
              v-tooltip.left="'Copy to clipboard'"
              v-clipboard:copy="copyToClipboard()"
              v-clipboard:success="onCopy"
              v-clipboard:error="onCopyError"
              :disabled="eclConversionError.error"
            />
          </div>
        </Panel>
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" icon="fa-solid fa-xmark" severity="secondary" @click="closeBuilderDialog" data-testid="cancel-ecl-builder-button" />
      <Button :label="!previewECL ? 'PreviewECL' : 'Show editor'" severity="info" @click="preview" data-testid="ecl-preview-button" />
      <Button label="Validate model" severity="help" @click="validateBuild" data-testid="ecl-validate-button" />
      <Button
        :disabled="Object.keys(build).length === 0"
        label="OK"
        icon="fa-solid fa-check"
        class="p-button-primary"
        @click="submit"
        data-testid="ecl-ok-button"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Ref, ref, watch, onMounted, provide, readonly, nextTick } from "vue";
import { cloneDeep } from "lodash-es";
import EclService from "@/services/EclService";
import QueryService from "@/services/QueryService";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import ExpressionConstraint from "@/components/directory/topbar/eclSearch/builder/ExpressionConstraint.vue";
import { useDialog } from "primevue/usedialog";
import Swal from "sweetalert2";
import { useCopyToClipboard } from "@/composables/useCopyToClipboard";
import { Match, ECLQueryRequest, Query } from "@/interfaces/AutoGen";
import { useEclValidator } from "@/composables/useEclValidator";
import GenericDialog from "@/components/shared/dynamicDialogs/GenericDialog.vue";
import { useDialogStore } from "@/stores/dialogStore";
interface Props {
  showDialog?: boolean;
  eclString?: string;
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

const activeInputId = ref("");
const build: Ref<Match> = ref({});
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
  if (props.eclString) {
    if (props.query) {
      await createBuildFromQuery(props.query);
    } else {
      const eclRequest = await EclService.getQueryFromECL(props.eclString, false);
      if (eclRequest.query) build.value = eclRequest.query;
    }
  } else createDefaultBuild();
  loading.value = false;
}
function createDefaultBuild() {
  build.value = {};
}
async function rationaliseBooleans() {
  build.value = await QueryService.flattenBooleans(build.value);
}

async function createBuildFromQuery(query: Query) {
  try {
    loading.value = true;
    const eclQuery = { query: query } as ECLQueryRequest;
    build.value = eclQuery.query!;
  } catch (err: any) {
    createDefaultBuild();
    if (err?.response?.data) eclConversionError.value = { error: true, message: err.response.data.debugMessage };
    else eclConversionError.value = { error: true, message: err.message };
  }
  emit("eclConversionError", eclConversionError.value);
  loading.value = false;
  await generateQueryString();
}

async function preview() {
  if (!previewECL.value) {
    const rationalised = await QueryService.optimiseECLQuery(build.value);
    const eclQuery = await EclService.getECLFromQuery(rationalised, includeTerms.value);
    queryString.value = eclQuery.ecl!;
  }
  previewECL.value = !previewECL.value;
}

async function submit(): Promise<void> {
  build.value = await QueryService.optimiseECLQuery(build.value);
  const eclQuery = await EclService.getECLFromQuery(build.value, props.showNames);
  emit("eclSubmitted", eclQuery);
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
  console.log(Object.keys(build.value).length);
  if (Object.keys(build.value).length) {
    const verificationDialog = showVerificationDialog(dynamicDialog);
    const eclQuery = await EclService.validateModelFromQuery(build.value);
    build.value = eclQuery.query!;
    verificationDialog.close();
    await displayValidationMessage(!eclQuery.status!.valid);
  } else {
    await dialogStore.open(GenericDialog, {
      props: { modal: true, style: { width: "30vw" }, closable: false },
      data: {
        icon: "fa-regular fa-circle-exclamation",
        title: "Validation failed",
        text: "ECL cannot be empty.",
        confirmButtonText: "Close"
      }
    });
  }
}

async function displayValidationMessage(invalid: boolean | undefined) {
  if (!invalid) {
    await dialogStore.open(GenericDialog, {
      props: { modal: true, style: { width: "30vw" }, closable: false },
      data: {
        icon: "fa-regular fa-circle-check",
        title: "Success",
        text: "All entities are valid.",
        confirmButtonText: "Close"
      }
    });
  } else {
    await dialogStore.open(GenericDialog, {
      props: { modal: true, style: { width: "30vw" }, closable: false },
      data: {
        icon: "fa-regular fa-circle-exclamation",
        title: "Warning",
        text: "Invalid values found. Please review your entries.",
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
