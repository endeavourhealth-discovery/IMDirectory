<template>
  <div class="label-content-container">
    <div class="title-bar">
      <div v-if="shape.showTitle">{{ shape.name }}</div>
      <div v-if="false" class="required">*</div>
      <Checkbox v-model="checked" binary />
      <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ComputedRef, Ref, computed, inject, onMounted, ref, watch } from "vue";

import type { PropertyShape, TTIriRef } from "@endeavour/vue-library/models";
import type { ExtendedTTEntity } from "@endeavour/vue-library/models";

import { cloneDeep } from "lodash-es";

import { EditorMode } from "@/enums";
import injectionKeys from "@/injectionKeys/injectionKeys";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: boolean;
  position?: number;
}

const props = withDefaults(defineProps<Props>(), {
  value: false
});

const emit = defineEmits<{ updateClicked: [payload: boolean] }>();

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
      await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
      if (updateValidationCheckStatus) updateValidationCheckStatus(key);
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
          await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
          showValidation.value = true;
        }
    }
  );
}

const showRequired: ComputedRef<boolean> = computed(() => {
  return !!(props.shape.minCount && props.shape.minCount > 0);
});

let key = props.shape.path.iri;

const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const checked = ref(false);
const showValidation = ref(true);

onMounted(() => {
  if (props.value) checked.value = props.value;
});
watch(
  () => props.value,
  newValue => {
    if (newValue) checked.value = newValue;
  }
);

watch(checked, async newValue => {
  if (!props.shape.builderChild) updateEntity(newValue);
  else emit("updateClicked", newValue);
  updateValueVariableMap(newValue);
  if (updateValidity) {
    await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
    showValidation.value = true;
  }
});

function updateEntity(data: boolean) {
  const result = {} as ExtendedTTEntity;
  result[props.shape.path.iri] = data;
  if (!data && !props.shape.builderChild && deleteEntityKey) deleteEntityKey(key);
  else if (!props.shape.builderChild && entityUpdate) entityUpdate(result);
  else emit("updateClicked", data);
}

function updateValueVariableMap(data: boolean) {
  if (!props.shape.valueVariable) return;
  let mapKey = props.shape.valueVariable;
  if (props.shape.builderChild) mapKey = mapKey + props.shape.order;
  if (valueVariableMapUpdate) valueVariableMapUpdate(mapKey, data);
}
</script>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
