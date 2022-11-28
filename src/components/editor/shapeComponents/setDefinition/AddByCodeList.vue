<template>
  <Dialog
    header="Add by list of codes"
    v-model:visible="showAddByList"
    :maximizable="true"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    :style="{ width: '85vw' }"
    :closable="false"
  >
    <div class="code-list-container">
      <Textarea v-model="text" :autoResize="true" rows="5" cols="30" />
      <small id="code-list-help" class="p-error" v-if="invalidMessage">{{ invalidMessage }}</small>
      <Button :disabled="!isValidText" label="Process" class="process-button" @click="processText" />
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
import { isArrayHasLength } from "@/im_library/helpers/modules/DataTypeCheckers";
import { EntityService } from "@/im_library/services";
import { RDFS } from "@/im_library/vocabulary";

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
const hasValidEntities: ComputedRef<boolean> = computed(() => validateEntities());
const entities: Ref<any[]> = ref([]);
const showResultTable: Ref<boolean> = ref(false);
const props = defineProps({ showAddByList: { type: Boolean, required: true } });
const emit = defineEmits({ addCodeList: _payload => true, closeDialog: () => true });

function closeDialog() {
  emit("closeDialog");
}

function add() {
  const validEntities = entities.value.filter(entity => entity.statusCode === CODE_STATUS.VALID);
  emit(
    "addCodeList",
    validEntities.map(entity => {
      entity.name = entity[RDFS.LABEL];
      return entity;
    })
  );
}

async function processText() {
  invalidMessage.value = "";
  if (isValidText.value) {
    try {
      const codeList = getArrayFromText(text.value);
      entities.value = await getValidatedEntities(codeList);
      if (isArrayHasLength(entities.value)) showResultTable.value = true;
    } catch (error) {
      if (error instanceof TextProcessingError) {
        invalidMessage.value = error.message;
      }
    }
  }
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

function getArrayFromText(text: string): string[] {
  try {
    const result = text.match(/\d+/g);
    return result?.filter(code => code.length >= 10) as string[];
  } catch (error) {
    throw new TextProcessingError();
  }
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
