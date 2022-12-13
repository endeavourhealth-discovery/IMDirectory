<template>
  <Dialog
    header="Add by list of codes"
    v-model:visible="showDialog"
    :maximizable="true"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    :style="{ width: '85vw' }"
    :closable="false"
  >
    <div v-if="showAddByFile" class="upload-container">
      <FileUpload
        name="demo[]"
        url="https://www.primefaces.org/upload.php"
        @upload="onAdvancedUpload"
        :multiple="true"
        accept=".csv, .txt"
        :maxFileSize="1000000"
      >
        <template #content>
          <ul v-if="uploadedFiles && uploadedFiles[0]">
            <li v-for="file of uploadedFiles[0]" :key="file">{{ file.name }} - {{ file.size }} bytes</li>
          </ul>
        </template>
        <template #empty>
          <p>Drag and drop files here to upload.</p>
        </template>
      </FileUpload>
      <Dropdown v-if="isArrayHasLength(headers)" v-model="selectedColumn" :options="headers" option-label="label" placeholder="Select column" />
      <Button :loading="processing" :disabled="!isValidUpload" label="Process" class="process-button" @click="processUpload" />
    </div>
    <div v-else-if="showAddByList" class="code-list-container">
      <Textarea v-model="text" :autoResize="true" rows="5" cols="30" />
      <small id="code-list-help" class="p-error" v-if="invalidMessage">{{ invalidMessage }}</small>
      <Button :loading="processing" :disabled="!isValidText" label="Process" class="process-button" @click="processText" />
    </div>

    <DataTable class="code-list-result-table" v-if="showResultTable" :value="entities" responsiveLayout="scroll">
      <Column field="code" header="Code">
        <template #body="{ data }"> {{ data["http://endhealth.info/im#code"] }}</template>
      </Column>
      <Column field="name" header="Name">
        <template #body="{ data }">{{ data["http://www.w3.org/2000/01/rdf-schema#label"] }} </template>
      </Column>
      <Column field="statusCode" header="Code status">
        <template #body="{ data }">
          <Tag :value="data.statusCode" :severity="getSeverity(data.statusCode)" :icon="getIcon(data.statusCode)" />
        </template>
      </Column>
    </DataTable>
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" @click="closeDialog" class="p-button-text" />
      <Button label="Add valid codes" :disabled="!hasValidEntities" icon="pi pi-plus" @click="add" autofocus />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ComputedRef, Ref, ref, watch } from "vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/modules/DataTypeCheckers";
import { EntityService } from "@/services";
import { RDFS } from "@im-library/vocabulary";
import * as d3 from "d3";
import { DSVRowArray } from "d3";

class TextProcessingError extends Error {
  constructor() {
    super("Text is invalid. Codes should be separated with '<space>' '\\n' or ','");
    Object.setPrototypeOf(this, TextProcessingError.prototype);
  }
}

enum CODE_STATUS {
  VALID = "Valid",
  CHILD = "Child",
  DUPLICATE = "Duplicate",
  INVALID = "Invalid"
}

const text = ref("");
const invalidMessage = ref("");
const isValidText: ComputedRef<boolean> = computed(() => validateText(text.value));
const isValidUpload: ComputedRef<boolean> = computed(() => validateUpload());
const hasValidEntities: ComputedRef<boolean> = computed(() => validateEntities());
const entities: Ref<any[]> = ref([]);
const showResultTable: Ref<boolean> = ref(false);
const props = defineProps({ showAddByList: { type: Boolean, required: true }, showAddByFile: { type: Boolean, required: true } });
const emit = defineEmits({ addCodeList: (_payload: any) => true, closeDialog: () => true });
const showDialog = computed(() => props.showAddByList || props.showAddByFile);
const uploadedFiles: Ref<DSVRowArray[]> = ref([]);
const headers: Ref<{ data: string; label: string }[]> = ref([]);
const selectedColumn: Ref<{ data: string; label: string }> = ref({} as { data: string; label: string });
const processing: Ref<boolean> = ref(false);

