<template>
  <div class="entity-search-item-container">
    <div class="title-bar">
      <span v-if="shape.showTitle">{{ shape.name }}</span>
      <span v-if="showRequired" class="required">*</span>
    </div>
    <AutocompleteSearchBar
      v-model:selected="selectedResult"
      :im-query="queryRequest"
      :root-entities="rootEntities"
      @dragenter.prevent
      @dragover.prevent
      @drop="dropReceived"
      :class="invalid && showValidation && 'invalid'"
      :style="{ width: '100%' }"
    />
    <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, ref, Ref, inject, ComputedRef, computed } from "vue";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { cloneDeep, isEqual } from "lodash-es";
import { TTIriRef, SearchResultSummary } from "@/interfaces/AutoGen";
import { EditorMode, ToastSeverity } from "@/enums";
import { isObjectHasKeys, isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { isTTIriRef } from "@/helpers/TypeGuards";
import { QueryService, EntityService } from "@/services";
import { RDFS } from "@/vocabulary";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { PropertyShape, QueryRequest } from "@/interfaces/AutoGen";
import { useToast } from "primevue/usetoast";
import { GenericObject } from "@/interfaces/GenericObject";

const toast = useToast();

const props = defineProps<{
  shape: PropertyShape;
  mode: EditorMode;
  position?: number;
  value?: TTIriRef;
}>();

const emit = defineEmits<{
  updateClicked: [payload: TTIriRef | undefined];
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
        await updateValidity(props.shape, editorEntity, valueVariableMap, key.value, invalid, validationErrorMessage);
        if (updateValidationCheckStatus) updateValidationCheckStatus(key.value);
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
            await updateValidity(props.shape, editorEntity, valueVariableMap, key.value, invalid, validationErrorMessage);
          }
          showValidation.value = true;
        }
      }
    }
  );
}

watch(
  () => cloneDeep(props.value),
  async (newValue, oldValue) => {
    if (!isEqual(newValue, oldValue)) await init();
  }
);

onMounted(async () => {
  await init();
});

const showRequired: ComputedRef<boolean> = computed(() => {
  if (props.shape.minCount && props.shape.minCount > 0) return true;
  else return false;
});

const selectedResult: Ref<SearchResultSummary> = ref({} as SearchResultSummary);
const key = ref("");
const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const showValidation = ref(false);
const queryRequest: Ref<QueryRequest | undefined> = ref(undefined);
const rootEntities: Ref<string[]> = ref([]);

watch(selectedResult, async (newValue, oldValue) => {
  if (newValue && !isEqual(newValue, oldValue)) await updateSelectedResult(newValue);
});

async function init() {
  if (isObjectHasKeys(props.shape, ["path"])) key.value = props.shape.path!["@id"];
  if (isObjectHasKeys(props.shape, ["select"]) && isArrayHasLength(props.shape.select) && props.shape.select) {
    queryRequest.value = { query: { "@id": props.shape.select[0]["@id"] } };
  } else queryRequest.value = undefined;
  if (isObjectHasKeys(props.shape, ["argument"]) && isArrayHasLength(props.shape.argument) && props.shape.argument && queryRequest.value !== undefined) {
    queryRequest.value.argument = [];
    for (const arg of props.shape.argument) {
      if (arg.parameter === "rootEntities" && arg.valueIriList) rootEntities.value = arg.valueIriList.map(i => i["@id"]);
      else queryRequest.value.argument.push(arg);
    }
    queryRequest.value.argument = props.shape.argument;
  }
  if (props.value && isObjectHasKeys(props.value)) {
    await updateSelectedResult(props.value);
  } else {
    selectedResult.value = {} as SearchResultSummary;
  }
}

function convertToTTIriRef(data: SearchResultSummary): TTIriRef | undefined {
  if (data.iri && data.name) return { "@id": data.iri, name: data.name } as TTIriRef;
  else return undefined;
}

