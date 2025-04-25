<template>
  <Panel class="subsets-panel" header="Subsets" toggleable :collapsed="!hasSubSets">
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>
    <div v-else class="subsets-content">
      <ArrayBuilder v-if="shape.property" :mode="mode" :shape="shape.property[0]" :value="inclusions" @updateClicked="updateInclusions" />
    </div>
    <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
  </Panel>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { PropertyShape, TTIriRef } from "@/interfaces/AutoGen";
import ArrayBuilder from "../ArrayBuilder.vue";
import { ComputedRef, Ref, computed, inject, onMounted, ref, watch } from "vue";
import { IM, QUERY, RDFS } from "@/vocabulary";
import { EditorMode } from "@/enums";
import { cloneDeep, isEqual } from "lodash-es";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { QueryService } from "@/services";

interface Props {
  value?: TTIriRef[];
  mode: EditorMode;
  shape: PropertyShape;
}

const props = defineProps<Props>();

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const deleteEntityKey = inject(injectionKeys.editorEntity)?.deleteEntityKey;
const editorEntity = inject(injectionKeys.editorEntity)!.editorEntity;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const valueVariableMap = inject(injectionKeys.valueVariableMap)!.valueVariableMap;
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
    () => cloneDeep(valueVariableMap),
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

const key = props.shape.path["@id"];

const hasSubSets: ComputedRef<boolean> = computed(() => isArrayHasLength(inclusions.value));

const inclusions: Ref<TTIriRef[]> = ref([]);
const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const showValidation = ref(false);
const loading = ref(true);

watch(
  () => cloneDeep(inclusions.value),
  async (newValue, oldValue) => {
    if (!isEqual(newValue, oldValue)) {
      updateEntity();
      if (updateValidity && valueVariableMap) {
        await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
        showValidation.value = true;
      }
    }
    updateValueVariableMap(newValue);
  }
);

onMounted(async () => {
  loading.value = true;
  await init();
  loading.value = false;
});

async function init() {
  if (editorEntity?.value[IM.ID]) {
    const subsets = await QueryService.queryIM({ query: { "@id": QUERY.GET_SUBSETS }, argument: [{ parameter: "this", valueIri: editorEntity.value[IM.ID] }] });
    if (subsets?.entities) {
      inclusions.value = subsets.entities.map(s => {
        return { "@id": s["@id"], name: s[RDFS.LABEL] };
      });
    } else inclusions.value = [];
  } else inclusions.value = [];
}

function updateValueVariableMap(data: TTIriRef[] | undefined) {
  if (!props.shape.valueVariable) return;
  let mapKey = props.shape.valueVariable;
  if (valueVariableMapUpdate) valueVariableMapUpdate(mapKey, data);
}

function updateInclusions(data: any) {
  inclusions.value = data[props.shape.path["@id"]];
}

function updateEntity() {
  if (entityUpdate) {
    const result = {} as any;
    if (isArrayHasLength(inclusions.value)) {
      result[key] = cloneDeep(inclusions.value);
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
  border: 1px solid var(--p-textarea-border-color);
}

.title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--p-text-color);
  padding-top: 0.5rem;
}
</style>
