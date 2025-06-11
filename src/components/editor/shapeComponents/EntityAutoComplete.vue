<template>
  <div class="autocomplete-container">
    <div class="title-bar">
      <span v-if="shape.showTitle">{{ shape.name }}</span>
      <span v-if="showRequired" class="required">*</span>
    </div>
    <div class="label-container">
      <div v-if="loading" class="loading-container">
        <ProgressSpinner style="width: 1.5rem; height: 1.5rem" strokeWidth="6" />
      </div>
      <div v-else class="input-treebutton-container">
        <AutoComplete
          ref="miniSearchInput"
          v-model="selectedResult"
          :suggestions="autocompleteOptions"
          @complete="searchOptions($event)"
          :dropdown="true"
          field="name"
          forceSelection
          placeholder="Search"
          :disabled="invalidAssociatedProperty || disabled"
          class="search-input"
          @drop.prevent
          :class="invalid && showValidation && 'invalid'"
        >
          <template #option="{ option }">
            <div class="autocomplete-option" @mouseenter="showOptionsOverlay($event, option)" @mouseleave="hideOptionsOverlay($event)">
              <span>{{ option.name }}</span>
            </div>
          </template>
        </AutoComplete>
      </div>
      <small v-if="invalidAssociatedProperty" class="validate-error">Missing property for refinement. Please select a property first.</small>
      <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
    </div>
  </div>
  <Popover class="options-op" ref="optionsOP" :dismissable="true" stype="width: 50vw" :breakpoints="{ '960px': '75vw' }">
    <div v-if="hoveredResult.name" class="justify-contents-start result-overlay flex flex-row" style="width: 100%; gap: 1rem">
      <div class="left-side" style="width: 50%">
        <p>
          <strong>Name: </strong>
          <span>{{ hoveredResult.name }}</span>
        </p>
        <p>
          <strong>Iri: </strong>
          <span style="word-break: break-all">{{ hoveredResult.iri }}</span>
        </p>
        <p v-if="hoveredResult.code">
          <strong>Code: </strong>
          <span>{{ hoveredResult.code }}</span>
        </p>
      </div>
      <div class="right-side" style="width: 50%">
        <p v-if="hoveredResult.status">
          <strong>Status: </strong>
          <span>{{ hoveredResult.status.name }}</span>
        </p>
        <p v-if="hoveredResult.scheme">
          <strong>Scheme: </strong>
          <span>{{ hoveredResult.scheme.name }}</span>
        </p>
        <p v-if="hoveredResult.type">
          <strong>Type: </strong>
          <span>{{ getNamesAsStringFromTypes(hoveredResult.type) }}</span>
        </p>
      </div>
    </div>
  </Popover>
</template>

<script setup lang="ts">
import { computed, ComputedRef, inject, onBeforeUnmount, onMounted, Ref, ref, watch } from "vue";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { cloneDeep, isEqual } from "lodash-es";
import { EditorMode } from "@/enums";
import { getNamesAsStringFromTypes } from "@/helpers/ConceptTypeMethods";
import { isArrayHasLength, isObject, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { processArguments } from "@/helpers/EditorMethods";
import { isTTIriRef } from "@/helpers/TypeGuards";
import { byName } from "@/helpers/Sorters";
import { DataModelService, QueryService } from "@/services";
import { IM, QUERY, RDF, RDFS } from "@/vocabulary";
import { TTIriRef, PropertyShape, QueryRequest, Query, SearchResultSummary } from "@/interfaces/AutoGen";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { AutoCompleteCompleteEvent } from "primevue/autocomplete";
import { TTEntity } from "@/interfaces/ExtendedAutoGen";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  position?: number;
  value?: TTIriRef;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
});

const emit = defineEmits<{
  updateClicked: [payload: TTIriRef];
}>();

watch(
  () => cloneDeep(props.value),
  async () => {
    await init();
  }
);

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const deleteEntityKey = inject(injectionKeys.editorEntity)?.deleteEntityKey;
const editorEntity = inject(injectionKeys.editorEntity)!.editorEntity;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const valueVariableMap = inject(injectionKeys.valueVariableMap)!.valueVariableMap;
const valueVariableMapUpdate = inject(injectionKeys.valueVariableMap)?.updateValueVariableMap;
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
  () => cloneDeep(valueVariableMap?.value),
  async () => {
    await init();
  }
);

const optionsOP = ref();

onMounted(async () => {
  await init();
});

