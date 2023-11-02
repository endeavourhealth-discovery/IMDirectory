<template>
  <div class="dropdown-text-input-concatenator-container">
    <div class="label-content-container">
      <label v-if="shape.showTitle">{{ shape.name }}</label>
      <div class="content-container">
        <Dropdown :disabled="loading" class="dropdown" v-model="selectedDropdownOption" :options="dropdownOptions" optionLabel="name" />
        <InputText :disabled="loading" class="p-inputtext-lg input-text" :class="invalid && showValidation && 'invalid'" v-model="userInput" type="text" />
        <ProgressSpinner v-if="loading" class="loading-icon" style="height: 2rem; width: 2rem" strokeWidth="8" />
      </div>
      <span>{{ selectedDropdownOption ? selectedDropdownOption["@id"] : "" }}{{ userInput }}</span>
      <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, PropType, ref, Ref, watch, onMounted } from "vue";
import { TTIriRef, PropertyShape, QueryRequest, Query } from "@im-library/interfaces/AutoGen";
import { EditorMode } from "@im-library/enums";
import { isTTIriRef } from "@im-library/helpers/TypeGuards";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { processArguments } from "@im-library/helpers/EditorMethods";
import { byName } from "@im-library/helpers/Sorters";
import { RDFS } from "@im-library/vocabulary";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { FunctionService, QueryService } from "@/services";
import _ from "lodash";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  position?: number;
  value?: string;
}

const props = defineProps<Props>();

const emit = defineEmits({ updateClicked: (_payload: string) => true });

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
    () => _.cloneDeep(valueVariableMap),
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

const dropdownOptions: Ref<TTIriRef[]> = ref([]);
const loading = ref(false);
const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const selectedDropdownOption: Ref<TTIriRef | null> = ref(null);
const userInput = ref("");
const showValidation = ref(false);

watch([selectedDropdownOption, userInput], async ([newSelectedDropdownOption, newUserInput], [oldSelectedDropdownOption, oldUserInput]) => {
  if (isTTIriRef(newSelectedDropdownOption) && newUserInput && (newSelectedDropdownOption !== oldSelectedDropdownOption || newUserInput !== oldUserInput)) {
    const concatenated = newSelectedDropdownOption["@id"] + newUserInput;
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
  }
});

let key = props.shape.path["@id"];

onMounted(async () => {
  loading.value = true;
  dropdownOptions.value = await getDropdownOptions();
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

.loading-icon {
  flex: 0 0 auto;
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
