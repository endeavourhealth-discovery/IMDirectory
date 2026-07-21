<template>
  <div id="map-entry-builder">
    <div class="title-bar">
      <h2 v-if="shape.showTitle" class="title">{{ shape.name }}</h2>
      <h2 v-if="showRequired" class="required">*</h2>
    </div>
    <div :class="invalid && showValidation ? 'error-message' : ''">
      <span v-if="invalid && showValidation" class="error-message">{{ validationErrorMessage }}</span>
      <div v-if="!mapTypeIri" class="no-map-type">Select a map type to configure entries</div>
      <div v-else-if="loading" class="loading-container">
        <ProgressSpinner strokeWidth="8" />
      </div>
      <div v-else class="entries-container">
        <div v-for="(entry, index) in entries" :key="index" class="entry-card">
          <div class="entry-header">
            <label class="entry-number">Entry {{ index + 1 }}</label>
            <Button icon="fa-solid fa-trash" severity="danger" size="small" @click="deleteEntry(index)" />
          </div>
          <div class="entry-fields">
            <div v-if="isDirectMap || isRangeMap || isExactValueMap" class="field-group">
              <label>Source Entity</label>
              <AutocompleteSearchBar
                v-model:selected="entry[IM.SOURCE_ENTITY]"
                :im-query="entityQuery"
                :root-entities="[NAMESPACE.IM + 'QueryConceptSets']"
                search-placeholder="Search entity"
                @update:selected="updateEntry($event, entry, IM.SOURCE_ENTITY)"
              />
            </div>
            <div v-if="showSourceType" class="field-group">
              <label>Source Type</label>
              <AutocompleteSearchBar
                v-model:selected="entry[IM.SOURCE_TYPE]"
                :im-query="typeQuery"
                :root-entities="[NAMESPACE.IM + 'HealthRecords']"
                search-placeholder="Search type"
                @update:selected="updateEntry($event, entry, IM.SOURCE_TYPE)"
              />
            </div>
            <div v-if="showSourceProperty(entry)" class="field-group">
              <label>Source Property</label>
              <Select
                v-model="entry[IM.SOURCE_ENTITY_PROPERTY]"
                :class="invalid && showValidation && 'invalid'"
                :options="getPropertyOptions(entry)"
                class="entity-single-dropdown"
                data-testid="entity-single-dropdown"
                optionLabel="name"
              />
            </div>
            <div v-if="showRangeFrom" class="target-value">
              <label>Range From</label>
              <InputNumber v-model="entry[IM.RANGE_FROM]" />
            </div>
            <div v-if="showRangeTo" class="target-value">
              <label>Range To</label>
              <InputNumber v-model="entry[IM.RANGE_TO]" />
            </div>
            <div v-if="showSourceText" class="field-group">
              <label>Source Text</label>
              <InputText v-model="entry[IM.SOURCE_TEXT]" />
            </div>
            <div v-if="showSourceValue" class="target-value">
              <label>Source Value</label>
              <InputNumber v-model="entry[IM.SOURCE_VALUE]" />
            </div>
            <div v-if="isDirectMap || isRangeMap || isExactValueMap" class="target-text">
              <label>Target Text</label>
              <InputText v-model="entry[IM.TARGET_TEXT]" />
            </div>
            <div v-if="isDirectMap || isRangeMap || isExactValueMap" class="target-value">
              <label>Target Value</label>
              <InputNumber v-model="entry[IM.TARGET_VALUE]" />
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
  </div>
</template>

<script lang="ts" setup>
import { computed, ComputedRef, inject, onMounted, Ref, ref, watch } from "vue";

import { IM, NAMESPACE, SHACL } from "@endeavour/vue-library/enums";
import { isArrayHasLength, isObjectHasKeys } from "@endeavour/vue-library/helpers";
import type { ExtendedTTEntity, PropertyShape, QueryRequest } from "@endeavour/vue-library/interfaces";

import * as d3 from "d3";
import { cloneDeep, isEqual } from "lodash-es";
import Button from "primevue/button";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import ProgressSpinner from "primevue/progressspinner";

import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { EditorMode } from "@/enums";
import { getTypePropertyOptions } from "@/helpers/BuildSemanticMap";
import { flattenArray } from "@/helpers/UtilityMethods";
import injectionKeys from "@/injectionKeys/injectionKeys";

const props = defineProps<{
  shape: PropertyShape;
  mode: EditorMode;
  value?: any;
}>();

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const deleteEntityKey = inject(injectionKeys.editorEntity)?.deleteEntityKey;
const editorEntity = inject(injectionKeys.editorEntity)!.editorEntity;
const valueVariableMap = inject(injectionKeys.valueVariableMap)!.valueVariableMap;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const updateValidationCheckStatus = inject(injectionKeys.forceValidation)?.updateValidationCheckStatus;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;

