<template>
  <div class="set-definition-container">
    <div class="ecl-container">
      <div class="text-copy-container">
        <div id="definition-panel-container">
          <Tabs value="0" class="ecl-tabview">
            <TabList>
              <Tab value="0">ECL</Tab>
              <Tab value="1">Display</Tab>
            </TabList>
            <TabPanels>
              <TabPanel value="0">
                <div class="ecl-panel">
                  <div class="ecl-container">
                    <div class="html-preview" v-html="highlightedText" ref="highlightDiv" />
                    <Textarea
                      class="transparent-textarea"
                      ref="textarea"
                      v-model="ecl"
                      id="ecl-string-container"
                      :placeholder="loading ? 'loading...' : 'Enter ECL text here...'"
                      data-testid="ecl-string"
                      :disabled="loading"
                      @dragenter.prevent
                      @dragover.prevent
                      @drop="dropReceived($event)"
                    />
                  </div>
                  <div v-if="!eclError" class="show-names-container">
                    <label for="">Show names</label>
                    <Checkbox v-model="showNames" :binary="true" />
                  </div>
                  <div class="error-message" v-if="eclError">
                    Invalid ECL : line {{ eclStatus.line }}, offset {{ eclStatus.offset }} -> {{ eclStatus.message }}
                  </div>
                </div>
              </TabPanel>
              <TabPanel value="1">
                <QueryDisplay :definition="value" />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </div>
      <div class="button-container">
        <Button label="Import" @click="toggleMenuOptions" aria-haspopup="true" aria-controls="import_menu" />
        <Menu id="import_menu" ref="importMenu" :model="buttonOptions" :popup="true" />
        <Button label="Set builder" @click="showBuilder" severity="help" data-testid="builder-button" :loading="loading" />
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

    <ECLBuilder :showDialog="showDialog" :eclString="lastValidEcl" :showNames="showNames" @eclSubmitted="updateECL" @closeDialog="() => (showDialog = false)" />

    <AddByCodeList
      :showAddByFile="showAddByFileDialog"
      :showAddByList="showAddByCodeListDialog"
      @closeDialog="closeAddByDialog"
      @addCodeList="processCodeList"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, inject, nextTick, onMounted, ref, Ref, watch } from "vue";
import ECLBuilder from "@/components/directory/topbar/eclSearch/ECLBuilder.vue";
import AddByCodeList from "./setDefinition/AddByCodeList.vue";
import { EditorMode } from "@/enums";
import { EclService } from "@/services";
import { cloneDeep, isEqual } from "lodash-es";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { Match, ECLStatus, PropertyShape, SearchResultSummary } from "@/interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import QueryDisplay from "@/components/directory/viewer/QueryDisplay.vue";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: string;
}

const props = defineProps<Props>();

const importMenu = ref();

const ecl: Ref<string> = ref("");
const { copyToClipboard, onCopy, onCopyError } = setupCopyToClipboard(ecl);
const showDialog = ref(false);
const showAddByCodeListDialog = ref(false);
const showAddByFileDialog = ref(false);
const loading = ref(false);
const showNames = ref(false);
const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const showValidation = ref(false);
const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const deleteEntityKey = inject(injectionKeys.editorEntity)?.deleteEntityKey;
const editorEntity = inject(injectionKeys.editorEntity)!.editorEntity;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const valueVariableMap = inject(injectionKeys.valueVariableMap)!.valueVariableMap;
const valueVariableHasChanged = inject(injectionKeys.valueVariableMap)?.valueVariableHasChanged;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;
const updateValidationCheckStatus = inject(injectionKeys.forceValidation)?.updateValidationCheckStatus;
const textarea = ref<HTMLTextAreaElement | null>(null);
const highlightDiv = ref<HTMLDivElement | null>(null);
const eclStatus: Ref<ECLStatus> = ref({ valid: true, message: "" });
const lastValidEcl: Ref<string> = ref("");
const eclError = computed(() => {
  return !eclStatus.value.valid;
});
const highlightedText = computed(() => {
  const lines = ecl.value.split("\n");
  if (eclStatus.value && eclStatus.value.line) {
    const lineIndex = eclStatus.value.line! - 1;
    const offset = eclStatus.value.offset!;
    if (lines[lineIndex] && offset < lines[lineIndex].length) {
      const line = lines[lineIndex];
      lines[lineIndex] = line.slice(0, offset) + '<span class="error-char">' + line[offset] + "</span>" + line.slice(offset + 1);
    }
  }
  return lines.map(line => line || "&nbsp;").join("<br/>");
});

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
    () => cloneDeep(valueVariableMap),
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

