<template>
  <div class="entity-combobox-container">
    <div class="multiselect-loading-container">
      <label v-if="shape.showTitle" for="chip-group">{{ shape.name }}</label>
      <div id="chip-group" class="chip-group">
        <Chip v-if="fixedOption" :label="fixedOption.name" class="fixed-chip" />
        <MultiSelect
          :disabled="loading"
          class="multi-select"
          :class="invalid && 'invalid'"
          v-model="selectedEntities"
          :options="dropdownOptions"
          optionLabel="name"
          display="chip"
        />
      </div>
      <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, watch, onMounted, inject, PropType } from "vue";
import { EditorMode } from "@im-library/enums";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { processArguments } from "@im-library/helpers/EditorMethods";
import { byName } from "@im-library/helpers/Sorters";
import { mapToObject } from "@im-library/helpers/Transforms";
import { QueryService } from "@/services";
import { RDFS } from "@im-library/vocabulary";
import injectionKeys from "@/injectionKeys/injectionKeys";
import _ from "lodash";
import { PropertyShape, TTIriRef, QueryRequest, Query } from "@im-library/interfaces/AutoGen";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  position?: number;
  value?: TTIriRef[];
}

const props = defineProps<Props>();

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const validityUpdate = inject(injectionKeys.editorValidity)?.updateValidity;
const valueVariableMapUpdate = inject(injectionKeys.valueVariableMap)?.updateValueVariableMap;

const dropdownOptions: Ref<TTIriRef[]> = ref([]);
const fixedOption: Ref<TTIriRef> = ref({} as TTIriRef);
const loading = ref(false);
const selectedEntities: Ref<TTIriRef[]> = ref([]);
let invalid = ref(false);

let key = props.shape.path["@id"];

watch(selectedEntities, async newValue => {
  if (
    !loading.value &&
    isArrayHasLength(newValue) &&
    !_.isEqual(combineSelectedAndFixed([...selectedEntities.value], { ...fixedOption.value }).sort(byName), editorEntity?.value[key])
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
      return;
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
  updateEntity(combineSelectedAndFixed(selected, fixedOption.value));
  updateValueVariableMap(combineSelectedAndFixed(selected, fixedOption.value));
  await updateValidity(combineSelectedAndFixed(selected, fixedOption.value));
}

async function getDropdownOptions(): Promise<TTIriRef[]> {
  if (isObjectHasKeys(props.shape, ["select", "argument"])) {
    const args = processArguments(props.shape);
    const replacedArgs = mapToObject(args);
    const queryRequest = {} as QueryRequest;
    const query = {} as Query;
    query["@id"] = props.shape.select![0]["@id"];
    queryRequest.argument = replacedArgs;
    queryRequest.query = query;
    const result = await QueryService.queryIM(queryRequest);
    if (result)
      return result.entities.map((item: any) => {
        return { "@id": item["@id"], name: item[RDFS.LABEL] } as TTIriRef;
      });
    else return [];
  } else if (isObjectHasKeys(props.shape, ["function", "argument"])) {
    const args = processArguments(props.shape);
    return QueryService.runFunction(props.shape.function!["@id"], args);
  } else if (isObjectHasKeys(props.shape, ["function"])) {
    return QueryService.runFunction(props.shape.function!["@id"]);
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

async function updateValidity(data: TTIriRef[]) {
  if (isObjectHasKeys(props.shape, ["validation"]) && editorEntity) {
    invalid.value = !(await QueryService.checkValidation(props.shape.validation!["@id"], editorEntity.value));
  } else {
    invalid.value = !defaultValidity(data);
  }
  if (validityUpdate) validityUpdate({ key: key, valid: !invalid.value });
}

function defaultValidity(data: TTIriRef[]) {
  return true;
}
</script>

<style scoped>
.multiselect-loading-container {
  display: flex;
  flex-flow: column nowrap;
  min-width: 25rem;
  align-items: flex-start;
  height: fit-content;
}

.chip-group {
  display: flex;
  width: 100%;
}

.fixed-chip {
  flex-basis: content;
  flex: 0 0 auto;
}

.multi-select {
  flex: 1 1 auto;
}

.loading-icon {
  flex: 0 0 auto;
}

.p-progress-spinner {
  width: 2rem;
  height: 2rem;
}

.invalid {
  border-color: var(--red-500);
}
</style>
