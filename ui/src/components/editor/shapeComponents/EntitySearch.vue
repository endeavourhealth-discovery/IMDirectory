<template>
  <div class="entity-search-item-container">
    <label v-if="shape.showTitle">{{ shape.name }}</label>
    <div class="label-container">
      <div
        type="text"
        @click="showDialog = true"
        class="search-text"
        v-tooltip="{ value: selectedResult.name ?? '', class: 'entity-tooltip' }"
        @dragenter.prevent
        @dragover.prevent
        @drop="dropReceived"
        :class="invalid && showValidation && 'invalid'"
      >
        {{ selectedResult.name ?? "Search..." }}
      </div>
      <DirectorySearchDialog v-model:show-dialog="showDialog" v-model:selected="selectedResult" :search-by-query="queryRequest" />
    </div>
    <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
  </div>
</template>

<script setup lang="ts">
import { PropType, watch, onMounted, ref, Ref, inject } from "vue";
import SearchMiniOverlay from "@/components/editor/shapeComponents/SearchMiniOverlay.vue";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import _ from "lodash";
import { ConceptSummary } from "@im-library/interfaces";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { EditorMode } from "@im-library/enums";
import { isObjectHasKeys, isObject, isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { isTTIriRef } from "@im-library/helpers/TypeGuards";
import { processArguments } from "@im-library/helpers/EditorMethods";
import { mapToObject } from "@im-library/helpers/Transforms";
import { QueryService, EntityService } from "@/services";
import { IM, RDF, RDFS } from "@im-library/vocabulary";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { PropertyShape, Query, QueryRequest } from "@im-library/interfaces/AutoGen";
import { useEditorStore } from "@/stores/editorStore";

const editorStore = useEditorStore();

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  position?: number;
  value?: TTIriRef;
}

const props = defineProps<Props>();

const emit = defineEmits({
  updateClicked: (_payload: TTIriRef) => true
});

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const valueVariableMapUpdate = inject(injectionKeys.valueVariableMap)?.updateValueVariableMap;
const valueVariableMap = inject(injectionKeys.valueVariableMap)?.valueVariableMap;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;
const validationCheckStatus = inject(injectionKeys.forceValidation)?.validationCheckStatus;
const updateValidationCheckStatus = inject(injectionKeys.forceValidation)?.updateValidationCheckStatus;
if (forceValidation) {
  watch(forceValidation, async () => {
    if (forceValidation && updateValidity) {
      await updateValidity(props.shape, editorEntity, valueVariableMap, key.value, invalid, validationErrorMessage);
      if (updateValidationCheckStatus) updateValidationCheckStatus(key.value);
      showValidation.value = true;
    }
  });
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

const loading = ref(false);
const selectedResult: Ref<ConceptSummary> = ref({} as ConceptSummary);
const label = ref("");
const key = ref("");
const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const showValidation = ref(false);
const showDialog = ref(false);
const queryRequest: Ref<QueryRequest | undefined> = ref(undefined);

watch( selectedResult, (newValue, oldValue) => {
  if(newValue && !_.isEqual(newValue, oldValue)) updateSelectedResult(newValue)
})

async function init() {
  if (isObjectHasKeys(props.shape, ["path"])) key.value = props.shape.path!["@id"];
  if (isObjectHasKeys(props.shape, ["select"]) && isArrayHasLength(props.shape.select) && props.shape.select) {
    queryRequest.value = { query: { "@id": props.shape.select[0]["@id"] } };
  } else queryRequest.value = undefined;
  if (props.value && isObjectHasKeys(props.value, ["name", "@id"])) {
    updateSelectedResult(props.value);
  } else {
    selectedResult.value = {} as ConceptSummary;
  }
  label.value = props.shape.name as string;
}

function convertToTTIriRef(data: ConceptSummary): TTIriRef {
  return { "@id": data.iri, name: data.name } as TTIriRef;
}

async function updateSelectedResult(data: ConceptSummary | TTIriRef) {
  if (!isObjectHasKeys(data)) {
    selectedResult.value = {} as ConceptSummary;
  } else if (isTTIriRef(data)) {
    const asSummary = await EntityService.getEntitySummary(data["@id"]);
    selectedResult.value = asSummary ?? ({} as ConceptSummary);
  } else {
    selectedResult.value = data;
  }
  if (!props.shape.builderChild && key.value) {
    updateEntity();
  } else {
    emit("updateClicked", convertToTTIriRef(selectedResult.value));
  }
  if (updateValidity) {
    await updateValidity(props.shape, editorEntity, valueVariableMap, key.value, invalid, validationErrorMessage);
    showValidation.value = true;
  }
  updateValueVariableMap(convertToTTIriRef(selectedResult.value));
}

function updateEntity() {
  const result = {} as any;
  result[key.value] = convertToTTIriRef(selectedResult.value);
  if (entityUpdate && !props.shape.builderChild) entityUpdate(result);
}

function updateValueVariableMap(data: TTIriRef) {
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
    await updateSelectedResult(iriRef);
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
  font-size: 1.25rem;
  padding: 0.625rem 0.625rem;
  margin: 0;
  color: var(--text-color);
  background: var(--surface-a);
  border: 1px solid var(--surface-border);
  transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
  appearance: none;
  border-radius: 3px;
  cursor: pointer;
}

.validate-error {
  color: var(--red-500);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
}

.invalid {
  border: 1px solid var(--red-500);
}
</style>