const key = props.shape.path.iri;
const buttonOptions = [
  { label: "From list", command: () => showAddByCodeList() },
  { label: "From file", command: () => showAddByFile() }
];

const debounceTimer = ref(0);
watch(ecl, newValue => {
  clearTimeout(debounceTimer.value);
  debounceTimer.value = window.setTimeout(async (): Promise<void> => {
    eclStatus.value = await EclService.validateECL(newValue);
    if (eclStatus.value.valid) lastValidEcl.value = newValue;
  }, 600);
});

watch(showNames, async newValue => {
  if (props.value && !eclError.value) {
    loading.value = true;
    if (newValue) {
      ecl.value = await EclService.getEclFromEcl(ecl.value, true);
    } else ecl.value = await EclService.getEclFromEcl(ecl.value, false);
    loading.value = false;
  }
});

onMounted(async () => {
  loading.value = true;
  await processProps();
  loading.value = false;
});
async function processProps() {
  if (props.value) {
    ecl.value = await EclService.getECLFromQuery(JSON.parse(props.value), showNames.value);
    lastValidEcl.value = ecl.value;
  }
}

function toggleMenuOptions(event: MouseEvent) {
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

function processCodeList(data: SearchResultSummary[]) {
  closeAddByDialog();
  if (isArrayHasLength(data)) {
    let arrayAsStrings = data.map(item => {
      let itemAsString = "";
      itemAsString += "<< ";
      itemAsString += item.code;
      if (item.name) itemAsString += " | " + item.name + " | ";
      return itemAsString;
    });
    ecl.value = arrayAsStrings.join(" OR ");
  }
}

async function updateECL(data: string): Promise<void> {
  const eclStatus = await EclService.validateECL(data);
  if (eclStatus.valid) ecl.value = data;
  showDialog.value = false;
}

function dropReceived(event: DragEvent) {
  const data = event.dataTransfer?.getData("conceptIri");
  if (data) {
    ecl.value = JSON.parse(data);
  }
}
</script>

<style scoped>
.error-message {
  color: var(--p-red-500);
}
:deep(.error-char) {
  text-decoration: underline red wavy;
}
.set-definition-container {
  height: 100%;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
}

#ecl-string-container {
  width: 100%;
  flex: 1 1 auto;
  overflow: auto;
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
  color: var(--p-red-500);
}

#definition-panel-container:deep(.p-tabview-panels) {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}

#definition-panel-container:deep(.p-tabview-panel) {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}

#definition-panel-container {
  height: 100%;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
}

#definition-panel-container:deep(.p-tabview) {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
}

.subsets-panel:deep(.p-panel-header) {
  background: var(--p-content-background);
}

.ecl-tabview {
  border: 1px solid var(--p-textarea-border-color);
}

.ecl-panel {
  flex: 1 1 auto;
  min-height: 30rem;
  display: flex;
  flex-flow: column nowrap;
  gap: 0.5rem;
  font-size: 1rem;
}

.ecl-container {
  position: relative;
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
}

.transparent-textarea {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  background: transparent !important;
  resize: none;
  font-family: inherit;
  font-size: inherit;
  overflow: auto;
}

.html-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
  pointer-events: none;
  font-family: inherit;
  font-size: inherit;
  padding: 0.5rem;
  border: 1px solid transparent;
  box-sizing: border-box;
  color: transparent;
}
</style>
