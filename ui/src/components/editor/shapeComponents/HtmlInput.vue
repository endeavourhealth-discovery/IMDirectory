<template>
  <div class="html-input-container">
    <label v-if="shape.showTitle">{{ shape.name }}</label>
    <Textarea class="p-inputtext-lg input-html" :class="invalid && 'invalid'" v-model="userInput" rows="4" @drop.prevent />
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
  if (props.value) userInput.value = htmlToText(props.value);
});
watch(userInput, async newValue => {
  updateEntity(newValue);
  updateValueVariableMap(newValue);
  if (updateValidity) await updateValidity(props.shape, editorEntity, key, invalid);
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
  flex: 1 1 auto;
  min-width: 25rem;
}
.input-html {
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
