<template>
  <Dialog
    v-if="!eclConversionError.error"
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
    id="ecl-builder-dialog"
    :contentStyle="{ flexGrow: '100', display: 'flex' }"
    :auto-z-index="true"
  >
    <template #header>
      <div class="ecl-builder-dialog-header">
        <strong>ECL Builder:</strong>
        <Button icon="fa-regular fa-circle-question" text rounded @click="toggle" />
        <Popover ref="op">Select or drag and drop for grouping</Popover>
      </div>
    </template>
    <div id="builder-string-container">
      <div id="query-builder-container">
        <ProgressSpinner v-if="loading" />
        <ExpressionConstraint v-model:match="build" :rootBool="true" :index="0" :parentOperator="'and'" />

        <small style="color: red" v-if="!build.or && !build.and && !build.where && !build.instanceOf && !loading">
          *Move pointer over panel above to add concepts, refinements and groups.
        </small>
      </div>

      <div id="build-string-container">
        <Panel header="Output" toggleable collapsed>
          <div class="field-checkbox">
            <Checkbox inputId="includeTerms" v-model="includeTerms" :binary="true" />
            <label for="includeTerms">Include terms</label>
          </div>
          <div class="string-copy-container">
            <div v-if="eclStringError.error" class="output-string" style="color: red">Error generating ecl text. Please check your inputs are correct.</div>
            <div
              v-else-if="isObjectHasKeys(childLoadingState) && !Object.values(childLoadingState).every(item => item === true)"
              class="output-string"
              style="color: red"
            >
              <ProgressSpinner />
            </div>
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
      <Button label="Validate" severity="help" @click="validateBuild" :disabled="!isValidEcl" data-testid="ecl-validate-button" />
      <Button label="OK" icon="fa-solid fa-check" class="p-button-primary" @click="submit" :disabled="!isValidEcl" data-testid="ecl-ok-button" />
    </template>
  </Dialog>
</template>

<script lang="ts">
import LoadingDialog from "@/components/shared/dynamicDialogs/LoadingDialog.vue";
import { useDialog } from "primevue/usedialog";
import { deferred } from "@/helpers";
import Swal from "sweetalert2";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";
import { Match } from "@/interfaces/AutoGen";
</script>

<script setup lang="ts">
import { Ref, ref, watch, onMounted, provide, readonly } from "vue";
import { cloneDeep } from "lodash-es";
import EclService from "@/services/EclService";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import ExpressionConstraint from "@/components/directory/topbar/eclSearch/builder/ExpressionConstraint.vue";

interface Props {
  showDialog?: boolean;
  eclString?: string;
}
const props = defineProps<Props>();

const emit = defineEmits({
  eclSubmitted: (_payload: string) => true,
  eclConversionError: (_payload: { error: boolean; message: string }) => true,
  closeDialog: () => true
});

const dynamicDialog = useDialog();

const build: Ref<Match> = ref({});
const includeTerms = ref(true);
const forceValidation = ref(false);
const queryString = ref("");
const { copyToClipboard, onCopy, onCopyError } = setupCopyToClipboard(queryString);

const eclConversionError: Ref<{ error: boolean; message: string }> = ref({ error: false, message: "" });
const eclStringError: Ref<{ error: boolean; message: string }> = ref({ error: false, message: "" });
const loading = ref(false);
const isValidEcl = ref(false);
const isValid = ref(false);
const childLoadingState: Ref<any> = ref({});
watch(
  () => cloneDeep(childLoadingState.value),
  newValue => {
    if (Object.values(newValue).every(item => item === true)) generateQueryString();
  }
);

const wasDraggedAndDropped = ref(false);
provide("wasDraggedAndDropped", wasDraggedAndDropped);
const op = ref();
function toggle(event: any) {
  op.value.toggle(event);
}

watch(queryString, async () => {
  if (queryString.value) isValidEcl.value = await EclService.isValidECL(queryString.value);
  else isValidEcl.value = false;
});

provide("includeTerms", readonly(includeTerms));
provide("forceValidation", readonly(forceValidation));
provide("childLoadingState", childLoadingState);

onMounted(async () => {
  if (props.eclString) {
    await createBuildFromEclString(props.eclString);
  } else createDefaultBuild();
});

watch(
  () => props.eclString,
  async newValue => {
    if (newValue) await createBuildFromEclString(newValue);
    else createDefaultBuild();
  }
);

watch(
  () => cloneDeep(build.value),
  async () => {
    if (!loading.value && build.value) await generateQueryString();
  }
);

watch(includeTerms, async () => await generateQueryString());

