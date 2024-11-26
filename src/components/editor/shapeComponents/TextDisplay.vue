<template>
  <div class="string-single-display-container">
    <label v-if="shape.showTitle">{{ shape.name }}</label>
    <div class="input-loading-container">
      <div class="tooltip-container" v-tooltip.top="{ value: userInput ? userInput : shape.name, class: 'string-single-display-tooltip' }">
        <InputText
          disabled
          class="p-inputtext input-text"
          :class="invalid && showValidation && 'invalid'"
          v-model="userInput"
          type="text"
          data-testid="text-display"
        />
      </div>
      <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
    </div>
    <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, inject, Ref } from "vue";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { cloneDeep } from "lodash-es";
import { PropertyShape, Argument } from "@/interfaces/AutoGen";
import { EditorMode } from "@/enums";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { processArguments } from "@/helpers/EditorMethods";
import { FunctionService } from "@/services";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: string;
  position?: number;
}

const props = defineProps<Props>();
watch([() => cloneDeep(props.value), () => cloneDeep(props.shape)], async ([newPropsValue, newShapeValue]) => {
  if (newPropsValue && newShapeValue) userInput.value = newPropsValue;
  else userInput.value = await processPropertyValue(newShapeValue);
});

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
    () => cloneDeep(valueVariableMap),
    async (newValue, oldValue) => {
      if (valueVariableHasChanged && valueVariableHasChanged(props.shape, newValue, oldValue)) {
        const result = await processPropertyValue(props.shape);
        if (result) userInput.value = result;
        else userInput.value = "";
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

let key = props.shape.path["@id"];

const loading = ref(false);
const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const userInput = ref("");
const showValidation = ref(false);

watch(userInput, async newValue => {
  if (newValue) {
    if (!props.shape.builderChild) updateEntity(newValue);
    else emit("updateClicked", newValue);
    updateValueVariableMap(newValue);
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

onMounted(async () => {
  await init();
});

async function init() {
  if (props.value) userInput.value = props.value;
  else {
    loading.value = true;
    const result = await processPropertyValue(props.shape);
    if (result) userInput.value = result;
    loading.value = false;
  }
}

function compareMaps(map1: Map<string, any>, map2: Map<string, any>) {
  let testValue;
  if (map1.size !== map2.size) return false;
  for (let [key, value] of map1) {
    testValue = map2.get(key);
    if (testValue !== value || (testValue === undefined && !map2.has(key))) return false;
  }
  return true;
}

async function processPropertyValue(property: PropertyShape): Promise<string> {
  if (isObjectHasKeys(property, ["isIri"])) {
    return property.isIri!["@id"];
  }
  if (isObjectHasKeys(property, ["function", "argument"])) {
    const args = processArguments(property, valueVariableMap?.value);
    if (props.shape.argument!.find((a: Argument) => a.valueVariable)) {
      const valueVariable = args.find(arg => isObjectHasKeys(arg, ["valueVariable"]));
      if (valueVariable && valueVariable.valueVariable && args.every((arg: Argument) => isObjectHasKeys(arg, ["parameter"]))) {
        const result = await FunctionService.runFunction(property.function!["@id"], args);
        if (result) return result;
      } else return "";
    } else {
      const result = await FunctionService.runFunction(property.function!["@id"], args);
      if (result) return result;
    }
  } else if (isObjectHasKeys(property, ["function"])) {
    const result = await FunctionService.runFunction(property.function!["@id"]);
    if (result && isObjectHasKeys(result, ["iri"])) return result.iri["@id"];
  }
  return "";
}

// function processArguments(property: PropertyShape) {
//   const result = new Map<string, any>();
//   property.argument.forEach(arg => {
//     let key = "";
//     let value: any;
//     if (arg.parameter === "this") key = props.shape.path["@id"] == IM.ID ? IM.IRI : props.shape.path["@id"];
//     else key = arg.parameter;
//     if (arg.valueIri) value = arg.valueIri;
//     else if (arg.valueVariable) value = valueVariableMap?.value.get(arg.valueVariable);
//     else if (arg.valueData) value = arg.valueData;
//     result.set(key, value);
//   });
//   return result;
// }

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

function hasData() {
  invalid.value = false;
  validationErrorMessage.value = undefined;
  if (props.shape.minCount === 0 && !userInput.value) return;
  if (!userInput.value) {
    invalid.value = true;
    validationErrorMessage.value = props.shape.validationErrorMessage ?? "Item required. ";
  }
}
</script>

<style scoped>
.string-single-display-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
}
.input-loading-container {
  display: flex;
  flex-flow: row nowrap;
  min-width: 25rem;
  align-items: center;
}
.loading-icon {
  flex: 0 0 auto;
}
.p-progressspinner {
  width: 2rem;
  height: 2rem;
}

.tooltip-container {
  width: 100%;
}

.input-text {
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.input-text:hover {
  cursor: not-allowed;
}

.invalid {
  border-color: var(--p-red-500);
}

.validate-error {
  color: var(--p-red-500);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
}
</style>

<style>
.string-single-display-tooltip .p-tooltip-text {
  width: fit-content;
  word-wrap: break-word;
  word-break: normal;
}
</style>
