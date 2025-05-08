<template>
  <div class="string-single-select-container">
    <div class="title-bar">
      <span v-if="shape.showTitle">{{ shape.name }}</span>
      <span v-if="showRequired" class="required">*</span>
    </div>
    <InputText
      class="p-inputtext-lg input-text"
      :class="invalid && showValidation && 'invalid'"
      v-model="userInput"
      type="text"
      @drop.prevent
      @dragover.prevent
      v-tooltip.top="{ value: userInput ? userInput : shape.name, class: 'string-single-select-tooltip' }"
      data-testid="text-input"
    />
    <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, inject, Ref, computed, ComputedRef } from "vue";
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
      if (valueVariableHasChanged && valueVariableHasChanged(props.shape, newValue, oldValue))
        if (updateValidity) {
          if (props.shape.builderChild) {
            hasData();
          } else {
            await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
          }
          showValidation.value = true;
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
const userInput = ref("");
const showValidation = ref(true);

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
});

function updateEntity(data: string) {
  const result = {} as TTEntity;
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
.string-single-select-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
}
.input-text {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
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

.string-single-select-tooltip .p-tooltip-text {
  width: fit-content;
  word-wrap: break-word;
  word-break: normal;
}
</style>
