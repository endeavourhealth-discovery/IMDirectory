<template>
  <div class="entity-single-dropdown-container">
    <span class="dropdown-container">
      <label v-if="shape.showTitle">{{ shape.name }}</label>
      <Dropdown
        class="entity-single-dropdown"
        :class="invalid && showValidation && 'invalid'"
        v-model="selectedEntity"
        :options="dropdownOptions"
        optionLabel="name"
      />
    </span>
    <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
    <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, watch, onMounted, inject, PropType } from "vue";
import { EditorMode } from "@im-library/enums";
import { isObjectHasKeys, isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { processArguments } from "@im-library/helpers/EditorMethods";
import { byName } from "@im-library/helpers/Sorters";
import { isTTIriRef } from "@im-library/helpers/TypeGuards";
import { QueryService } from "@/services";
import { RDFS } from "@im-library/vocabulary";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { PropertyShape, TTIriRef, QueryRequest, Query } from "@im-library/interfaces/AutoGen";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  position?: number;
  value?: TTIriRef;
}

const props = defineProps<Props>();

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const valueVariableMapUpdate = inject(injectionKeys.valueVariableMap)?.updateValueVariableMap;
const valueVariableMap = inject(injectionKeys.valueVariableMap)?.valueVariableMap;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;
const validationCheckStatus = inject(injectionKeys.forceValidation)?.validationCheckStatus;
const updateValidationCheckStatus = inject(injectionKeys.forceValidation)?.updateValidationCheckStatus;
if (forceValidation) {
  watch(forceValidation, async () => {
    if (forceValidation && updateValidity) {
      await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
      if (updateValidationCheckStatus) updateValidationCheckStatus(key);
      showValidation.value = true;
    }
  });
}

const dropdownOptions: Ref<TTIriRef[]> = ref([]);
const loading = ref(false);
const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const showValidation = ref(false);

let key = props.shape.path["@id"];

let selectedEntity: Ref<TTIriRef | undefined> = ref();
watch(selectedEntity, async newValue => {
  if (isTTIriRef(newValue)) {
    updateEntity(newValue);
    updateValueVariableMap(newValue);
    if (updateValidity) {
      await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
      showValidation.value = true;
    }
  }
});

onMounted(async () => {
  loading.value = true;
  dropdownOptions.value = await getDropdownOptions();
  selectedEntity.value = setSelectedEntity();
  loading.value = false;
});

function setSelectedEntity() {
  if (isObjectHasKeys(props.shape, ["isIri"]) && props.shape.forceIsValue) {
    const found = dropdownOptions.value.find(o => o["@id"] === props.shape.isIri!["@id"]);
    if (found) return found;
  }
  if (props.value && isTTIriRef(props.value)) return props.value;
  else if (props.value && isArrayHasLength(props.value)) return props.value[0];
  else if (isObjectHasKeys(props.shape, ["isIri"]) && props.shape.isIri!["@id"]) {
    const found = dropdownOptions.value.find(o => o["@id"] === props.shape.isIri!["@id"]);
    if (found) return found;
  } else return undefined;
}

async function getDropdownOptions() {
  if (isObjectHasKeys(props.shape, ["select", "argument"])) {
    const args = processArguments(props.shape);
    const queryRequest = {} as QueryRequest;
    queryRequest.argument = args;
    const query = { "@id": props.shape.select![0]["@id"] } as Query;
    queryRequest.query = query;
    const result = await QueryService.queryIM(queryRequest);
    if (result)
      return result.entities.map((item: any) => {
        return { "@id": item["@id"], name: item[RDFS.LABEL] };
      });
    else return [];
  } else if (isObjectHasKeys(props.shape, ["function"])) {
    return (await QueryService.runFunction(props.shape.function!["@id"])).options.sort(byName);
  } else throw new Error("propertyshape is missing 'select' or 'function' parameter to fetch dropdown options");
}

function updateEntity(data: TTIriRef) {
  const result = {} as any;
  result[key] = data;
  if (entityUpdate) entityUpdate(result);
}

function updateValueVariableMap(data: TTIriRef) {
  if (!props.shape.valueVariable) return;
  let mapKey = props.shape.valueVariable;
  if (props.shape.builderChild) mapKey = mapKey + props.shape.order;
  if (valueVariableMapUpdate) valueVariableMapUpdate(mapKey, data);
}
</script>

<style scoped>
.entity-single-dropdown-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row nowrap;
  min-width: 25rem;
  align-items: center;
  height: fit-content;
}

.dropdown-container {
  flex: 1 1 auto;
}

.dropdown-container:deep(label) {
  display: block;
}

.entity-single-dropdown {
  width: 100%;
}

.loading-icon {
  flex: 0 0 auto;
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