async function updateSelectedResult(data: SearchResultSummary | TTIriRef) {
  if (!isObjectHasKeys(data)) {
    selectedResult.value = {} as SearchResultSummary;
  } else if (isObjectHasKeys(data, ["@id"]) && !isObjectHasKeys(data, ["name"]) && (data as TTIriRef)["@id"]) {
    const asSummary = await EntityService.getEntitySummary((data as TTIriRef)["@id"]);
    selectedResult.value = isObjectHasKeys(asSummary) ? asSummary : ({} as SearchResultSummary);
  } else if (isTTIriRef(data)) {
    const asSummary = await EntityService.getEntitySummary(data["@id"]);
    selectedResult.value = isObjectHasKeys(asSummary) ? asSummary : ({} as SearchResultSummary);
  } else {
    selectedResult.value = data;
  }
  if (!props.shape.builderChild && key.value) {
    updateEntity();
  } else {
    emit("updateClicked", convertToTTIriRef(selectedResult.value));
  }
  if (updateValidity) {
    if (props.shape.builderChild) {
      hasData();
    } else {
      await updateValidity(props.shape, editorEntity, valueVariableMap, key.value, invalid, validationErrorMessage);
    }
    showValidation.value = true;
  }
  updateValueVariableMap(convertToTTIriRef(selectedResult.value));
}

function updateEntity() {
  const result: GenericObject = {};
  result[key.value] = convertToTTIriRef(selectedResult.value);
  if (!result[key.value] && deleteEntityKey) {
    deleteEntityKey(key.value);
  } else if (entityUpdate && !props.shape.builderChild) entityUpdate(result);
}

function updateValueVariableMap(data: TTIriRef | undefined) {
  if (!props.shape.valueVariable) return;
  let mapKey = props.shape.valueVariable;
  if (props.shape.builderChild) mapKey = mapKey + props.shape.order;
  if (valueVariableMapUpdate) valueVariableMapUpdate(mapKey, data);
}

async function dropReceived(event: DragEvent) {
  const data = event.dataTransfer?.getData("conceptIri");
  if (data) {
    const conceptIri = JSON.parse(data);
    const conceptName = (await EntityService.getPartialEntity(conceptIri, [RDFS.LABEL]))[RDFS.LABEL];
    const iriRef = { "@id": conceptIri, name: conceptName } as TTIriRef;
    if (!queryRequest.value) await updateSelectedResult(iriRef);
    else if (await QueryService.validateSelectionWithQuery(conceptIri, queryRequest.value)) {
      await updateSelectedResult(iriRef);
    } else {
      toast.add({
        severity: ToastSeverity.WARN,
        summary: "Failed to set value",
        detail: "'" + conceptName + "' is not a valid value for this field",
        life: 3000
      });
    }
  }
}

function hasData() {
  invalid.value = false;
  validationErrorMessage.value = undefined;
  if (props.shape.minCount === 0 && !isObjectHasKeys(selectedResult.value)) return;
  if (!isObjectHasKeys(selectedResult.value)) {
    invalid.value = true;
    validationErrorMessage.value = "Entity is required";
  }
}
</script>

<style scoped>
.entity-search-item-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;
}

.label-container {
  flex: 1 1 auto;
  border-radius: var(--p-textarea-border-radius);
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  gap: 0.5rem;
}

.label {
  cursor: pointer;
  border: 1px solid var(--p-textarea-border-color);
  border-radius: var(--p-textarea-border-radius);
  background-color: var(--p-content-background);
  padding: 0.25rem;
}

.float-text {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.75rem;
  color: var(--p-text-color);
}

.search-text {
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1rem;
  padding: 4px 4px;
  margin: 0;
  color: var(--p-text-color);
  background: var(--p-content-background);
  border: 1px solid var(--p-textarea-border-color);
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
  appearance: none;
  border-radius: var(--p-textarea-border-radius);
  cursor: pointer;
  height: 2.7rem;
  display: flex;
  flex-flow: column;
  justify-content: center;
}

.validate-error {
  color: var(--p-red-500);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
}

.invalid {
  border: 1px solid var(--p-red-500);
}

.selected-label {
  padding-left: 0.5rem;
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
