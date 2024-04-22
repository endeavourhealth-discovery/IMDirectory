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
    :auto-z-index="false"
  >
    <template #header>
      <div class="ecl-builder-dialog-header">
        <strong>ECL Builder:</strong>
        <Button icon="fa-regular fa-circle-question" text rounded @mouseover="toggle" @mouseout="toggle" />
        <OverlayPanel ref="op">Select or drag and drop for grouping</OverlayPanel>
      </div>
    </template>
    <div id="builder-string-container">
      <div id="query-builder-container">
        <div id="query-build">
          <ProgressSpinner v-if="loading" />
          <BoolGroup v-else :value="build" :rootBool="true" />
        </div>
        <small style="color: red" v-if="(!build.items || build.items.length == 0) && !loading">
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
            <pre class="output-string">{{ queryString }}</pre>
            <Button
              icon="fa-solid fa-copy"
              v-tooltip.left="'Copy to clipboard'"
              v-clipboard:copy="copyToClipboard()"
              v-clipboard:success="onCopy"
              v-clipboard:error="onCopyError"
            />
          </div>
        </Panel>
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" icon="fa-solid fa-xmark" severity="secondary" @click="closeBuilderDialog" />
      <Button label="Validate" severity="help" @click="validateBuild" :disabled="!isValidEcl" />
      <Button label="OK" icon="fa-solid fa-check" class="p-button-primary" @click="submit" :disabled="!isValidEcl" />
    </template>
  </Dialog>
</template>

<script lang="ts">
import BoolGroup from "./builder/BoolGroup.vue";
import ExpressionConstraint from "@/components/directory/topbar/eclSearch/builder/ExpressionConstraint.vue";
import Refinement from "@/components/directory/topbar/eclSearch/builder/Refinement.vue";
import LoadingDialog from "@/components/shared/dynamicDialogs/LoadingDialog.vue";
import { useDialog } from "primevue/usedialog";
import { deferred } from "@im-library/helpers";
import Swal from "sweetalert2";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";

export default defineComponent({
  components: { BoolGroup, ExpressionConstraint, Refinement }
});
</script>

<script setup lang="ts">
import { Ref, ref, watch, onMounted, provide, readonly, defineComponent } from "vue";
import _ from "lodash";
import EclService from "@/services/EclService";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

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

const build: Ref<any> = ref({ type: "BoolGroup", operator: "or" });
const includeTerms = ref(true);
const forceValidation = ref(false);
const queryString = ref("");
const { copyToClipboard, onCopy, onCopyError } = setupCopyToClipboard(queryString);

const eclConversionError: Ref<{ error: boolean; message: string }> = ref({ error: false, message: "" });
const loading = ref(false);
const isValidEcl = ref(false);
const isValid = ref(false);

const wasDraggedAndDropped = ref(false);
provide("wasDraggedAndDropped", wasDraggedAndDropped);
const op = ref();
function toggle(event: any) {
  op.value.toggle(event);
}

watch(queryString, async () => {
  isValidEcl.value = await EclService.isValidECL(queryString.value);
});

provide("includeTerms", readonly(includeTerms));
provide("forceValidation", readonly(forceValidation));

onMounted(async () => {
  if (props.eclString) {
    await createBuildFromEclString(props.eclString);
  } else createDefaultBuild();
});

watch(
  () => props.eclString,
  newValue => {
    if (newValue) createBuildFromEclString(newValue);
    else createDefaultBuild();
  }
);

watch(
  () => _.cloneDeep(build.value),
  () => {
    generateQueryString();
  }
);

watch(includeTerms, () => generateQueryString());

function createDefaultBuild() {
  build.value = { type: "BoolGroup", conjunction: "or" };
}

async function createBuildFromEclString(ecl: string) {
  try {
    loading.value = true;
    const query = await EclService.getQueryFromECL(ecl);
    build.value = await EclService.getEclBuilderFromQuery(query, true);
    eclConversionError.value = { error: false, message: "" };
  } catch (err: any) {
    createDefaultBuild();
    if (err?.response?.data) eclConversionError.value = { error: true, message: err.response.data.debugMessage };
    else eclConversionError.value = { error: true, message: err.message };
  }
  emit("eclConversionError", eclConversionError.value);
  loading.value = false;
}

function submit(): void {
  emit("eclSubmitted", queryString.value);
}

function closeBuilderDialog(): void {
  emit("closeDialog");
}

async function generateQueryString() {
  try {
    const query = await EclService.getQueryFromEclBuilder(build.value, true);
    queryString.value = await EclService.getECLFromQuery(query, includeTerms.value);
  } catch (err: any) {
    console.log("Errored");
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
  if (isArrayHasLength(build.items))
    build.items.forEach((item: any) => {
      if (item.type === "Refinement") {
        item.validation = { deferred: deferred(6000), valid: false };
        flattenedBuild.push(item);
      }
      flattenBuild(item, flattenedBuild);
    });
}
</script>

<style scoped>
#builder-string-container {
  flex: 1 1 auto;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
}

#query-builder-container {
  width: 100%;
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
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
  background-color: var(--surface-a);
  border: 1px solid var(--surface-border);
  border-radius: 3px;
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
</style>
