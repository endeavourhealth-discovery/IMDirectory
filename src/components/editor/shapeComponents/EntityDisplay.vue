<template>
  <div class="entity-display-container">
    <div class="display-container">
      <label v-if="shape.showTitle">{{ shape.name }}</label>
      <InputText class="entity-display" :class="invalid && showValidation && 'invalid'" v-model="selectedEntity.name" :disabled="true" />
      <small>{{ selectedEntity?.iri }}</small>
    </div>
    <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
    <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, watch, onMounted, inject } from "vue";
import { EditorMode } from "@/enums";
import { isObjectHasKeys, isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { processArguments } from "@/helpers/EditorMethods";
import { isTTIriRef } from "@/helpers/TypeGuards";
import { EntityService, FunctionService, QueryService } from "@/services";
import { RDFS } from "@/vocabulary";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { PropertyShape, TTIriRef, QueryRequest, Query } from "@/interfaces/AutoGen";
import { cloneDeep } from "lodash-es";
import { TTEntity } from "@/interfaces/ExtendedAutoGen";

const props = defineProps<{
  shape: PropertyShape;
  mode: EditorMode;
  position?: number;
  value?: TTIriRef;
}

const props = defineProps<Props>();

const emit = defineEmits<{ updateClicked: [payload: TTIriRef] }>();

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
        selectedEntity.value = await setSelectedEntity();
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

const loading = ref(false);
const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const showValidation = ref(false);

let key = props.shape.path.iri;

let selectedEntity: Ref<TTIriRef> = ref({ iri: "", name: "" });
watch(selectedEntity, async newValue => {
  if (isTTIriRef(newValue)) {
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
  selectedEntity.value = await setSelectedEntity();
  loading.value = false;
});

async function setSelectedEntity() {
  if (isObjectHasKeys(props.shape, ["isIri"]) && props.shape.forceIsValue && props.shape.isIri?.iri) {
    let name = "";
    if (props.shape.isIri.name) name = props.shape.isIri.name;
    else {
      const result = await EntityService.getPartialEntity(props.shape.isIri?.iri, [RDFS.LABEL]);
      name = result[RDFS.LABEL];
    }
    return { iri: props.shape.isIri.iri, name: name };
  }
  if (props.value && isTTIriRef(props.value)) return props.value;
  else if (isObjectHasKeys(props.shape, ["isIri"]) && props.shape.isIri?.iri) {
    let name = "";
    if (props.shape.isIri.name) name = props.shape.isIri.name;
    else {
      const result = await EntityService.getPartialEntity(props.shape.isIri?.iri, [RDFS.LABEL]);
      name = result[RDFS.LABEL];
    }
    return { iri: props.shape.isIri.iri, name: name };
  } else if (isObjectHasKeys(props.shape, ["select", "argument"])) {
    const args = processArguments(props.shape, valueVariableMap?.value);
    const queryRequest = {} as QueryRequest;
    queryRequest.argument = args;
    const query = { iri: props.shape.select![0].iri } as Query;
    queryRequest.query = query;
    const result = await QueryService.queryIM(queryRequest);
    if (result)
      return result.entities.map((item: any) => {
        return { iri: item.iri, name: item[RDFS.LABEL] };
      })[0];
    else return { iri: "", name: "" };
  } else if (isObjectHasKeys(props.shape, ["function", "argument"])) {
    const args = processArguments(props.shape, valueVariableMap?.value);
    if (args.filter(a => isObjectHasKeys(a, ["valueVariable"])).every(a => a.valueVariable)) {
      const result = await FunctionService.runFunction(props.shape.function!.iri, args);
      if (isArrayHasLength(result)) return result[0];
      else return result;
    } else return { iri: "", name: "" };
  } else return { iri: "", name: "" };
}

function updateEntity(data: TTIriRef) {
  const result = {} as TTEntity;
  result[key] = data;
  if (!isTTIriRef(data) && !props.shape.builderChild && deleteEntityKey) deleteEntityKey(key);
  else if (!props.shape.builderChild && entityUpdate) entityUpdate(result);
  else emit("updateClicked", data);
}

function updateValueVariableMap(data: TTIriRef) {
  if (!props.shape.valueVariable) return;
  let mapKey = props.shape.valueVariable;
  if (props.shape.builderChild) mapKey = mapKey + props.shape.order;
  if (valueVariableMapUpdate) valueVariableMapUpdate(mapKey, data);
}

function hasData() {
  invalid.value = false;
  validationErrorMessage.value = undefined;
  if (props.shape.minCount === 0 && !isTTIriRef(selectedEntity.value)) return;
  if (!isTTIriRef(selectedEntity.value)) {
    invalid.value = true;
    validationErrorMessage.value = props.shape.validationErrorMessage ?? "Item required.";
  }
}
</script>

<style scoped>
.entity-display-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  height: fit-content;
}

.display-container {
  flex: 1 1 auto;
}

.display-container:deep(label) {
  display: block;
}

.entity-display {
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
</style>
