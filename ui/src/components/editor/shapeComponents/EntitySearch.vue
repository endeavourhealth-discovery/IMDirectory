<template>
  <div class="entity-search-item-container">
    <div class="title-bar">
      <span v-if="shape.showTitle">{{ shape.name }}</span>
      <span v-if="showRequired" class="required">*</span>
    </div>
    <div class="label-container">
      <div
        type="text"
        @click="showDialog = true"
        class="search-text"
        v-tooltip="{ value: selectedResult?.name ?? '', class: 'entity-tooltip' }"
        @dragenter.prevent
        @dragover.prevent
        @drop="dropReceived"
        :class="invalid && showValidation && 'invalid'"
      >
        <div class="selected-label">{{ selectedResult?.name ?? "Search..." }}</div>
      </div>
      <DirectorySearchDialog v-model:show-dialog="showDialog" v-model:selected="selectedResult" :search-by-query="queryRequest" />
    </div>
    <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, ref, Ref, inject, ComputedRef, computed } from "vue";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import _ from "lodash-es";
import { TTIriRef, SearchResultSummary } from "@im-library/interfaces/AutoGen";
import { EditorMode, ToastSeverity } from "@im-library/enums";
import { isObjectHasKeys, isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { isTTIriRef } from "@im-library/helpers/TypeGuards";
import { QueryService, EntityService } from "@/services";
import { RDFS } from "@im-library/vocabulary";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { PropertyShape, Query, QueryRequest } from "@im-library/interfaces/AutoGen";
import { useEditorStore } from "@/stores/editorStore";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const editorStore = useEditorStore();

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  position?: number;
  value?: TTIriRef;
}

const props = defineProps<Props>();

const emit = defineEmits({
  updateClicked: (_payload: TTIriRef | undefined) => true
});

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const deleteEntityKey = inject(injectionKeys.editorEntity)?.deleteEntityKey;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const valueVariableMapUpdate = inject(injectionKeys.valueVariableMap)?.updateValueVariableMap;
const valueVariableMap = inject(injectionKeys.valueVariableMap)?.valueVariableMap;
const valueVariableHasChanged = inject(injectionKeys.valueVariableMap)?.valueVariableHasChanged;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;
const validationCheckStatus = inject(injectionKeys.forceValidation)?.validationCheckStatus;
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
    () => _.cloneDeep(valueVariableMap),
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
  () => _.cloneDeep(props.value),
  async (newValue, oldValue) => {
    if (!_.isEqual(newValue, oldValue)) await init();
  }
);

onMounted(async () => {
  await init();
});

const showRequired: ComputedRef<boolean> = computed(() => {
  if (props.shape.minCount && props.shape.minCount > 0) return true;
  else return false;
});

const loading = ref(false);
const selectedResult: Ref<SearchResultSummary | undefined> = ref();
const key = ref("");
const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const showValidation = ref(false);
const showDialog = ref(false);
const queryRequest: Ref<QueryRequest | undefined> = ref(undefined);

watch(selectedResult, (newValue, oldValue) => {
  if (newValue && !_.isEqual(newValue, oldValue)) updateSelectedResult(newValue);
});

async function init() {
  if (isObjectHasKeys(props.shape, ["path"])) key.value = props.shape.path!["@id"];
  if (isObjectHasKeys(props.shape, ["select"]) && isArrayHasLength(props.shape.select) && props.shape.select) {
    queryRequest.value = { query: { "@id": props.shape.select[0]["@id"] } };
  } else queryRequest.value = undefined;
  if (isObjectHasKeys(props.shape, ["argument"]) && isArrayHasLength(props.shape.argument) && props.shape.argument && queryRequest.value !== undefined) {
    queryRequest.value.argument = props.shape.argument;
  }
  if (props.value && isObjectHasKeys(props.value)) {
    updateSelectedResult(props.value);
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
  if (selectedResult.value) {
    const result = {} as any;
    result[key.value] = convertToTTIriRef(selectedResult.value);
    if (!result[key.value] && deleteEntityKey) deleteEntityKey(key.value);
    else if (entityUpdate && !props.shape.builderChild) entityUpdate(result);
  }
}

function updateValueVariableMap(data: TTIriRef | undefined) {
  if (!props.shape.valueVariable) return;
  let mapKey = props.shape.valueVariable;
  if (props.shape.builderChild) mapKey = mapKey + props.shape.order;
  if (valueVariableMapUpdate) valueVariableMapUpdate(mapKey, data);
}

async function dropReceived(event: any) {
  const data = event.dataTransfer.getData("conceptIri");
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
  border-radius: 3px;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  gap: 0.5rem;
}

.label {
  cursor: pointer;
  border: 1px solid var(--surface-border);
  border-radius: 3px;
  background-color: var(--surface-a);
  padding: 0.25rem;
}

.float-text {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.75rem;
  color: var(--text-color);
}

.search-text {
  flex: 1 1 auto;
  min-width: 25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1rem;
  padding: 4px 4px;
  margin: 0;
  color: var(--text-color);
  background: var(--surface-a);
  border: 1px solid var(--surface-border);
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
  appearance: none;
  border-radius: 3px;
  cursor: pointer;
  height: 2.7rem;
  display: flex;
  flex-flow: column;
  justify-content: center;
}

.validate-error {
  color: var(--red-500);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
}

.invalid {
  border: 1px solid var(--red-500);
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
  color: var(--red-500);
}
</style>
