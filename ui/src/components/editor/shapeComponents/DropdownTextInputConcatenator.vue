<template>
  <div class="dropdown-text-input-concatenator-container">
    <div class="label-content-container">
      <label>{{ shape.name }}</label>
      <div class="content-container">
        <Dropdown :disabled="loading" class="dropdown" v-model="selectedDropdownOption" :options="dropdownOptions" optionLabel="name" />
        <InputText :disabled="loading" class="p-inputtext-lg input-text" :class="invalid && 'invalid'" v-model="userInput" type="text" />
        <ProgressSpinner v-if="loading" class="loading-icon" style="height: 2rem; width: 2rem" strokeWidth="8" />
      </div>
      <span>{{ selectedDropdownOption ? selectedDropdownOption["@id"] : "" }}{{ userInput }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, PropType, ref, Ref, watch, onMounted } from "vue";
import { TTIriRef, PropertyShape, QueryRequest, Query } from "@im-library/interfaces";
import { EditorMode } from "@im-library/enums";
import { isTTIriRef } from "@im-library/helpers/TypeGuards";
import { isObjectHasKeys, isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { processArguments } from "@im-library/helpers/EditorMethods";
import { byName } from "@im-library/helpers/Sorters";
import { RDFS } from "@im-library/vocabulary";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { QueryService } from "@/services";

const props = defineProps({
  shape: { type: Object as PropType<PropertyShape>, required: true },
  mode: { type: String as PropType<EditorMode>, required: true },
  value: { type: String, required: false },
  position: { type: Number, required: false }
});

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const validityUpdate = inject(injectionKeys.editorValidity)?.updateValidity;
const valueVariableMapUpdate = inject(injectionKeys.valueVariableMap)?.updateValueVariableMap;

const dropdownOptions: Ref<TTIriRef[]> = ref([]);
const loading = ref(false);
const invalid = ref(false);
const selectedDropdownOption: Ref<TTIriRef | null> = ref(null);
const userInput = ref("");

watch([selectedDropdownOption, userInput], async ([newSelectedDropdownOption, newUserInput], [oldSelectedDropdownOption, oldUserInput]) => {
  if (isTTIriRef(newSelectedDropdownOption) && newUserInput && (newSelectedDropdownOption !== oldSelectedDropdownOption || newUserInput !== oldUserInput)) {
    const concatenated = newSelectedDropdownOption["@id"] + newUserInput;
    updateEntity(concatenated);
    updateValueVariableMap(concatenated);
    await updateValidity(concatenated);
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
    deconstructInputValue(props.shape.isIri["@id"]);
    return;
  }
  if (props.value && typeof props.value === "string") {
    deconstructInputValue(props.value);
    return;
  } else if (isObjectHasKeys(props.shape, ["isIri"]) && props.shape.isIri["@id"]) {
    deconstructInputValue(props.shape.isIri["@id"]);
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
    const query = { "@id": props.shape.select[0]["@id"] } as Query;
    queryRequest.query = query;
    const result = await QueryService.queryIM(queryRequest);
    if (result)
      return result.entities.map((item: any) => {
        return { "@id": item["@id"], name: item[RDFS.LABEL] };
      });
    else return [];
  } else if (isObjectHasKeys(props.shape, ["function"])) {
    return (await QueryService.runFunction(props.shape.function["@id"])).sort(byName);
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

async function updateValidity(data: TTIriRef) {
  if (isObjectHasKeys(props.shape, ["validation"]) && editorEntity) {
    invalid.value = !(await QueryService.checkValidation(props.shape.validation["@id"], editorEntity.value));
  } else {
    invalid.value = !defaultValidation(data);
  }
  if (validityUpdate) validityUpdate({ key: key, valid: !invalid.value });
}

function defaultValidation(data: TTIriRef) {
  return true;
}
</script>

<style scoped>
.dropdown-text-input-concatenator-container {
  display: flex;
  flex-flow: row nowrap;
  width: 25rem;
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
</style>
