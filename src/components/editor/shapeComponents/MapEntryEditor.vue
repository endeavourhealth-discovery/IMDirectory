<template>
  <div id="map-entry-builder">
    <Dialog
      :draggable="false"
      :style="{ width: '90vw', height: '95vh', minWidth: '95vw', minHeight: '95vh' }"
      :visible="showEditor"
      closable
      maximizable
      modal
      @hide="cancel"
    >
      <template #default>
        <div class="title-bar">
          <h2 v-if="shape.showTitle" class="title">{{ shape.name }}</h2>
        </div>
        <div :class="invalid && showValidation ? 'error-message' : ''">
          <span v-if="invalid && showValidation" class="error-message">{{ validationErrorMessage }}</span>
          <div v-else-if="loading" class="loading-container">
            <ProgressSpinner strokeWidth="1" />
          </div>
          <div v-else class="entries-container">
            <div class="source-type">
              <label>Source Type</label>
              <AutocompleteSearchBar
                v-model:selected="sourceType as SearchResultSummary"
                :im-query="typeQuery"
                :root-entities="[NAMESPACE.IM + 'HealthRecords']"
                search-placeholder="Search entity"
                @update:selected="updateSourceType"
              />
            </div>
            <div class="source-property">
              <label>Source entity Property</label>
              <div class="select-property">
                <Select
                  v-model="sourceEntityProperty"
                  :options="propertyOptions"
                  class="w-full"
                  data-testid="entity-single-dropdown"
                  optionLabel="name"
                  @update:modelValue="updateSourceEntityProperty"
                >
                  <template #option="{ option }">
                    {{ option.name }}
                  </template>

                  <template #value="{ value }">
                    {{ value?.name ?? "Select a property" }}
                  </template>
                </Select>
              </div>
            </div>
            <div class="source-property">
              <label>Source value property (if range?)</label>
              <div class="select-property">
                <Select
                  v-model="sourceValueProperty"
                  :options="propertyOptions"
                  class="w-full"
                  data-testid="entity-single-dropdown"
                  optionLabel="name"
                  @update:modelValue="updateSourceValueProperty"
                >
                  <template #option="{ option }">
                    {{ option.name }}
                  </template>

                  <template #value="{ value }">
                    {{ value?.name ?? "Select a property" }}
                  </template>
                </Select>
              </div>
            </div>

            <div v-for="(entry, index) in entries" :key="index" class="entry-card">
              <div>
                <div class="entry-header">
                  <label class="entry-number">Entry {{ index + 1 }} : {{ entry.targetText }}</label>
                  <Button icon="fa-solid fa-trash" severity="danger" size="small" @click="deleteEntry(index)" />
                </div>
                <div class="entry-fields">
                  <div class="source-entity">
                    <label>Source Entity</label>

                    <AutocompleteSearchBar
                      v-model:selected="entry.sourceEntity as SearchResultSummary"
                      :im-query="entityQuery"
                      :root-entities="[NAMESPACE.IM + 'QueryConceptSets']"
                      search-placeholder="Search entity"
                      @update:selected="edited = true"
                    />
                  </div>
                  <div class="target-text">
                    <label>Target Text</label>
                    <InputText v-model="entry.targetText" @input="edited = true" />
                  </div>
                  <div class="target-text">
                    <label>Target Value</label>
                    <InputNumber v-model="entry.targetValue" @input="edited = true" />
                  </div>
                </div>
                <div class="entry-fields">
                  <div class="range-from">
                    <label>Range From</label>
                    <InputNumber v-model="entry.rangeFrom" @input="edited = true" />
                  </div>
                  <div class="range-to">
                    <label>Range To</label>
                    <InputNumber v-model="entry.rangeTo" @input="edited = true" />
                  </div>
                </div>
              </div>
            </div>
            <div class="action-bar">
              <Button icon="fa-solid fa-plus" label="Add Entry" severity="success" @click="addEntry" />
              <Button v-if="entries.length > 0" icon="fa-solid fa-times" label="Clear All" severity="danger" @click="clearEntries" />
              <Button icon="fa-solid fa-upload" label="Upload File" severity="info" @click="triggerUpload" />
              <input ref="fileInput" accept=".csv,.tab,.tsv,.txt" style="display: none" type="file" @change="handleFileUpload" />
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="button-footer">
          <Button data-testid="cancel-edit-feature-button" label="Cancel" text @click="cancel" />
          <Button v-if="edited" autofocus data-testid="save-feature-button" label="Save" @click="onSave" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import { Ref, inject, onMounted, ref } from "vue";

