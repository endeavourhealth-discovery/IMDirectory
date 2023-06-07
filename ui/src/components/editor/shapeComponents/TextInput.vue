<template>
  <div class="string-single-select-container">
    <label v-if="shape.showTitle">{{ shape.name }}</label>
    <InputText
      class="p-inputtext-lg input-text"
      :class="invalid && 'invalid'"
      v-model="userInput"
      type="text"
      @drop.prevent
      @dragover.prevent
      v-tooltip.top="{ value: userInput ? userInput : shape.name, class: 'string-single-select-tooltip' }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, inject, PropType } from "vue";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { PropertyShape } from "@im-library/interfaces/AutoGen";
import { EditorMode } from "@im-library/enums";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { QueryService } from "@/services";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: string;
  position?: number;
}

const props = withDefaults(defineProps<Props>(), {
  value: ""
});

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const valueVariableMapUpdate = inject(injectionKeys.valueVariableMap)?.updateValueVariableMap;

let key = props.shape.path["@id"];

let invalid = ref(false);

let userInput = ref("");
onMounted(() => {
  if (props.value) userInput.value = props.value;
});
watch(
  () => props.value,
  newValue => {
    if (newValue) userInput.value = newValue;
  }
);
watch(userInput, async newValue => {
  updateEntity(newValue);
  updateValueVariableMap(newValue);
  if (updateValidity) await updateValidity(props.shape, editorEntity, key, invalid);
});

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
</script>

<style scoped>
.string-single-select-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
}
.input-text {
  min-width: 25rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.invalid {
  border-color: var(--red-500);
}

.validate-error {
  color: var(--red-500);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
}
</style>

<style>
.string-single-select-tooltip .p-tooltip-text {
  width: fit-content;
  word-wrap: break-word;
  word-break: normal;
}
</style>