const loading = ref(false);
const selectedResult: Ref<SearchResultSummary | undefined> = ref();
const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const associatedProperty = ref("");
const controller: Ref<AbortController> = ref({} as AbortController);
const autocompleteOptions: Ref<SearchResultSummary[]> = ref([]);
const key = ref("");
const hoveredResult: Ref<SearchResultSummary> = ref({} as SearchResultSummary);
const optionsOverlayLocation: Ref<any> = ref({});
const showValidation = ref(false);

const invalidAssociatedProperty: ComputedRef<boolean> = computed(
  () => validationErrorMessage.value === `Missing required related item: ${props.shape.argument![0].valueVariable}`
);

const showRequired: ComputedRef<boolean> = computed(() => {
  if (props.shape.minCount && props.shape.minCount > 0) return true;
  else return false;
});

onBeforeUnmount(() => {
  if (isObjectHasKeys(optionsOverlayLocation.value)) {
    hideOptionsOverlay(optionsOverlayLocation.value);
  }
});

watch(selectedResult, async (newValue, oldValue) => {
  if (newValue && typeof newValue !== "string" && !isEqual(newValue, oldValue)) {
    await itemSelected(newValue);
  }
});

async function init() {
  loading.value = true;
  if (isObjectHasKeys(props.shape, ["path"])) key.value = props.shape.path!.iri;
  getAssociatedProperty();
  if (autocompleteOptions.value.length === 0) {
    await getAutocompleteOptions();
  }
  if (props.value && isTTIriRef(props.value)) {
    const found = autocompleteOptions.value.find(option => option.name === props.value?.name);
    if (found) selectedResult.value = found;
  }
  loading.value = false;
}

function getAssociatedProperty() {
  if (isObjectHasKeys(props.shape, ["argument"])) {
    if (isArrayHasLength(props.shape.argument) && isObjectHasKeys(props.shape.argument![0], ["valueVariable"]) && props.shape.argument![0].valueVariable) {
      if (props.shape.builderChild) {
        if (
          valueVariableMap &&
          (valueVariableMap.value.has(props.shape.argument![0].valueVariable + props.shape.order) ||
            valueVariableMap.value.has(props.shape.argument![0].valueVariable))
        ) {
          if (valueVariableMap.value.has(props.shape.argument![0].valueVariable)) {
            associatedProperty.value = valueVariableMap.value.get(props.shape.argument![0].valueVariable);
          } else {
            associatedProperty.value = valueVariableMap.value.get(props.shape.argument![0].valueVariable + props.shape.order);
          }
        }
      } else if (valueVariableMap && valueVariableMap.value.has(props.shape.argument![0].valueVariable)) {
        associatedProperty.value = valueVariableMap.value.get(props.shape.argument![0].valueVariable);
      }
    } else if (isObjectHasKeys(props.shape.argument![0], ["valueIri"]) && props.shape.argument![0].valueIri) {
      associatedProperty.value = props.shape.argument![0].valueIri.iri;
    }
  }
}

async function getAutocompleteOptions() {
  if (associatedProperty.value) {
    let queryRequest = {} as QueryRequest;
    let query = {} as Query;
    if (isObjectHasKeys(props.shape, ["select", "argument"])) {
      queryRequest.argument = processArguments(props.shape, valueVariableMap?.value);
      query.iri = props.shape.select![0].iri;
      queryRequest.query = query;
    } else {
      throw new Error("EntityAutoComplete is missing 'select' or 'argument' in propertyShape object");
    }
    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();
    if (controller.value) {
      const result = await QueryService.queryIM(queryRequest, controller.value);
      if (result && isObjectHasKeys(result, ["entities"])) {
        autocompleteOptions.value = convertToConceptSummary(result.entities).sort(byName);
      }
    }
  } else {
    if (isArrayHasLength(props.shape.argument) && isObjectHasKeys(props.shape.argument![0], ["valueIri"]) && props.shape.argument![0].valueIri!.iri) {
      const range = await getPropertyRange(props.shape?.argument![0].valueIri!.iri);
      if (range.length !== 0) {
        autocompleteOptions.value = convertToConceptSummary(range);
      }
    }
  }
}

