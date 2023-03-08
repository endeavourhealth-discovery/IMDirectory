<template>
  <div class="string-single-display-container">
    <div class="input-loading-container">
      <span class="p-float-label" v-tooltip.top="{ value: userInput ? userInput : shape.name, class: 'string-single-display-tooltip' }">
        <InputText disabled class="p-inputtext-lg input-text" :class="invalid && 'invalid'" v-model="userInput" type="text" />
        <label>{{ shape.name }}</label>
      </span>
      <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, watch, computed, onMounted, inject, PropType } from "vue";
import injectionKeys from "@/injectionKeys/injectionKeys";
import _ from "lodash";
import { PropertyShape, Argument } from "@im-library/models/AutoGen";
import { EditorMode } from "@im-library/enums";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { processArguments } from "@im-library/helpers/EditorMethods";
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
const valueVariableMap = inject(injectionKeys.valueVariableMap)?.valueVariableMap;
const valueVariableMapUpdate = inject(injectionKeys.valueVariableMap)?.updateValueVariableMap;
if (valueVariableMap) {
  watch(
    () => _.cloneDeep(valueVariableMap.value),
    async () => {
      if (props.shape.argument && props.shape.argument.some(a => a.valueVariable)) await init();
    }
  );
}

let key = props.shape.path["@id"];
let loading = ref(false);

let invalid = ref(false);

let userInput = ref("");
watch([() => _.cloneDeep(props.value), () => _.cloneDeep(props.shape)], async ([newPropsValue, newShapeValue]) => {
  if (newPropsValue && newShapeValue) userInput.value = newPropsValue;
  else userInput.value = await processPropertyValue(newShapeValue);
});
watch(userInput, async newValue => {
  if (newValue) {
    updateEntity(newValue);
    updateValueVariableMap(newValue);
    await updateValidity();
  }
});
onMounted(async () => {
  await init();
});

watch(
  () => _.cloneDeep(valueVariableMap?.value),
  async (newValue, oldValue) => {
    if (!userInput.value && newValue && oldValue && !compareMaps(newValue, oldValue)) {
      loading.value = true;
      if (newValue?.size) userInput.value = await processPropertyValue(props.shape);
      loading.value = false;
    }
  }
);

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
    return property.isIri["@id"];
  }
  if (isObjectHasKeys(property, ["function", "argument"])) {
    const args = processArguments(property, valueVariableMap?.value);
    if (props.shape.argument.find((a: Argument) => a.valueVariable)) {
      const valueVariable = args.find(arg => isObjectHasKeys(arg, ["valueVariable"]));
      if (valueVariable.valueVariable && args.every((arg: Argument) => isObjectHasKeys(arg, ["parameter"]))) {
        const result = await QueryService.runFunction(property.function["@id"], args);
        if (result) return result;
      } else return "";
    } else {
      const result = await QueryService.runFunction(property.function["@id"], args);
      if (result) return result;
    }
  }
  if (isObjectHasKeys(property, ["function"])) {
    const result = await QueryService.runFunction(property.function["@id"]);
    if (result && isObjectHasKeys(result, ["iri"])) return result.iri["@id"];
    else throw new Error("Failed to run function " + property.function["@id"]);
  }
  throw new Error("Property must have isIri or function key");
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
  if (entityUpdate) entityUpdate(result);
}

function updateValueVariableMap(data: string) {
  if (!props.shape.valueVariable) return;
  let mapKey = props.shape.valueVariable;
  if (props.shape.builderChild) mapKey = mapKey + props.shape.order;
  if (valueVariableMapUpdate) valueVariableMapUpdate(mapKey, data);
}

async function updateValidity() {
  if (isObjectHasKeys(props.shape, ["validation"]) && editorEntity) {
    invalid.value = !(await QueryService.checkValidation(props.shape.validation["@id"], editorEntity.value));
  } else {
    invalid.value = !defaultValidation();
  }
  if (validityUpdate) validityUpdate({ key: key, valid: !invalid.value });
}

function defaultValidation() {
  return true;
}
</script>

<style scoped>
.input-loading-container {
  display: flex;
  flex-flow: row nowrap;
  width: 25rem;
  align-items: center;
  padding: 2rem 0 0 0;
}
.p-float-label {
  flex: 1 1 auto;
}
.loading-icon {
  flex: 0 0 auto;
}
.p-progress-spinner {
  width: 2rem;
  height: 2rem;
}
.input-text {
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.invalid {
  border-color: #e24c4c;
}

.validate-error {
  color: #e24c4c;
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
