<template>
  <Panel class="subsets-panel" header="Subsets" toggleable :collapsed="!hasSubSets">
    <div class="subsets-content">
      <ArrayBuilder v-if="shape.property" :mode="mode" :shape="shape.property[0]" :value="inclusions" @updateClicked="updateInclusions" />
    </div>
    <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
  </Panel>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { PropertyShape, TTIriRef } from "@im-library/interfaces/AutoGen";
import ArrayBuilder from "../ArrayBuilder.vue";
import { ComputedRef, Ref, computed, inject, onMounted, ref, watch } from "vue";
import { COMPONENT, IM, QUERY } from "@im-library/vocabulary";
import { EditorMode } from "@im-library/enums";
import _ from "lodash";
import injectionKeys from "@/injectionKeys/injectionKeys";

interface Props {
  value?: TTIriRef[];
  mode: EditorMode;
  shape: PropertyShape;
}

const props = defineProps<Props>();

const hasSubSets: ComputedRef<boolean> = computed(() => isArrayHasLength(inclusions.value));

const inclusions: Ref<TTIriRef[]> = ref([]);
const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const showValidation = ref(false);

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const deleteEntityKey = inject(injectionKeys.editorEntity)?.deleteEntityKey;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const valueVariableMap = inject(injectionKeys.valueVariableMap)?.valueVariableMap;
const valueVariableHasChanged = inject(injectionKeys.valueVariableMap)?.valueVariableHasChanged;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;
const updateValidationCheckStatus = inject(injectionKeys.forceValidation)?.updateValidationCheckStatus;
const valueVariableMapUpdate = inject(injectionKeys.valueVariableMap)?.updateValueVariableMap;
if (forceValidation) {
  watch(forceValidation, async () => {
    if (updateValidity) {
      await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
      if (updateValidationCheckStatus) updateValidationCheckStatus(key);
      showValidation.value = true;
    }
  });
}

if (props.shape.argument?.some(arg => arg.valueVariable) && valueVariableMap) {
  watch(
    () => _.cloneDeep(valueVariableMap),
    async (newValue, oldValue) => {
      if (valueVariableHasChanged && valueVariableHasChanged(props.shape, newValue, oldValue)) {
        if (updateValidity) {
          await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
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

const key = props.shape.path["@id"];

watch(
  () => _.cloneDeep(inclusions.value),
  async (newValue, oldValue) => {
    if (!_.isEqual(newValue, oldValue)) {
      updateEntity();
      if (updateValidity && valueVariableMap) {
        await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
        showValidation.value = true;
      }
    }
    updateValueVariableMap(newValue);
  }
);

watch(
  () => _.cloneDeep(props.value),
  async (newValue, oldValue) => {
    if (!_.isEqual(newValue, oldValue)) init();
  }
);

onMounted(() => {
  init();
});

function updateValueVariableMap(data: TTIriRef[] | undefined) {
  if (!props.shape.valueVariable) return;
  let mapKey = props.shape.valueVariable;
  if (valueVariableMapUpdate) valueVariableMapUpdate(mapKey, data);
}

function init() {
  if (props.value) {
    inclusions.value = _.cloneDeep(props.value);
  } else inclusions.value = [];
}

function updateInclusions(data: any) {
  inclusions.value = data[key];
}

function updateEntity() {
  if (entityUpdate) {
    const result = {} as any;
    if (isArrayHasLength(inclusions.value)) {
      result[key] = _.cloneDeep(inclusions.value);
    }
    if (deleteEntityKey && !isArrayHasLength(inclusions.value)) deleteEntityKey(key);
    if (isObjectHasKeys(result)) entityUpdate(result);
  }
}
</script>

<style scoped>
.subsets-panel {
  flex: 0 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}

.subsets-panel:deep(.p-toggleable-content) {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}

.subsets-panel:deep(.p-panel-content) {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}

.subsets-content {
  flex: 1 1 auto;
  overflow: auto;
}

.subsets-content:deep(#autocomplete-search) {
  border: 1px solid var(--surface-border);
}

.title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  padding-top: 0.5rem;
}
</style>