if (forceValidation) {
  watch(forceValidation, async () => {
    if (updateValidity) {
      await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
      if (updateValidationCheckStatus) updateValidationCheckStatus(key);
      showValidation.value = true;
    }
  });
}

const key = props.shape.path.iri;
const showRequired: ComputedRef<boolean> = computed(() => !!(props.shape.minCount && props.shape.minCount > 0));

const entries: Ref<any[]> = ref([]);
const loading = ref(true);
const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const showValidation = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const mapTypeIri = computed(() => {
  if (editorEntity.value[IM.HAS_MAP_TYPE]) return editorEntity.value[IM.HAS_MAP_TYPE][0]?.iri;
  else return undefined;
});
const isDirectMap = computed(() => mapTypeIri.value === IM.DIRECT_MAP);
const isRangeMap = computed(() => mapTypeIri.value === IM.RANGE_VALUE_MAP);
const isExactValueMap = computed(() => mapTypeIri.value === IM.EXACT_VALUE_MAP);

const showSourceType = computed(() => isRangeMap.value || isExactValueMap.value);

const showRangeFrom = computed(() => isRangeMap.value);
const showRangeTo = computed(() => isRangeMap.value);
const showSourceText = computed(() => isExactValueMap.value);
const showSourceValue = computed(() => isExactValueMap.value);
const entityQuery: QueryRequest = {
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
};
const typeQuery: QueryRequest = {
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
};
const propertyOptions: Ref<Record<string, any[]>> = ref({});

watch(
  () => cloneDeep(props.value),
  (newValue, oldValue) => {
    if (!isEqual(newValue, oldValue)) processProps();
  }
);

watch(
  () => cloneDeep(entries.value),
  async () => {
    update();
    if (updateValidity) {
      await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
    }
  }
);

onMounted(async () => {
  await processProps();
});
function showSourceProperty(entry: any) {
  if (isDirectMap.value) return false;
  return !!entry[IM.SOURCE_TYPE];
}

function getValueForField(entry: any, fieldIri: string): any {
  const val = entry?.[fieldIri];
  if (val !== undefined && val !== null) return val;
  return undefined;
}

function getPropertyOptions(type: string): any[] {
  return propertyOptions.value[type];
}

function createEmptyEntry(): any {
  const entry: any = {};
  return entry;
}

async function processProps() {
  loading.value = true;
  if (editorEntity.value[IM.MAP_ENTRY]) {
    entries.value = [];
    for (const entry of editorEntity.value[IM.MAP_ENTRY]) {
      const mapEntry = flattenArray(entry);
      entries.value.push(mapEntry);
    }
    await processPropertyOptions();
    editorEntity.value[IM.MAP_ENTRY] = entries.value;
  }
  loading.value = false;
}

async function processPropertyOptions() {
  if (editorEntity.value[IM.MAP_ENTRY]) {
    for (const entry of editorEntity.value[IM.MAP_ENTRY]) {
      const mapEntry = flattenArray(entry);
      if (mapEntry[IM.SOURCE_TYPE]) {
        await createPropertyOptions(mapEntry);
      }
    }
  }
}

async function createPropertyOptions(mapEntry: any) {
  if (!propertyOptions.value[mapEntry[IM.SOURCE_TYPE].iri]) {
    propertyOptions.value[mapEntry[IM.SOURCE_TYPE].iri] = await getTypePropertyOptions(mapEntry[IM.SOURCE_TYPE].iri);
  }
}

async function updateEntry(val: any, entry: any, predicate: string) {
  entry[predicate] = { iri: val.iri, name: val.name };
  if (predicate === IM.SOURCE_TYPE) {
    await processPropertyOptions();
  }
}

function addEntry() {
  entries.value.push({});
}

function deleteEntry(index: number) {
  entries.value.splice(index, 1);
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

function updateEntity() {
  const data: ExtendedTTEntity = {};
  data[key] = entries.value;
  if (!isArrayHasLength(entries.value) && deleteEntityKey) {
    deleteEntityKey(key);
  } else if (entityUpdate) {
    entityUpdate(data);
  }
}
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

.no-map-type {
  padding: 1rem;
  font-style: italic;
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

.entry-fields {
  display: flex;
  flex-flow: row wrap;
  gap: 0.5rem;
  padding: 0 0.5rem 0.5rem 0.5rem;
}

.field-group {
  display: flex;
  flex-flow: column nowrap;
  flex: 1 1 200px;
  min-width: 30rem;
  gap: 0.25rem;
}
.target-value {
  display: flex;
  flex-flow: column nowrap;
  flex: 1 1 20px;
  max-width: 15%;
  gap: 0.25rem;
}
.target-value label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--p-text-muted-color);
}
.target-text {
  display: flex;
  flex-flow: column nowrap;
  flex: 1 1 20px;
  max-width: 25%;
  gap: 0.25rem;
}
.target-text label {
  font-size: 0.8rem;
  font-weight: 500;
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

.required {
  color: var(--p-red-500);
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
}
</style>
