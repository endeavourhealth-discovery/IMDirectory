<template>
  <div class="entity-single-dropdown-container">
    <span class="p-float-label dropdown-container">
      <Dropdown class="entity-single-dropdown" :class="invalid && 'invalid'" v-model="selectedEntity" :options="dropdownOptions" optionLabel="name" />
      <label>{{ shape.name }}</label>
    </span>
    <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, watch, onMounted, inject, PropType } from "vue";
import { EditorMode } from "@im-library/enums";
import { isObjectHasKeys, isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { processArguments } from "@im-library/helpers/EditorMethods";
import { byName } from "@im-library/helpers/Sorters";
import { mapToObject } from "@im-library/helpers/Transforms";
import { isTTIriRef } from "@im-library/helpers/TypeGuards";
import { QueryService } from "@/services";
import { RDFS } from "@im-library/vocabulary";
import injectionKeys from "@/injectionKeys/injectionKeys";
import _ from "lodash";
import { PropertyShape, TTIriRef, QueryRequest, Query } from "@im-library/interfaces";

const props = defineProps({
  shape: { type: Object as PropType<PropertyShape>, required: true },
  mode: { type: String as PropType<EditorMode>, required: true },
  value: { type: (Object as PropType<TTIriRef>) || (Array as PropType<TTIriRef[]>), required: false },
  position: { type: Number, required: false }
});

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const validityUpdate = inject(injectionKeys.editorValidity)?.updateValidity;
const valueVariableMapUpdate = inject(injectionKeys.valueVariableMap)?.updateValueVariableMap;

const dropdownOptions: Ref<TTIriRef[]> = ref([]);
const loading = ref(false);
const invalid = ref(false);

let key = props.shape.path["@id"];

let selectedEntity: Ref<TTIriRef | undefined> = ref();
watch(selectedEntity, async newValue => {
  if (isTTIriRef(newValue)) {
    updateEntity(newValue);
    updateValueVariableMap(newValue);
    await updateValidity(newValue);
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
    const found = dropdownOptions.value.find(o => o["@id"] === props.shape.isIri["@id"]);
    if (found) return found;
  }
  if (props.value && isTTIriRef(props.value)) return props.value;
  else if (props.value && isArrayHasLength(props.value)) return props.value[0];
  else if (isObjectHasKeys(props.shape, ["isIri"]) && props.shape.isIri["@id"]) {
    const found = dropdownOptions.value.find(o => o["@id"] === props.shape.isIri["@id"]);
    if (found) return found;
  } else return undefined;
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
    return (await QueryService.runFunction(props.shape.function["@id"])).options.sort(byName);
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
.entity-single-dropdown-container {
  padding: 2rem 0 0 0;
  display: flex;
  flex-flow: row nowrap;
  width: 25rem;
  align-items: center;
  height: fit-content;
}

.dropdown-container {
  flex: 1 1 auto;
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
.invalid {
  border-color: #e24c4c;
}
</style>
