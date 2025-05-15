<template>
  <div class="entity-combobox-container">
    <div class="title-bar">
      <span v-if="shape.showTitle">{{ shape.name }}</span>
      <span v-if="showRequired" class="required">*</span>
    </div>
    <div class="multiselect-loading-container">
      <div id="chip-group" class="chip-group">
        <Chip v-if="fixedOption" :label="fixedOption.name" class="fixed-chip" />
        <MultiSelect
          :disabled="loading"
          class="multi-select"
          :class="invalid && showValidation && 'invalid'"
          v-model="selectedEntities"
          :options="dropdownOptions"
          optionLabel="name"
          display="chip"
          data-testid="entity-combo-box"
        />
      </div>
      <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" :style="{ width: '2rem', height: '2rem' }" />
      <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, watch, onMounted, inject, ComputedRef, computed } from "vue";
import { EditorMode } from "@/enums";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { processArguments } from "@/helpers/EditorMethods";
import { byName } from "@/helpers/Sorters";
import { mapToObject } from "@/helpers/Transforms";
import { FunctionService, QueryService } from "@/services";
import { RDFS } from "@/vocabulary";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { cloneDeep, isEqual } from "lodash-es";
import { PropertyShape, TTIriRef, QueryRequest, Query } from "@/interfaces/AutoGen";

const props = defineProps<{
  shape: PropertyShape;
  mode: EditorMode;
  position?: number;
  value?: TTIriRef[];
}>();

const emit = defineEmits<{ updateClicked: [payload: TTIriRef[]] }>();

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const deleteEntityKey = inject(injectionKeys.editorEntity)?.deleteEntityKey;
const editorEntity = inject(injectionKeys.editorEntity)!.editorEntity;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const valueVariableMapUpdate = inject(injectionKeys.valueVariableMap)?.updateValueVariableMap;
const valueVariableMap = inject(injectionKeys.valueVariableMap)!.valueVariableMap;
const valueVariableHasChanged = inject(injectionKeys.valueVariableMap)?.valueVariableHasChanged;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;
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

const showRequired: ComputedRef<boolean> = computed(() => {
  if (props.shape.minCount && props.shape.minCount > 0) return true;
  else return false;
});

const dropdownOptions: Ref<TTIriRef[]> = ref([]);
const fixedOption: Ref<TTIriRef> = ref({} as TTIriRef);
const loading = ref(false);
const selectedEntities: Ref<TTIriRef[]> = ref([]);
const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const showValidation = ref(true);

let key = props.shape.path["@id"];

watch(selectedEntities, async newValue => {
  if (
    !loading.value &&
    isArrayHasLength(newValue) &&
    !isEqual(combineSelectedAndFixed([...selectedEntities.value], { ...fixedOption.value }).sort(byName), editorEntity?.value[key])
  ) {
    await updateAll(newValue);
  }
});

onMounted(async () => {
  loading.value = true;
  const result = await getDropdownOptions();
  dropdownOptions.value = result;

  processPropsValue();
  loading.value = false;
});

function processPropsValue() {
  if (!props.value) {
    selectedEntities.value = [];
    return;
  }
  if (isObjectHasKeys(props.shape, ["isIri"])) {
    selectedEntities.value = props.value.filter(o => o["@id"] !== props.shape.isIri!["@id"]);
    const foundFixedOption = dropdownOptions.value.find(o => o["@id"] === props.shape.isIri!["@id"]);
    if (!foundFixedOption) {
      throw new Error("shape isIri value did not match any dropdown option");
    } else {
      fixedOption.value = foundFixedOption;
      dropdownOptions.value = dropdownOptions.value.filter(o => o["@id"] != fixedOption.value["@id"]);
    }
  } else {
    selectedEntities.value = [...props.value];
  }
}

function combineSelectedAndFixed(selected: TTIriRef[], fixed: TTIriRef) {
  let combined: TTIriRef[] = [...selected];
  if (fixed["@id"]) combined.push(fixed);
  return combined;
}

async function updateAll(selected: TTIriRef[]) {
  if (!selected && !props.shape.builderChild && deleteEntityKey) deleteEntityKey(key);
  else if (!props.shape.builderChild) updateEntity(combineSelectedAndFixed(selected, fixedOption.value));
  else emit("updateClicked", selected);
  updateValueVariableMap(combineSelectedAndFixed(selected, fixedOption.value));
  if (updateValidity) {
    if (props.shape.builderChild) {
      hasData();
    } else {
      await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
    }
    showValidation.value = true;
  }
}

async function getDropdownOptions(): Promise<TTIriRef[]> {
  if (isObjectHasKeys(props.shape, ["select", "argument"])) {
    const args = processArguments(props.shape);
    const replacedArgs = mapToObject(args);
    const queryRequest = {} as QueryRequest;
    const query = {} as Query;
    query["@id"] = props.shape.select![0]["@id"];
    queryRequest.argument = [replacedArgs];
    queryRequest.query = query;
    const result = await QueryService.queryIM(queryRequest);
    if (result)
      return result.entities.map((item: any) => {
        return { "@id": item["@id"], name: item[RDFS.LABEL] } as TTIriRef;
      });
    else return [];
  } else if (isObjectHasKeys(props.shape, ["function", "argument"])) {
    const args = processArguments(props.shape);
    return FunctionService.runFunction(props.shape.function!["@id"], args);
  } else if (isObjectHasKeys(props.shape, ["function"])) {
    return FunctionService.runFunction(props.shape.function!["@id"]);
  } else throw new Error("propertyshape is missing 'search' or 'function' parameter to fetch dropdown options");
}

function updateEntity(data: TTIriRef[]) {
  const result = {} as any;
  result[key] = data;
  if (entityUpdate) entityUpdate(result);
}

function updateValueVariableMap(data: TTIriRef[]) {
  if (!props.shape.valueVariable) return;
  let mapKey = props.shape.valueVariable;
  if (props.shape.builderChild) mapKey = mapKey + props.shape.order;
  if (valueVariableMapUpdate) valueVariableMapUpdate(mapKey, data);
}

function hasData() {
  invalid.value = false;
  validationErrorMessage.value = undefined;
  if (props.shape.minCount === 0 && selectedEntities.value.length === 0) return;
  if (selectedEntities.value.length === 0) {
    invalid.value = true;
    validationErrorMessage.value = props.shape.validationErrorMessage ?? "Item required. ";
  }
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

.loading-icon {
  flex: 0 1 auto;
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