import { IM, NAMESPACE, SHACL } from "@endeavour/vue-library/enums";
import { isArrayHasLength, isObjectHasKeys } from "@endeavour/vue-library/helpers";
import { type PropertyShape, QueryRequest, QueryRequestSchema, SearchResultSummary, TTIriRef } from "@endeavour/vue-library/models";
import { useDialogStore } from "@endeavour/vue-library/stores";

import * as d3 from "d3";
import { cloneDeep, isArray } from "lodash-es";
import Button from "primevue/button";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import ProgressSpinner from "primevue/progressspinner";

import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { getTypePropertyOptions } from "@/helpers/BuildSemanticMap";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { type SemanticMapEntry } from "@/models";

const props = defineProps<{
  showEditor: boolean;
  shape: PropertyShape;
  originalEntries: SemanticMapEntry[];
}>();

const editorEntity = inject(injectionKeys.editorEntity)!.editorEntity;
const dialogStore = useDialogStore();
const sourceType: Ref<TTIriRef | undefined> = ref();
const sourceEntityProperty: Ref<TTIriRef | undefined> = ref();
const sourceValueProperty: Ref<TTIriRef | undefined> = ref();
const emit = defineEmits<{
  (event: "saveChanges", mapEntries: SemanticMapEntry[]): void;
  (event: "cancel"): void;
}>();

const loading = ref(true);
const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const showValidation = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const propertyOptions: Ref<TTIriRef[] | undefined> = ref();
const entries: Ref<SemanticMapEntry[]> = ref(cloneDeep(props.originalEntries));
const edited: Ref<boolean> = ref(false);

const entityQuery = {
  query: {
    and: [
      {
        typeOf: {
          iri: IM.CONCEPT_SET
        },
        where: {
          iri: IM.HAS_STATUS,
          is: [{ iri: IM.ACTIVE }, { iri: IM.DRAFT }]
        }
      }
    ]
  }
} as QueryRequest;
const typeQuery = {
  query: {
    and: [
      {
        typeOf: {
          iri: SHACL.NODESHAPE
        },
        where: {
          iri: IM.HAS_STATUS,
          is: [{ iri: IM.ACTIVE }, { iri: IM.DRAFT }]
        }
      }
    ]
  }
} as QueryRequest;

onMounted(async () => {
  await init();
});

function updateSourceType(val: any) {
  if (val) {
    editorEntity.value[IM.SOURCE_TYPE] = val;
    edited.value = true;
  }
}
function updateSourceEntityProperty(val: any) {
  if (val) {
    editorEntity.value[IM.SOURCE_ENTITY_PROPERTY] = val;
    edited.value = true;
  }
}

function updateSourceValueProperty(val: any) {
  if (val) {
    editorEntity.value[IM.SOURCE_VALUE_PROPERTY] = val;
    edited.value = true;
  }
}
function onSave() {
  edited.value = false;
  emit("saveChanges", entries.value);
}

async function init() {
  loading.value = true;
  if (isArray(editorEntity.value[IM.SOURCE_TYPE]) && editorEntity.value[IM.SOURCE_TYPE].length > 0) {
    sourceType.value = editorEntity.value[IM.SOURCE_TYPE][0];
  }
  if (isArray(editorEntity.value[IM.SOURCE_ENTITY_PROPERTY]) && editorEntity.value[IM.SOURCE_ENTITY_PROPERTY].length > 0) {
    sourceEntityProperty.value = editorEntity.value[IM.SOURCE_ENTITY_PROPERTY][0];
  }
  if (isArray(editorEntity.value[IM.SOURCE_VALUE_PROPERTY]) && editorEntity.value[IM.SOURCE_VALUE_PROPERTY].length > 0) {
    sourceEntityProperty.value = editorEntity.value[IM.SOURCE_VALUE_PROPERTY][0];
  }
  await processPropertyOptions();

  loading.value = false;
}

async function processPropertyOptions() {
  if (sourceType.value) {
    propertyOptions.value = await getTypePropertyOptions(sourceType.value.iri);
  }
}

function addEntry() {
  entries.value.push({ iri: editorEntity.value[IM.ID] + "_" + entries.value.length + 1, name: "new map entry" } as SemanticMapEntry);
}
function cancel() {
  edited.value = false;
  emit("cancel");
}

function deleteEntry(index: number) {
  entries.value.splice(index, 1);
  edited.value = true;
}

function clearEntries() {
  entries.value = [];
}

