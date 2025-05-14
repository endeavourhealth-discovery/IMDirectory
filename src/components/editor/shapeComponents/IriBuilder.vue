<template>
  <div class="iri-builder-container">
    <div class="label-content-container">
      <div class="title-bar">
        <span v-if="shape.showTitle">{{ shape.name }}</span>
        <span v-if="showRequired" class="required">*</span>
      </div>
      <div class="content-container">
        <Select
          :disabled="disableSchemeEdit"
          class="dropdown"
          v-model="selectedDropdownOption"
          :options="dropdownOptions"
          optionLabel="name"
          data-testid="iri-builder-dropdown"
        />
        <span v-if="includePrefix" class="prefix">{{ prefix }}</span>
        <InputText
          :disabled="disableCodeEdit"
          class="p-inputtext-lg input-text"
          :class="invalid && showValidation && 'invalid'"
          v-model="userInput"
          type="text"
          data-testid="iri-builder-input"
        />
        <ProgressSpinner v-if="loading" class="loading-icon" style="height: 2rem; width: 2rem" strokeWidth="8" />
      </div>
      <span>{{ selectedDropdownOption ? selectedDropdownOption["@id"] : "" }}{{ prefix ? prefix : "" }}{{ userInput }}</span>
      <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, Ref, watch, onMounted, computed, ComputedRef } from "vue";
import { TTIriRef, PropertyShape, QueryRequest, Query } from "@/interfaces/AutoGen";
import { EditorMode } from "@/enums";
import { isTTIriRef } from "@/helpers/TypeGuards";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { processArguments } from "@/helpers/EditorMethods";
import { byName } from "@/helpers/Sorters";
import { IM, RDF, RDFS, SNOMED, EDITOR, IM_FUNCTION } from "@/vocabulary";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { FunctionService, QueryService } from "@/services";
import { cloneDeep, isEqual } from "lodash-es";
import { isConcept } from "@/helpers/ConceptTypeMethods";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  position?: number;
  value?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{ updateClicked: [payload: string] }>();

const fullShape = inject(injectionKeys.fullShape);
const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const deleteEntityKey = inject(injectionKeys.editorEntity)?.deleteEntityKey;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const valueVariableMap = inject(injectionKeys.valueVariableMap)?.valueVariableMap;
const valueVariableMapUpdate = inject(injectionKeys.valueVariableMap)?.updateValueVariableMap;
const valueVariableHasChanged = inject(injectionKeys.valueVariableMap)?.valueVariableHasChanged;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;
const validationCheckStatus = inject(injectionKeys.forceValidation)?.validationCheckStatus;
const updateValidationCheckStatus = inject(injectionKeys.forceValidation)?.updateValidationCheckStatus;
if (forceValidation) {
  watch(forceValidation, async () => {
    if (forceValidation && updateValidity) {
      if (props.shape.builderChild) {
        hasData();
      } else {
        await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
        if (updateValidationCheckStatus) updateValidationCheckStatus(key);
      }
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
          if (props.shape.builderChild) {
            hasData();
          } else {
            await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
          }
          showValidation.value = true;
        }
      }
    }
  );
}

const disableCodeEdit: ComputedRef<boolean> = computed(() => {
  return loading.value || props.mode === "edit";
});

const disableSchemeEdit: ComputedRef<boolean> = computed(() => {
  if (loading.value || props.mode === "edit") return true;
  else return false;
});

const showRequired: ComputedRef<boolean> = computed(() => {
  if (props.shape.minCount && props.shape.minCount > 0) return true;
  else return false;
});

const includePrefix: ComputedRef<boolean> = computed(() => {
  if (props.mode === EditorMode.CREATE && prefix.value) return true;
  else return false;
});

const dropdownOptions: Ref<TTIriRef[]> = ref([]);
const loading = ref(false);
const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const selectedDropdownOption: Ref<TTIriRef | null> = ref(null);
const userInput = ref("");
const showValidation = ref(false);
const prefix = ref("");

