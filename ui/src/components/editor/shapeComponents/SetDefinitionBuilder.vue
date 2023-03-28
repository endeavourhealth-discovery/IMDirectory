<template>
  <div class="set-definition-container">
    <div class="ecl-container">
      <div class="text-copy-container">
        <!-- <div class="field-checkbox">
          <Checkbox inputId="showNames" v-model="showNames" :binary="true" />
          <label for="showNames">Show names</label>
        </div> -->
        <Textarea
          v-model="ecl"
          id="ecl-string-container"
          :placeholder="loading ? 'loading...' : 'Enter ECL text here...'"
          :class="eclError ? 'p-invalid' : ''"
          data-testid="ecl-string"
          :disabled="loading"
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
  </div>
  <Builder
    :showDialog="showDialog"
    :eclString="ecl"
    @eclSubmitted="updateECL"
    @closeDialog="() => (showDialog = false)"
    @eclConversionError="updateError"
  />
  <AddByCodeList :showAddByFile="showAddByFileDialog" :showAddByList="showAddByCodeListDialog" @closeDialog="closeAddByDialog" @addCodeList="processCodeList" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch, Ref, PropType, inject } from "vue";
import Builder from "@/components/directory/topbar/eclSearch/Builder.vue";
import AddByCodeList from "./setDefinition/AddByCodeList.vue";
import { EditorMode } from "@im-library/enums";
import { EclService } from "@/services";
import _ from "lodash";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { PropertyGroup, Query, TTAlias } from "@im-library/interfaces/AutoGen";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { ConceptSummary } from "@im-library/interfaces";

const props = defineProps({
  shape: { type: Object as PropType<PropertyGroup>, required: true },
  mode: { type: String as PropType<EditorMode>, required: true },
  value: { type: String, required: false }
});

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

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const validityUpdate = inject(injectionKeys.editorValidity)?.updateValidity;

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
  loading.value = true;
  if (await EclService.isValidECL(newValue)) {
    eclAsQuery.value = await EclService.getQueryFromECL(newValue);
  }
  loading.value = false;
});

watch(
  () => _.cloneDeep(eclAsQuery.value),
  async () => {
    updateEntity();
    updateValidity();
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

async function updateValidity() {
  if (validityUpdate) {
    validityUpdate({ key: key, valid: true });
  }
}

function updateEntity() {
  if (entityUpdate) {
    const result = {} as any;
    result[key] = JSON.stringify(eclAsQuery.value);
    entityUpdate(result);
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

.button-container {
  display: flex;
  flex-flow: row;
  gap: 1rem;
  margin: 1rem 0 1rem 0;
}
</style>
