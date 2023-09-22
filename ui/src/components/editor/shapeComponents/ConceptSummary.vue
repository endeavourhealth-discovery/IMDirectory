<template>
  <div class="entity-combobox-container">
    <label for="chip-group">Type</label>
    <div class="multiselect-loading-container">
      <div id="chip-group" class="chip-group">
        <Chip v-if="true" :label="conceptType?.name" class="fixed-chip" />
        <MultiSelect
          :disabled="loading"
          class="multi-select"
          :class="invalid && showValidation && 'invalid'"
          v-model="additionalTypes"
          :options="typeDropdownOptions"
          optionLabel="name"
          display="chip"
        />
      </div>
      <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
      <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
    </div>
  </div>
  <div class="dropdown-text-input-concatenator-container">
    <div class="label-content-container">
      <label>Iri</label>
      <div class="content-container">
        <Dropdown :disabled="loading" class="dropdown" v-model="scheme" :options="iriDropdownOptions" optionLabel="name" />
        <InputText
          :disabled="loading"
          class="p-inputtext-lg input-text"
          :placeholder="generatedCode"
          :class="invalid && showValidation && 'invalid'"
          v-model="code"
          type="text"
        />
        <ProgressSpinner v-if="loading" class="loading-icon" style="height: 2rem; width: 2rem" strokeWidth="8" />
      </div>
      <span>{{ scheme ? scheme["@id"] : "" }}{{ code }}</span>
      <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
    </div>
  </div>
  <div class="string-single-display-container">
    <label>Code</label>
    <div class="input-loading-container">
      <div class="tooltip-container" v-tooltip.top="{ value: code ? code : conceptType?.name, class: 'string-single-display-tooltip' }">
        <InputText
          disabled
          class="p-inputtext-lg single-input-text"
          :class="invalid && showValidation && 'invalid'"
          :placeholder="generatedCode"
          v-model="code"
          type="text"
        />
      </div>
      <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
    </div>
    <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
  </div>
  <div class="string-single-select-container">
    <label>Concept name</label>
    <InputText
      class="p-inputtext single-input-text"
      :class="invalid && showValidation && 'invalid'"
      v-model="name"
      type="text"
      @drop.prevent
      @dragover.prevent
      v-tooltip.top="{ value: name.value ? name.value : shape.name, class: 'string-single-select-tooltip' }"
    />
    <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
  </div>
  <div class="html-input-container">
    <label>Concept description</label>
    <Textarea class="p-inputtext-lg input-html" :class="invalid && showValidation && 'invalid'" v-model="description" rows="4" @drop.prevent />
    <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
  </div>
  <div class="entity-single-dropdown-container">
    <span class="dropdown-container">
      <label>Status</label>
      <Dropdown
        class="entity-single-dropdown"
        :class="invalid && showValidation && 'invalid'"
        v-model="status"
        :options="statusDropdownOptions"
        optionLabel="name"
      />
    </span>
    <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
    <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
  </div>
</template>

<script setup lang="ts">
import { EditorMode } from "@im-library/enums";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { PropertyShape, TTIriRef, QueryRequest, Query } from "@im-library/interfaces/AutoGen";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { inject, onMounted, ref, Ref, watch } from "vue";
import { byName } from "@im-library/helpers/Sorters";
import { QueryService } from "@/services";
import { IM, RDF, RDFS, SNOMED } from "@im-library/vocabulary";
import _ from "lodash";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: any;
}

const props = defineProps<Props>();
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const validationCheckStatus = inject(injectionKeys.forceValidation)?.validationCheckStatus;
const updateValidationCheckStatus = inject(injectionKeys.forceValidation)?.updateValidationCheckStatus;
const valueVariableMap = inject(injectionKeys.valueVariableMap)?.valueVariableMap;
const valueVariableMapUpdate = inject(injectionKeys.valueVariableMap)?.updateValueVariableMap;
if (forceValidation) {
  watch(forceValidation, async () => {
    if (forceValidation && updateValidity) {
      updateEntity();
      await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
      if (updateValidationCheckStatus) updateValidationCheckStatus(key);
      showValidation.value = true;
    }
  });
}
watch(
  () => _.cloneDeep(editorEntity?.value),
  (newValue, oldValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) processProps();
  }
);

const loading = ref(false);
const selectedEntities: Ref<TTIriRef[]> = ref([]);
const conceptType: Ref<TTIriRef | undefined> = ref();
const additionalTypes: Ref<TTIriRef[]> = ref([]);
const code = ref("");
const name = ref("");
const description = ref("");
const status: Ref<TTIriRef | undefined> = ref();
const scheme: Ref<TTIriRef | undefined> = ref();
const typeDropdownOptions: Ref<TTIriRef[]> = ref([]);
const iriDropdownOptions: Ref<TTIriRef[]> = ref([]);
const statusDropdownOptions: Ref<TTIriRef[]> = ref([]);
const generatedCode = ref("");
const showValidation = ref(false);
const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const newEditorEntity: Ref<any | undefined> = ref();

