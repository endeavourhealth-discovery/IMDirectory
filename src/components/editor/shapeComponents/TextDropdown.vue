<template>
  <div class="text-single-dropdown-container">
    <span class="dropdown-container">
      <div class="title-bar">
        <span v-if="shape.showTitle">{{ shape.name }}</span>
        <span v-if="showRequired" class="required">*</span>
      </div>
      <Select class="text-single-dropdown" :class="invalid && showValidation && 'invalid'" v-model="selectedItem" :options="dropdownOptions" />
    </span>
    <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
    <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, watch, onMounted, inject, ComputedRef, computed } from "vue";
import { EditorMode } from "@/enums";
import { isObjectHasKeys, isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { processArguments } from "@/helpers/EditorMethods";
import { FunctionService, QueryService } from "@/services";
import { RDFS } from "@/vocabulary";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { PropertyShape, QueryRequest, Query } from "@/interfaces/AutoGen";
import { cloneDeep } from "lodash-es";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  position?: number;
  value?: String;
}

const props = defineProps<Props>();

const emit = defineEmits({ updateClicked: (_payload: String) => true });

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const deleteEntityKey = inject(injectionKeys.editorEntity)?.deleteEntityKey;
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
    async () => {
      if (updateValidity) {
        if (props.shape.builderChild) {
          hasData();
        } else {
          await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
        }
        showValidation.value = true;
      }
    }
  );
}

const showRequired: ComputedRef<boolean> = computed(() => {
  if (props.shape.minCount && props.shape.minCount > 0) return true;
  else return false;
});

const dropdownOptions: Ref<String[]> = ref([]);
const loading = ref(false);
const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const showValidation = ref(false);

let key = props.shape.path["@id"];

let selectedItem: Ref<String | undefined> = ref();
watch(selectedItem, async newValue => {
  if (newValue) {
    updateEntity(newValue);
    updateValueVariableMap(newValue);
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

onMounted(async () => {
  loading.value = true;
  dropdownOptions.value = await getDropdownOptions();
  selectedItem.value = setSelectedItem();
  loading.value = false;
});

function setSelectedItem(): String | undefined {
  if (isObjectHasKeys(props.shape, ["isIri"]) && props.shape.forceIsValue) {
    const found = dropdownOptions.value.find(o => o === props.shape.isIri!["@id"]);
    if (found) return found;
  }
  if (props.value && isArrayHasLength(props.value)) return props.value[0];
  else if (props.value) return props.value;
  else if (isObjectHasKeys(props.shape, ["isIri"]) && props.shape.isIri!["@id"]) {
    const found = dropdownOptions.value.find(o => o === props.shape.isIri!["@id"]);
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
        return item[RDFS.LABEL];
      });
    else return [];
  } else if (isObjectHasKeys(props.shape, ["function"])) {
    return (await FunctionService.runFunction(props.shape.function!["@id"])).sort();
  } else throw new Error("propertyshape is missing 'select' or 'function' parameter to fetch dropdown options");
}

function updateEntity(data: String) {
  const result = {} as any;
  result[key] = data;
  if (!data && !props.shape.builderChild && deleteEntityKey) deleteEntityKey(key);
  else if (!props.shape.builderChild && entityUpdate) entityUpdate(result);
  else emit("updateClicked", data);
}

function updateValueVariableMap(data: String) {
  if (!props.shape.valueVariable) return;
  let mapKey = props.shape.valueVariable;
  if (props.shape.builderChild) mapKey = mapKey + props.shape.order;
  if (valueVariableMapUpdate) valueVariableMapUpdate(mapKey, data);
}

function hasData() {
  invalid.value = false;
  validationErrorMessage.value = undefined;
  if (props.shape.minCount === 0 && !selectedItem.value) return;
  if (!selectedItem.value) {
    invalid.value = true;
    validationErrorMessage.value = props.shape.validationErrorMessage ?? "Item required.";
  }
}
</script>

<style scoped>
.text-single-dropdown-container {
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

.text-single-dropdown {
  width: 100%;
}

.loading-icon {
  flex: 0 0 auto;
}

.p-progressspinner {
  width: 2rem;
  height: 2rem;
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