async function getPropertyRange(propIri: string): Promise<any[]> {
  const queryRequest = {
    argument: [
      {
        parameter: "ranges",
        valueIri: {
          iri: propIri
        }
      }
    ],
    query: {
      iri: QUERY.IS_ALLOWABLE_RANGE
    }
  } as QueryRequest;

  const response = await QueryService.queryIM(queryRequest);

  if (isObjectHasKeys(response, ["entities"]) && response.entities.length !== 0) {
    return response.entities;
  } else {
    const propType = await DataModelService.checkPropertyType(propIri);
    if (propType === IM.DATAMODEL_OBJECTPROPERTY) {
      queryRequest.query = { iri: QUERY.OBJECT_PROPERTY_RANGE_SUGGESTIONS } as Query;
      const suggestions = await QueryService.queryIM(queryRequest);
      suggestions.entities.push({
        iri: IM.CONCEPT,
        "http://www.w3.org/2000/01/rdf-schema#label": "Terminology concept"
      });
      return suggestions.entities;
    } else if (propType === IM.DATAMODEL_DATAPROPERTY) {
      queryRequest.query = { iri: QUERY.DATA_PROPERTY_RANGE_SUGGESTIONS } as Query;
      const dataTypes = await QueryService.queryIM(queryRequest);
      if (isObjectHasKeys(dataTypes, ["entities"]) && dataTypes.entities.length !== 0) {
        return dataTypes.entities;
      }
    }
    return [];
  }
}

function convertToConceptSummary(results: any[]) {
  return results.map(result => {
    const conceptSummary = {} as SearchResultSummary;
    conceptSummary.iri = result.iri;
    conceptSummary.name = result[RDFS.LABEL] ? result[RDFS.LABEL] : result.iri;
    conceptSummary.code = result[IM.CODE];
    conceptSummary.type = result[RDF.TYPE];
    conceptSummary.scheme = result[IM.HAS_SCHEME];
    conceptSummary.status = result[IM.HAS_STATUS];
    return conceptSummary;
  });
}

async function searchOptions(event: AutoCompleteCompleteEvent) {
  if (!event.query.trim().length) {
    await getAutocompleteOptions();
  } else {
    autocompleteOptions.value = autocompleteOptions.value.filter(option =>
      option.name?.toString().toLocaleLowerCase().startsWith(event.query.toLocaleLowerCase())
    );
  }
}

async function itemSelected(value: SearchResultSummary) {
  if (isObjectHasKeys(value)) {
    if (!props.shape.builderChild && key.value) {
      updateEntity(value);
      if (updateValidity) {
        if (props.shape.builderChild) {
          hasData();
        } else {
          await updateValidity(props.shape, editorEntity, valueVariableMap, key.value, invalid, validationErrorMessage);
        }
        showValidation.value = true;
      }
    } else {
      emit("updateClicked", summaryToTTIriRef(value) as TTIriRef);
    }
    updateValueVariableMap(value);
  } else if (!props.shape.builderChild && deleteEntityKey) deleteEntityKey(key.value);
}

function updateValueVariableMap(data: SearchResultSummary) {
  if (!props.shape.valueVariable) return;
  let mapKey = props.shape.valueVariable;
  if (props.shape.builderChild) mapKey = mapKey + props.shape.order;
  if (valueVariableMapUpdate) valueVariableMapUpdate(mapKey, summaryToTTIriRef(data));
}

function summaryToTTIriRef(summary: SearchResultSummary): TTIriRef {
  return { iri: summary.iri, name: summary.name } as TTIriRef;
}

function updateEntity(value: SearchResultSummary) {
  const result = {} as TTEntity;
  result[key.value] = summaryToTTIriRef(value);
  if (entityUpdate && !props.shape.builderChild) entityUpdate(result);
}

function showOptionsOverlay(event: MouseEvent, data?: SearchResultSummary) {
  if (data) {
    optionsOverlayLocation.value = event;
    optionsOP.value.show(optionsOverlayLocation.value);
    hoveredResult.value = data;
  }
}

function hideOptionsOverlay(event: MouseEvent): void {
  optionsOP.value.hide(event);
  optionsOverlayLocation.value = {};
}

function hasData() {
  invalid.value = false;
  validationErrorMessage.value = undefined;
  if (props.shape.minCount === 0 && !selectedResult.value) return;
  if (!selectedResult.value) {
    invalid.value = true;
    validationErrorMessage.value = props.shape.validationErrorMessage ?? "Entity required.";
  }
}
</script>

<style scoped>
.autocomplete-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;
}

.loading-container {
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.label-container {
  width: 100%;
  flex: 1 1 auto;
  border-radius: var(--p-textarea-border-radius);
  position: relative;
  min-width: 15rem;
}

.label {
  cursor: pointer;
  border: 1px solid var(--p-textarea-border-color);
  border-radius: var(--p-textarea-border-radius);
  background-color: var(--p-content-background);
  padding: 0.25rem;
}

.search-input {
  flex: 1 1 auto;
  min-width: 19rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.input-treebutton-container {
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
}

.validate-error {
  color: var(--p-red-500);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
}

.invalid {
  border: 1px solid var(--p-red-500);
}

.autocomplete-option {
  all: unset;
  z-index: -999;
}
.result-overlay {
  all: unset;
  z-index: 999;
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