async function onAdvancedUpload(event: any) {
  headers.value = [];
  uploadedFiles.value = [];
  const file = event.files[0];
  const url = URL.createObjectURL(file);
  let rowArray: DSVRowArray = {} as DSVRowArray;
  if ((file.name as string).endsWith(".csv")) rowArray = await d3.csv(url);
  else if ((file.name as string).endsWith(".tsv")) rowArray = await d3.tsv(url);
  else {
    try {
      rowArray = await d3.csv(url);
    } catch (_error) {
      try {
        rowArray = await d3.tsv(url);
      } catch (_error) {
        throw new TextProcessingError();
      }
    }
  }

  const firstObject = rowArray[0];
  for (const column of Object.keys(firstObject)) {
    headers.value.push({ label: column + " - e.g. " + firstObject[column], data: column });
  }
  uploadedFiles.value.push(rowArray);
}

function closeDialog() {
  entities.value = [];
  uploadedFiles.value = [];
  headers.value = [];
  selectedColumn.value = {} as { data: string; label: string };
  emit("closeDialog");
}

function add() {
  const validEntities = entities.value.filter(entity => entity.statusCode === CODE_STATUS.VALID);
  console.log("filtered");
  const mapped = validEntities.map(entity => {
    entity.name = entity[RDFS.LABEL];
    return entity;
  });
  console.log(mapped);
  emit("addCodeList", mapped);
}

async function processText() {
  processing.value = true;
  invalidMessage.value = "";
  if (isValidText.value) {
    try {
      const codeList = await ParserService.getListFromText(text.value);
      entities.value = await getValidatedEntities(codeList);
      if (isArrayHasLength(entities.value)) showResultTable.value = true;
    } catch (error) {
      if (error instanceof TextProcessingError) {
        invalidMessage.value = error.message;
      }
    }
  }
  processing.value = false;
}

async function processUpload() {
  processing.value = true;
  try {
    const codeList: string[] = await ParserService.getListFromFile(uploadedFiles.value[0], selectedColumn.value.data);
    entities.value = await getValidatedEntities(codeList);
    if (isArrayHasLength(entities.value)) showResultTable.value = true;
  } catch (error) {
    if (error instanceof TextProcessingError) {
      invalidMessage.value = error.message;
    }
  }
  processing.value = false;
}

function getSeverity(codeStatus: string) {
  switch (codeStatus) {
    case CODE_STATUS.VALID:
      return "success";
    case CODE_STATUS.DUPLICATE:
    case CODE_STATUS.CHILD:
      return "warning";
    case CODE_STATUS.INVALID:
      return "danger";
    default:
      return "danger";
  }
}

function getIcon(codeStatus: string) {
  switch (codeStatus) {
    case CODE_STATUS.VALID:
      return "pi pi-check";
    case CODE_STATUS.DUPLICATE:
    case CODE_STATUS.CHILD:
      return "pi pi-exclamation-triangle";
    case CODE_STATUS.INVALID:
      return "pi pi-times";
    default:
      return "pi pi-times";
  }
}

function validateText(text: string): boolean {
  return (text && text.length) as unknown as boolean;
}

function validateUpload() {
  return isArrayHasLength(uploadedFiles.value);
}

async function getValidatedEntities(codeList: string[]) {
  return await EntityService.getValidatedEntitiesBySnomedCodes(codeList);
}

function validateEntities() {
  const hasOptions = isArrayHasLength(entities.value);
  const hasValidOptions = entities.value.some(entity => entity.statusCode === CODE_STATUS.VALID);
  return hasOptions && hasValidOptions;
}
</script>

<style scoped>
.upload-container,
.code-list-container {
  display: flex;
  flex-flow: column nowrap;
}

#code-list-help {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
.code-list-result-table {
  padding-top: 1rem;
}
</style>