let key = props.shape.path["@id"];

onMounted(async () => {
  loading.value = true;
  await processProps();
  typeDropdownOptions.value = await getTypeDropdownOptions();
  iriDropdownOptions.value = await getIriDropdownOptions();
  statusDropdownOptions.value = await getStatusDropdownOptions();
  loading.value = false;
});

watch(scheme, async newValue => {
  if (scheme.value && scheme.value["@id"].toString() === SNOMED.NAMESPACE && !generatedCode.value) {
    const generatedIri = await QueryService.runFunction(IM.function.SNOMED_CONCEPT_GENERATOR);
    generatedCode.value = generatedIri.iri["@id"].split("#")[1];
  }
});

async function processProps() {
  conceptType.value = editorEntity?.value[RDF.TYPE][0];
  additionalTypes.value = editorEntity?.value[RDF.TYPE].slice(1);
  if (isArrayHasLength(editorEntity?.value[IM.SCHEME])) {
    scheme.value = editorEntity?.value[IM.SCHEME][0];
  }
  if (editorEntity?.value[IM.CODE]) code.value = editorEntity?.value[IM.CODE];
  else if (editorEntity?.value[IM.ID]) code.value = editorEntity?.value[IM.ID].split("#")[1];
  name.value = editorEntity?.value[RDFS.LABEL];
  description.value = editorEntity?.value[RDFS.COMMENT];
  if (isArrayHasLength(editorEntity?.value[IM.HAS_STATUS])) status.value = editorEntity?.value[IM.HAS_STATUS][0];
}

async function updateCode() {}

async function update() {
  validateEntity();
  if (true) updateEntity();
}

function validateEntity() {}

function updateEntity() {
  const entity: any = {};

  entity[RDF.TYPE] = [conceptType.value];
  if (isArrayHasLength(additionalTypes.value)) {
    entity[RDF.TYPE] = additionalTypes.value.unshift(conceptType.value!);
  }
  entity[IM.SCHEME] = [scheme.value];
  if (!code.value && generatedCode.value && scheme.value?.["@id"] === SNOMED.NAMESPACE) entity[IM.CODE] = generatedCode.value;
  entity[IM.CODE] = code.value;
  entity[IM.ID] = scheme.value?.["@id"] + code.value;
  entity[RDFS.LABEL] = name.value;
  entity[RDFS.COMMENT] = description.value;
  entity[IM.HAS_STATUS] = [status.value];

  if (entityUpdate) {
    entityUpdate([entity]);
  }
}
async function getTypeDropdownOptions() {
  const args = [
    {
      valueIri: {
        "@id": conceptType?.value?.["@id"]
      },
      parameter: "entityIri"
    }
  ];
  return QueryService.runFunction(IM.function.GET_ADDITIONAL_ALLOWABLE_TYPES, args);
}

async function getIriDropdownOptions() {
  return (await QueryService.runFunction(IM.function.GET_SET_EDITOR_IRI_SCHEMES)).sort(byName);
}
async function getStatusDropdownOptions() {
  const queryRequest = {} as QueryRequest;
  queryRequest.argument = [
    {
      valueIri: {
        "@id": IM.STATUS
      },
      parameter: "this"
    }
  ];
  queryRequest.query = { "@id": IM.query.GET_ISAS } as Query;
  const result = await QueryService.queryIM(queryRequest);
  if (result)
    return result.entities.map((item: any) => {
      return { "@id": item["@id"], name: item[RDFS.LABEL] };
    });
  else return [];
}
</script>

<style scoped>
.entity-combobox-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
}
.multiselect-loading-container {
  display: flex;
  flex-flow: row wrap;
  min-width: 25rem;
  align-items: flex-start;
  height: fit-content;
}
.chip-group {
  flex: 1 1 auto;
  gap: 0.5rem;
  display: flex;
}
.fixed-chip {
  flex: 0 1 auto;
}
.multi-select {
  flex: 1 1 auto;
}

.dropdown-text-input-concatenator-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row nowrap;
  min-width: 25rem;
  height: fit-content;
}
.label-content-container {
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
}
.content-container {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
}
.dropdown {
  width: 40%;
}
.dropdown:deep(.p-inputtext) {
  padding-top: 0.7rem;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.input-text {
  width: 60%;
  text-overflow: ellipsis;
  overflow: hidden;
}

.string-single-display-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
}
.p-float-label {
  flex: 1 1 auto;
}

.single-input-text {
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.html-input-container {
  min-width: 25rem;
  flex: 1 1 auto;
  flex-flow: column nowrap;
}

.input-html {
  resize: none;
  width: 100%;
}
.loading-icon {
  flex: 0 1 auto;
}
.p-progress-spinner {
  width: 2rem;
  height: 2rem;
}
.validate-error {
  color: var(--red-500);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
}

.invalid {
  border: 1px solid var(--red-500);
}
</style>
