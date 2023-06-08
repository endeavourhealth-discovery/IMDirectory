<template>
  <div class="html-input-container">
    <label v-if="shape.showTitle">{{ shape.name }}</label>
    <Textarea class="p-inputtext-lg input-html" :class="invalid && 'invalid'" v-model="userInput" rows="4" @drop.prevent />
    <small v-if="invalid" class="validate-error">{{ validationErrorMessage }}</small>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, inject, PropType, Ref } from "vue";
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
const valueVariableMap = inject(injectionKeys.valueVariableMap)?.valueVariableMap;

let key = props.shape.path["@id"];

const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();

const userInput = ref("");
onMounted(() => {
  if (props.value) userInput.value = htmlToText(props.value);
});
watch(userInput, async newValue => {
  updateEntity(newValue);
  updateValueVariableMap(newValue);
  if (updateValidity) await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
});

function updateEntity(data: string) {
  const result = {} as any;
  result[key] = textToHtml(data);
  if (entityUpdate) entityUpdate(result);
}

function updateValueVariableMap(data: string) {
  if (!props.shape.valueVariable) return;
  let mapKey = props.shape.valueVariable;
  if (props.shape.builderChild) mapKey = mapKey + props.shape.order;
  if (valueVariableMapUpdate) valueVariableMapUpdate(mapKey, data);
}

function textToHtml(text: string): string {
  return text.replaceAll(/\n/g, "<p>");
}

function htmlToText(text: string): string {
  return text.replaceAll(/<p>/g, "\n");
}
</script>

<style scoped>
.html-input-container {
  min-width: 25rem;
  flex: 1 1 auto;
  flex-flow: column nowrap;
}

.input-html {
  resize: none;
  width: 100%;
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
