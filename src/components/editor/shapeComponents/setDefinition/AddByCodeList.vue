<template>
  <Dialog
    header="Add by list of codes"
    v-model:visible="showDialog"
    :maximizable="true"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    :style="{ width: '60vw' }"
    :closable="false"
  >
    <div class="add-dialog-container">
      <div v-if="showAddByFile" class="upload-container">
        <FileUpload
          name="demo[]"
          url="https://www.primefaces.org/upload.php"
          @upload="onAdvancedUpload"
          :multiple="true"
          accept=".csv, .tsv"
          :maxFileSize="1000000"
        >
          <template #content>
            <template v-for="file of uploadedFiles">
              <span>{{ file.name }} - {{ file.size }} bytes</span>
              <ul>
                <li v-for="row of file.data">{{ row }}</li>
              </ul>
            </template>
          </template>
          <template #empty>
            <p>Drag and drop files here to upload.</p>
          </template>
        </FileUpload>
        <Select v-if="isArrayHasLength(headers)" v-model="selectedColumn" :options="headers" option-label="label" placeholder="Select column" />
        <Button :loading="processing" :disabled="!isValidUpload" label="Process" class="process-button" @click="processUpload" />
      </div>
      <div v-else-if="showAddByList" class="code-list-container">
        <Textarea v-model="text" :autoResize="true" rows="5" cols="30" />
        <small id="code-list-help" class="p-error" v-if="invalidMessage">{{ invalidMessage }}</small>
        <Button :loading="processing" :disabled="!isValidText" label="Process" class="process-button" @click="processText" />
      </div>

      <DataTable class="code-list-result-table" v-if="showResultTable" :value="entities" responsiveLayout="scroll">
        <Column field="code" header="Code">
          <template #body="{ data }: { data: ValidatedEntity }"> {{ data.code }}</template>
        </Column>
        <Column field="name" header="Name">
          <template #body="{ data }: { data: ValidatedEntity }">{{ data.name ?? data.validationLabel }} </template>
        </Column>
        <Column field="validationCode" header="Code status">
          <template #body="{ data }: { data: ValidatedEntity }">
            <Tag :value="data.validationCode" :severity="getSeverity(data.validationCode)" :icon="getIcon(data.validationCode)" />
          </template>
        </Column>
      </DataTable>
    </div>
    <template #footer>
      <Button label="Cancel" icon="fa-solid fa-xmark" @click="closeDialog" class="p-button-text" />
      <Button label="Add valid codes" :disabled="!hasValidEntities" icon="fa-solid fa-plus" @click="add" autofocus />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ComputedRef, Ref, ref } from "vue";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { EntityService } from "@/services";
import * as d3 from "d3";
import { DSVRowArray } from "d3";
import { entityToAliasEntity } from "@/helpers/Transforms";
import { ValidatedEntity } from "@/interfaces";

interface Props {
  showAddByList: boolean;
  showAddByFile: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  addCodeList: [payload: any];
  closeDialog: [];
}>();

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
const entities: Ref<ValidatedEntity[]> = ref([]);
const showResultTable: Ref<boolean> = ref(false);
const showDialog = computed(() => props.showAddByList || props.showAddByFile);
const uploadedFiles: Ref<{ name: string; size: string; data: DSVRowArray<string> }[]> = ref([]);
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
  const firstObject = rowArray[0];
  if (firstObject) {
    for (const column of Object.keys(firstObject)) {
      headers.value.push({ label: column + " - e.g. " + firstObject[column], data: column });
    }
  }
  uploadedFiles.value.push({ name: file.name, size: file.size, data: rowArray });
}

function closeDialog() {
  entities.value = [];
  uploadedFiles.value = [];
  headers.value = [];
  selectedColumn.value = {} as { data: string; label: string };
  emit("closeDialog");
}

function add() {
  const validEntities = entities.value.filter(entity => entity.validationCode === CODE_STATUS.VALID);
  validEntities.forEach(entity => {
    entityToAliasEntity(entity);
    delete entity.validationCode;
  });
  emit("addCodeList", validEntities);
}

async function processText() {
  processing.value = true;
  invalidMessage.value = "";
  if (isValidText.value) {
    try {
      const codeList = getListFromText(text.value);
      if (codeList) entities.value = await getValidatedEntities(codeList);
      else invalidMessage.value = "Entered values are not valid.";
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
    const codeList: string[] = getListFromFile(uploadedFiles.value[0].data, selectedColumn.value.data);
    entities.value = await getValidatedEntities(codeList);
    if (isArrayHasLength(entities.value)) showResultTable.value = true;
  } catch (error) {
    if (error instanceof TextProcessingError) {
      invalidMessage.value = error.message;
    }
  }
  processing.value = false;
}

function getListFromFile(file: any, selectedColumn: string) {
  let codeList: string[] = [];
  const headers = [];
  for (const column of Object.keys(file[0])) {
    headers.push(column);
  }

  for (const row of file) {
    if (selectedColumn) {
      const rowArray = getListFromText(row[selectedColumn] as string);
      if (isArrayHasLength(rowArray)) codeList = codeList.concat(rowArray);
    } else {
      for (const key of headers) {
        const rowArray = getListFromText(row[key] as string);
        if (isArrayHasLength(rowArray)) codeList = codeList.concat(rowArray);
      }
    }
  }
  return codeList;
}

function getListFromText(text: string): string[] {
  const result = text.match(/\d+/g);
  return result?.filter(code => code.length >= 6) as string[];
}

function getSeverity(codeStatus?: string) {
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

function getIcon(codeStatus?: string) {
  switch (codeStatus) {
    case CODE_STATUS.VALID:
      return "fa-solid fa-check";
    case CODE_STATUS.DUPLICATE:
    case CODE_STATUS.CHILD:
      return "fa-solid fa-triangle-exclamation";
    case CODE_STATUS.INVALID:
      return "fa-solid fa-xmark";
    default:
      return "fa-solid fa-xmark";
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
  let hasValidOptions = false;
  if (hasOptions) hasValidOptions = entities.value.some(entity => entity.validationCode === CODE_STATUS.VALID);
  return hasOptions && hasValidOptions;
}
</script>

<style scoped>
.add-dialog-container {
  display: flex;
  flex-flow: column wrap;
  width: 100%;
}

.p-dialog-content {
  display: block;
  margin: auto;
}

.upload-container,
.code-list-container {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
}

#code-list-help {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
.code-list-result-table {
  padding-top: 1rem;
  width: 100%;
}
</style>
