<template>
  <div class="html-input-container">
    <div class="title-bar">
      <span v-if="shape.showTitle">{{ shape.name }}</span>
      <span v-if="showRequired" class="required">*</span>
    </div>
    <Textarea
      class="p-inputtext-lg input-html"
      :class="invalid && showValidation && 'invalid'"
      v-model="userInput"
      data-testid="html-input"
      rows="4"
      @drop.prevent
    />
    <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, inject, Ref, ComputedRef, computed } from "vue";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { PropertyShape } from "@/interfaces/AutoGen";
import { EditorMode } from "@/enums";
import { cloneDeep } from "lodash-es";
import { TTEntity } from "@/interfaces/ExtendedAutoGen";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: string;
  position?: number;
}

const props = withDefaults(defineProps<Props>(), {
  value: ""
});

const emit = defineEmits<{
  updateClicked: [payload: string];
}>();

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

let key = props.shape.path["@id"];

const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const showValidation = ref(false);

const userInput = ref("");
onMounted(() => {
  if (props.value) userInput.value = htmlToText(props.value);
});
watch(userInput, async newValue => {
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
});

function updateEntity(data: string) {
  const result = {} as TTEntity;
  result[key] = textToHtml(data);
  if (!data && !props.shape.builderChild && deleteEntityKey) deleteEntityKey(key);
  else if (!props.shape.builderChild && entityUpdate) entityUpdate(result);
  else emit("updateClicked", textToHtml(data));
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
.html-input-container {
  flex: 1 1 auto;
  flex-flow: column nowrap;
}

.input-html {
  resize: none;
  width: 100%;
}

.invalid {
  border-color: var(--p-red-500);
}

.validate-error {
  color: var(--p-red-500);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
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