function triggerUpload() {
  fileInput.value?.click();
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const isTsv = file.name.endsWith(".tsv") || file.name.endsWith(".tab") || file.name.endsWith(".txt");
    const parsed = isTsv ? d3.tsvParse(text) : d3.csvParse(text);
    if (parsed.length === 0) return;
    const columns = Object.keys(parsed[0]);
    const matchedColumns: { col: string; iri: string }[] = [];
    for (const col of columns) {
      const iri = col.trim();
      if (iri) matchedColumns.push({ col, iri });
    }
    if (matchedColumns.length === 0) return;
    for (const row of parsed) {
      const entry: any = {};
      for (const match of matchedColumns) {
        const raw = row[match.col]?.trim();
        if (raw && raw.length > 0) {
          if (match.iri === IM.SOURCE_ENTITY || match.iri === IM.SOURCE_TYPE || match.iri === IM.SOURCE_ENTITY_PROPERTY) {
            entry[match.iri] = { iri: raw, name: raw };
          } else if (match.iri === IM.RANGE_FROM || match.iri === IM.RANGE_TO || match.iri === IM.SOURCE_VALUE || match.iri === IM.TARGET_VALUE) {
            const num = Number(raw);
            if (!isNaN(num)) entry[match.iri] = num;
          } else {
            entry[match.iri] = raw;
          }
        }
      }
      entries.value.push(entry);
    }
  } catch (err) {
    console.error("Failed to parse file:", err);
  }
  input.value = "";
}

function update() {
  validateEntity();
  updateEntity();
}

function validateEntity() {
  invalid.value = false;
  validationErrorMessage.value = undefined;
  if (!isArrayHasLength(entries.value)) return;
  for (const entry of entries.value) {
    if (!isObjectHasKeys(entry, [IM.SOURCE_ENTITY])) {
      invalid.value = true;
      validationErrorMessage.value = "Each entry must have a source entity.";
      return;
    }
    if (!isObjectHasKeys(entry[IM.SOURCE_ENTITY], ["iri"]) || !entry[IM.SOURCE_ENTITY].iri) {
      invalid.value = true;
      validationErrorMessage.value = "Source entity must be a valid entity selection.";
      return;
    }
  }
}

function updateEntity() {}
</script>

<style scoped>
span.error-message {
  color: red;
}

div.error-message {
  border: 1px solid red;
  border-radius: var(--p-textarea-border-radius);
}

#map-entry-builder h2 {
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  overflow: auto;
}
.range-from label {
  font-size: 1rem;
  font-weight: 500;
  padding-top: 0.5rem;
  padding-right: 0.5rem;
  color: var(--p-text-muted-color);
}
.range-to label {
  font-size: 1rem;
  font-weight: 500;
  padding-top: 0.5rem;
  padding-right: 0.5rem;
  color: var(--p-text-muted-color);
}

.entries-container {
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  overflow: auto;
  padding: 0.5rem;
  gap: 0.5rem;
}

.entry-card {
  border: #d2b33f30 1px solid;
  border-radius: var(--p-textarea-border-radius);
  background-color: #d2b33f10;
  padding: 0.5rem;
}

.entry-card:hover {
  border: #d2b33f 1px solid;
}

.entry-header {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.5rem 0.5rem 0.5rem;
}

.entry-number {
  font-weight: 600;
  font-size: 0.9rem;
}
.source-type {
  display: flex;
  flex-flow: row nowrap;
  width: 50%;
  gap: 0.5rem;
}
.source-type label {
  font-size: 1rem;
  font-weight: 500;
  padding-top: 0.5rem;
  color: var(--p-text-muted-color);
}
.source-entity {
  display: flex;
  flex-flow: row nowrap;
  min-width: 50rem;
  gap: 0.5rem;
  margin-right: 2rem;
}
.source-entity label {
  font-size: 1rem;
  font-weight: 500;
  padding-top: 0.5rem;
  color: var(--p-text-muted-color);
}
.source-property {
  display: flex;
  flex-flow: row nowrap;
  gap: 0.5rem;
  margin-right: 2rem;
}
.source-property label {
  font-size: 1rem;
  font-weight: 500;
  padding-top: 0.5rem;
  color: var(--p-text-muted-color);
}
.select-property {
  min-width: 20rem;
  gap: 0.5rem;
}
.select-property label {
  font-size: 1rem;
  font-weight: 500;
  padding-top: 0.5rem;
  color: var(--p-text-muted-color);
}

.entry-fields {
  display: flex;
  flex-flow: row wrap;
  gap: 0.5rem;
  padding: 0 0.5rem 0.5rem 0.5rem;
}

.target-text {
  display: flex;
  flex-flow: row nowrap;
  gap: 0.25rem;
  margin-right: 2rem;
}
.target-text label {
  font-size: 1rem;
  font-weight: 500;
  padding-top: 0.5rem;
  padding-right: 0.5rem;
  color: var(--p-text-muted-color);
}

.field-group label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--p-text-muted-color);
}

.action-bar {
  display: flex;
  flex-flow: row wrap;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.title-bar {
  display: flex;
  flex-flow: row nowrap;
  gap: 0.25rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
}
</style>
