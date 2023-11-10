<template>
  <div class="set-definition-container">
    <div class="ecl-container">
      <div class="text-copy-container">
        <div class="title-bar">
          <h2 v-if="shape.showTitle" class="title">{{ shape.name }}</h2>
          <h2 v-if="showRequired" class="required">*</h2>
        </div>
        <Textarea
          v-model="ecl"
          id="ecl-string-container"
          :placeholder="loading ? 'loading...' : 'Enter ECL text here...'"
          :class="[eclError && 'p-invalid', showValidation && invalid && 'invalid']"
          data-testid="ecl-string"
          :disabled="loading"
          @dragenter.prevent
          @dragover.prevent
          @drop="dropReceived($event)"
        />
      </div>
      <div class="button-container">
        <Button label="Import" @click="toggleMenuOptions" aria-haspopup="true" aria-controls="import_menu" />
        <Menu id="import_menu" ref="importMenu" :model="buttonOptions" :popup="true" />
        <Button :disabled="eclError" label="ECL builder" @click="showBuilder" severity="help" data-testid="builder-button" />
        <Button
          icon="fa-solid fa-copy"
          label="Copy to clipboard"
          v-clipboard:copy="copyToClipboard()"
          v-clipboard:success="onCopy"
          v-clipboard:error="onCopyError"
          data-testid="copy-to-clipboard-button"
        />
      </div>
    </div>
    <span class="error-message" v-if="eclError">{{ eclErrorMessage }}</span>
    <span class="error-message" v-if="validationErrorMessage">{{ validationErrorMessage }}</span>
  </div>
  <Builder :showDialog="showDialog" :eclString="ecl" @eclSubmitted="updateECL" @closeDialog="() => (showDialog = false)" @eclConversionError="updateError" />
  <AddByCodeList :showAddByFile="showAddByFileDialog" :showAddByList="showAddByCodeListDialog" @closeDialog="closeAddByDialog" @addCodeList="processCodeList" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch, Ref, PropType, inject, ComputedRef, computed } from "vue";
import Builder from "@/components/directory/topbar/eclSearch/Builder.vue";
import AddByCodeList from "./setDefinition/AddByCodeList.vue";
import { EditorMode } from "@im-library/enums";
import { EclService } from "@/services";
import _ from "lodash";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { PropertyShape, Query } from "@im-library/interfaces/AutoGen";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { ConceptSummary } from "@im-library/interfaces";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: string;
}

const props = defineProps<Props>();

const toast = useToast();

const importMenu = ref();

const ecl: Ref<string> = ref("");
// const eclNoNames = ref("");
const eclAsQuery: Ref<Query | undefined> = ref();
const showDialog = ref(false);
const showAddByCodeListDialog = ref(false);
const showAddByFileDialog = ref(false);
const eclError = ref(false);
const eclErrorMessage = ref("");
const loading = ref(false);
const showNames = ref(false);
const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const showValidation = ref(false);

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const deleteEntityKey = inject(injectionKeys.editorEntity)?.deleteEntityKey;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const valueVariableMap = inject(injectionKeys.valueVariableMap)?.valueVariableMap;
const valueVariableHasChanged = inject(injectionKeys.valueVariableMap)?.valueVariableHasChanged;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;
const updateValidationCheckStatus = inject(injectionKeys.forceValidation)?.updateValidationCheckStatus;
if (forceValidation) {
  watch(forceValidation, async () => {
    if (updateValidity) {
      await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
      if (updateValidationCheckStatus) updateValidationCheckStatus(key);
      showValidation.value = true;
    }
  });
}

if (props.shape.argument?.some(arg => arg.valueVariable) && valueVariableMap) {
  watch(
    () => _.cloneDeep(valueVariableMap),
    async (newValue, oldValue) => {
      if (valueVariableHasChanged && valueVariableHasChanged(props.shape, newValue, oldValue)) {
        if (updateValidity) {
          await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
          showValidation.value = true;
        }
      }
    }
  );
}