function createDefaultBuild() {
  build.value = {};
}

async function createBuildFromEclString(ecl: string) {
  if (ecl === "") {
    createDefaultBuild();
    return;
  }
  try {
    loading.value = true;
    build.value = await EclService.getQueryFromECL(ecl, true);
    eclConversionError.value = { error: false, message: "" };
    createInitialLoadingState(build.value, 0, 0);
  } catch (err: any) {
    createDefaultBuild();
    if (err?.response?.data) eclConversionError.value = { error: true, message: err.response.data.debugMessage };
    else eclConversionError.value = { error: true, message: err.message };
  }
  emit("eclConversionError", eclConversionError.value);
  loading.value = false;
  await generateQueryString();
}

function submit(): void {
  emit("eclSubmitted", queryString.value);
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
        queryString.value = await EclService.getECLFromQuery(build.value, includeTerms.value);
        eclStringError.value = { error: false, message: "" };
      }
    } catch (err: any) {
      eclStringError.value = { error: true, message: err.message };
    }
  }
}

async function validateBuild() {
  const verificationDialog = dynamicDialog.open(LoadingDialog, {
    props: { modal: true, closable: false, closeOnEscape: false, style: { width: "50vw" } },
    data: { title: "Validating", text: "Running validation checks..." }
  });
  const validationBuild = generateValidation();
  forceValidation.value = true;
  const promises = validationBuild.map(v => v.validation.deferred.promise);
  const result = await Promise.allSettled(promises)
    .then(result => {
      return result.every(r => r.status === "fulfilled");
    })
    .catch(err => {
      verificationDialog.close();
      throw err;
    });
  if (result) {
    isValid.value = validationBuild.every(v => v.validation.valid);
    if (isValid.value) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "All entities are valid.",
        confirmButtonText: "Close",
        confirmButtonColor: "##2196F3"
      });
    } else {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Invalid values found. Please review your entries.",
        confirmButtonText: "Close",
        confirmButtonColor: "#689F38"
      });
    }
  } else {
    Swal.fire({
      icon: "error",
      title: "Timeout",
      text: "Validation timed out. Please contact an admin for support.",
      confirmButtonText: "Close",
      confirmButtonColor: "#689F38"
    });
  }
  forceValidation.value = false;
  verificationDialog.close();
}

function generateValidation(): any[] {
  const flattenedBuild: any[] = [];
  flattenBuild(build.value, flattenedBuild);
  return flattenedBuild;
}

function flattenBuild(build: any, flattenedBuild: any[]) {
  if (isArrayHasLength(build.items)) {
    build.items.forEach((item: any) => {
      if (item.type === "Refinement") {
        item.validation = { deferred: deferred(6000), valid: false };
        flattenedBuild.push(item);
      }
      flattenBuild(item, flattenedBuild);
    });
  } else if (isArrayHasLength(build.refinementItems)) {
    build.refinementItems.forEach((item: any) => {
      if (item.type === "Refinement") {
        item.validation = { deferred: deferred(6000), valid: false };
        flattenedBuild.push(item);
      }
      flattenBuild(item, flattenedBuild);
    });
  }
}

function createInitialLoadingState(initialBuild: any, depth: number, position: number) {
  if (initialBuild) {
    const id = depth + "-" + position;
    initialBuild.id = id;
    childLoadingState.value[id] = false;
    if (initialBuild.items?.length) {
      for (const [index, item] of initialBuild.items.entries()) {
        createInitialLoadingState(item, depth + 1, index);
      }
    } else if (initialBuild.type === "ExpressionConstraint") {
      if (initialBuild.conceptBool) {
        createInitialLoadingState(initialBuild.conceptBool, depth + 1, 1);
      }
      if (initialBuild.refinementItems) {
        for (const [index, item] of initialBuild.refinementItems.entries()) {
          createInitialLoadingState(item, depth + 1, index);
        }
      }
    }
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

#query-build {
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 1rem;
  flex: 1 1 auto;
  font-size: 12px;
  overflow: auto;
}

#query-build > .nested-div,
.nested-div-hover {
  min-width: calc(100% - 1rem);
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
  height: 10rem;
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

.nested-div {
  padding: 0.5rem;
  border: #488bc230 1px solid;
  border-radius: 5px;
  background-color: #488bc210;
  margin: 0.5rem;
}

.nested-div:deep(.hover-button) {
  color: #00000030 !important;
  border-style: dashed !important;
}

.nested-div-hover {
  padding: 0.5rem;
  border-radius: 5px;
  background-color: #488bc210;
  margin: 0.5rem;
  border: #488bc2 1px solid;
}
</style>