watch([selectedDropdownOption, userInput], async ([newSelectedDropdownOption, newUserInput], [oldSelectedDropdownOption, oldUserInput]) => {
  if (isTTIriRef(newSelectedDropdownOption) && newUserInput && (newSelectedDropdownOption !== oldSelectedDropdownOption || newUserInput !== oldUserInput)) {
    let concatenated = "";
    concatenated += newSelectedDropdownOption["@id"];
    if (includePrefix.value) concatenated += prefix.value;
    concatenated += newUserInput;
    updateEntity(concatenated);
    updateValueVariableMap(concatenated);
    if (updateValidity) {
      if (props.shape.builderChild) {
        hasData();
      } else if (userInput.value) {
        await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
      }
      showValidation.value = true;
    }
  } else if (!newUserInput && newUserInput !== oldUserInput && isTTIriRef(newSelectedDropdownOption)) {
    let concatenated = "";
    concatenated += newSelectedDropdownOption["@id"];
    if (includePrefix.value) concatenated += prefix.value;
    updateEntity(concatenated);
    updateValueVariableMap(concatenated);
    if (updateValidity) {
      if (props.shape.builderChild) {
        hasData();
      } else {
        await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
      }
      showValidation.value = true;
    }
  } else if (!isTTIriRef(newSelectedDropdownOption) && isEqual(newSelectedDropdownOption, oldSelectedDropdownOption) && newUserInput) {
    let concatenated = "";
    if (includePrefix.value) concatenated += prefix.value;
    concatenated += newUserInput;
    updateEntity(concatenated);
    updateValueVariableMap(concatenated);
    if (updateValidity) {
      if (props.shape.builderChild) {
        hasData();
      } else {
        await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
      }
      showValidation.value = true;
    }
  } else {
    if (deleteEntityKey) deleteEntityKey(key);
  }
});

let key = props.shape.path["@id"];

onMounted(async () => {
  loading.value = true;
  dropdownOptions.value = await getDropdownOptions();
  if (props.mode === EditorMode.CREATE) {
    const prefixArg = props.shape.argument?.find(arg => arg.parameter === "prefix");
    if (prefixArg && prefixArg.valueData) prefix.value = prefixArg.valueData;
  }
  setSelectedOption();
  loading.value = false;
});

function setSelectedOption() {
  if (isObjectHasKeys(props.shape, ["isIri"]) && props.shape.forceIsValue) {
    deconstructInputValue(props.shape.isIri!["@id"]);
    return;
  }
  if (props.value && typeof props.value === "string") {
    deconstructInputValue(props.value);
    return;
  } else if (isObjectHasKeys(props.shape, ["isIri"]) && props.shape.isIri!["@id"]) {
    deconstructInputValue(props.shape.isIri!["@id"]);
    return;
  } else if (EditorMode.CREATE && isArrayHasLength(dropdownOptions.value)) {
    const foundIndex = dropdownOptions.value.findIndex(option => option["@id"] === IM.NAMESPACE);
    if (foundIndex !== -1) selectedDropdownOption.value = dropdownOptions.value[foundIndex];
    else selectedDropdownOption.value = dropdownOptions.value[0];
    userInput.value = "";
    return;
  } else {
    selectedDropdownOption.value = null;
    userInput.value = "";
    return;
  }
}

function deconstructInputValue(inputValue: String) {
  const found = dropdownOptions.value.find(o => inputValue.startsWith(o["@id"]));
  if (found) {
    selectedDropdownOption.value = found;
    userInput.value = inputValue.substring(found["@id"].length);
  }
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
    return (await FunctionService.runFunction(props.shape.function!["@id"])).sort(byName);
  } else throw new Error("propertyshape is missing 'select' or 'function' parameter to fetch dropdown options");
}

function updateEntity(data: string) {
  const result = {} as any;
  result[key] = data;
  if (!data && !props.shape.builderChild && deleteEntityKey) deleteEntityKey(key);
  else if (!props.shape.builderChild && entityUpdate) entityUpdate(result);
  else emit("updateClicked", data);
}

function updateValueVariableMap(data: string) {
  if (!props.shape.valueVariable) return;
  let mapKey = props.shape.valueVariable;
  if (props.shape.builderChild) mapKey = mapKey + props.shape.order;
  if (valueVariableMapUpdate) valueVariableMapUpdate(mapKey, data);
}

function defaultValidation(data: string) {
  return true;
}

function hasData() {
  invalid.value = false;
  validationErrorMessage.value = undefined;
  if (props.shape.minCount === 0 && !selectedDropdownOption.value && !userInput.value) return;
  if (!selectedDropdownOption.value) {
    invalid.value = true;
    validationErrorMessage.value = props.shape.validationErrorMessage ?? "Missing dropdown value. ";
  }
  if (!userInput.value) {
    invalid.value = true;
    validationErrorMessage.value = props.shape.validationErrorMessage ?? "Missing data. ";
  }
}
</script>

<style scoped>
.iri-builder-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row nowrap;
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

.prefix {
  font-family: inherit;
  font-feature-settings: inherit;
  font-size: 1rem;
  color: var(--p-text-color-secondary);
  background: var(--p-content-background);
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: 0.625rem 0.625rem;
  border: 1px solid var(--p-textarea-border-color);
  border-radius: var(--p-textarea-border-radius);
}

.loading-icon {
  flex: 0 0 auto;
}

.validate-error {
  color: var(--p-red-500);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
}

.invalid {
  border: 1px solid var(--p-red-500);
}

.title-bar {
  display: flex;
  flex-flow: row nowrap;
  gap: 0.25rem;
}

.required {
  color: var(--p-red-500);
}
</style>