const showRequired: ComputedRef<boolean> = computed(() => {
  if (props.shape.minCount && props.shape.minCount > 0) return true;
  else return false;
});

const key = props.shape.path["@id"];
const buttonOptions = [
  { label: "From list", command: () => showAddByCodeList() },
  { label: "From file", command: () => showAddByFile() }
];

watch(
  () => props.value,
  async (newValue, oldValue) => {
    loading.value = true;
    if (newValue && newValue !== oldValue) ecl.value = await EclService.getECLFromQuery(JSON.parse(newValue));
    loading.value = false;
  }
);

watch(ecl, async newValue => {
  // eclNoNames.value = ecl.value.replace(/\|.*?\|/g, "").replace(/\s\s+/g, " ");
  if (await EclService.isValidECL(newValue)) {
    eclAsQuery.value = await EclService.getQueryFromECL(newValue);
  }
});

watch(
  () => _.cloneDeep(eclAsQuery.value),
  async () => {
    updateEntity();
    if (updateValidity && valueVariableMap) {
      await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
      showValidation.value = true;
    }
  }
);

onMounted(async () => {
  if (props.value) {
    loading.value = true;
    ecl.value = await EclService.getECLFromQuery(JSON.parse(props.value));
    loading.value = false;
  }
});

function toggleMenuOptions(event: any) {
  importMenu.value.toggle(event);
}

function showBuilder(): void {
  showDialog.value = true;
}

function showAddByCodeList(): void {
  showAddByCodeListDialog.value = true;
}

function showAddByFile(): void {
  showAddByFileDialog.value = true;
}

function closeAddByDialog(): void {
  showAddByCodeListDialog.value = false;
  showAddByFileDialog.value = false;
}

function processCodeList(data: ConceptSummary[]) {
  closeAddByDialog();
  if (isArrayHasLength(data)) {
    let arrayAsStrings = data.map(item => {
      let itemAsString = "";
      itemAsString += "<< ";
      itemAsString += item.code;
      if (item.name) itemAsString += " | " + item.name + " | ";
      return itemAsString;
    });
    ecl.value = arrayAsStrings.join(" AND ");
  }
}

function updateEntity() {
  if (entityUpdate) {
    const result = {} as any;
    result[key] = JSON.stringify(eclAsQuery.value);
    if (!eclAsQuery.value && deleteEntityKey) deleteEntityKey(key);
    else entityUpdate(result);
  }
}

async function updateECL(data: string): Promise<void> {
  const isValid = await EclService.isValidECL(data);
  if (isValid) ecl.value = data;
  showDialog.value = false;
}

function copyToClipboard(): string {
  return ecl.value;
}

function onCopy(): void {
  toast.add(new ToastOptions(ToastSeverity.SUCCESS, "Value copied to clipboard"));
}

function onCopyError(): void {
  toast.add(new ToastOptions(ToastSeverity.ERROR, "Value copied to clipboard"));
}

function updateError(errorUpdate: { error: boolean; message: string }): void {
  eclError.value = errorUpdate.error;
  eclErrorMessage.value = errorUpdate.message;
}

async function dropReceived(event: any) {
  const data = event.dataTransfer.getData("conceptIri");
  if (data) {
    ecl.value = JSON.parse(data);
  }
}
</script>

<style scoped>
.set-definition-container {
  height: 100%;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  padding: 1rem;
}

.ecl-container {
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
}

#ecl-string-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  flex-grow: 100;
}

.text-copy-container {
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  flex-flow: column;
  align-items: center;
  margin: 0 0 1rem 0;
}

Textarea {
  max-width: 90%;
  resize: none;
}

.button-container {
  display: flex;
  flex-flow: row;
  gap: 1rem;
  margin: 1rem 0 1rem 0;
}

.title-bar {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  gap: 0.25rem;
  width: 100%;
}

.required {
  color: var(--red-500);
}
</style>
