<template>
  <div class="autocomplete-container">
    <label v-if="shape.showTitle" for="name">{{ shape.name }}</label>
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
          <template #item="{ item }: any">
            <div class="autocomplete-option" @mouseenter="showOptionsOverlay($event, item)" @mouseleave="hideOptionsOverlay($event)">
              <span>{{ item.name }}</span>
            </div>
          </template>
        </AutoComplete>
      </div>
      <small v-if="invalidAssociatedProperty" class="validate-error">Missing property for refinement. Please select a property first.</small>
      <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
    </div>
  </div>
  <OverlayPanel class="options-op" ref="optionsOP" :dismissable="true" stype="width: 50vw" :breakpoints="{ '960px': '75vw' }">
    <div v-if="hoveredResult.name" class="flex flex-row justify-contents-start result-overlay" style="width: 100%; gap: 1rem">
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
        <p v-if="hoveredResult.entityType">
          <strong>Type: </strong>
          <span>{{ getNamesAsStringFromTypes(hoveredResult.entityType) }}</span>
        </p>
      </div>
    </div>
  </OverlayPanel>
</template>

<script setup lang="ts">
import { computed, ComputedRef, inject, onBeforeUnmount, onMounted, PropType, Ref, ref, watch } from "vue";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import _ from "lodash";
import { EditorMode } from "@im-library/enums";
import { getNamesAsStringFromTypes } from "@im-library/helpers/ConceptTypeMethods";
import { isArrayHasLength, isObject, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { processArguments } from "@im-library/helpers/EditorMethods";
import { isTTIriRef } from "@im-library/helpers/TypeGuards";
import { byName } from "@im-library/helpers/Sorters";
import { QueryService } from "@/services";
import { IM, RDF, RDFS, SHACL } from "@im-library/vocabulary";
import { ConceptSummary } from "@im-library/interfaces";
import { TTIriRef, PropertyShape, QueryRequest, Query } from "@im-library/interfaces/AutoGen";
import injectionKeys from "@/injectionKeys/injectionKeys";

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

watch(
  () => _.cloneDeep(props.value),
  async () => {
    await init();
  }
);

const emit = defineEmits({
  updateClicked: (_payload: TTIriRef) => true
});

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const deleteEntityKey = inject(injectionKeys.editorEntity)?.deleteEntityKey;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const valueVariableMap = inject(injectionKeys.valueVariableMap)?.valueVariableMap;
const valueVariableMapUpdate = inject(injectionKeys.valueVariableMap)?.updateValueVariableMap;
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
    async () => {
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

watch(
  () => _.cloneDeep(valueVariableMap?.value),
  async () => {
    await init();
  }
);

const optionsOP = ref();

onMounted(async () => {
  await init();
});

const loading = ref(false);
const selectedResult: Ref<ConceptSummary | undefined> = ref();
const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const associatedProperty = ref("");
const controller: Ref<AbortController> = ref({} as AbortController);
const autocompleteOptions: Ref<ConceptSummary[]> = ref([]);
const key = ref("");
const hoveredResult: Ref<ConceptSummary> = ref({} as ConceptSummary);
const optionsOverlayLocation: Ref<any> = ref({});
const showValidation = ref(false);

const invalidAssociatedProperty: ComputedRef<boolean> = computed(
  () => validationErrorMessage.value === `Missing required related item: ${props.shape.argument![0].valueVariable}`
);

onBeforeUnmount(() => {
  if (isObjectHasKeys(optionsOverlayLocation.value)) {
    hideOptionsOverlay(optionsOverlayLocation.value);
  }
});

watch(selectedResult, (newValue, oldValue) => {
  if (newValue && typeof newValue !== "string" && !_.isEqual(newValue, oldValue)) {
    itemSelected(newValue);
  }
});

async function init() {
  loading.value = true;
  if (isObjectHasKeys(props.shape, ["path"])) key.value = props.shape.path!["@id"];
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
      associatedProperty.value = props.shape.argument![0].valueIri["@id"];
    }
  }
}

async function getAutocompleteOptions() {
  if (associatedProperty.value) {
    let queryRequest = {} as QueryRequest;
    let query = {} as Query;
    if (isObjectHasKeys(props.shape, ["select", "argument"])) {
      queryRequest.argument = processArguments(props.shape, valueVariableMap?.value);
      query["@id"] = props.shape.select![0]["@id"];
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
    if (isArrayHasLength(props.shape.argument) && isObjectHasKeys(props.shape.argument![0], ["valueIri"]) && props.shape.argument![0].valueIri!["@id"]) {
      const range = await QueryService.getPropertyRange(props.shape?.argument![0].valueIri!["@id"]);
      if (range.length !== 0) {
        autocompleteOptions.value = convertToConceptSummary(range);
      }
    }
  }
}

function convertToConceptSummary(results: any[]) {
  return results.map(result => {
    const conceptSummary = {} as ConceptSummary;
    conceptSummary.iri = result["@id"];
    conceptSummary.name = result[RDFS.LABEL] ? result[RDFS.LABEL] : result["@id"];
    conceptSummary.code = result[IM.CODE];
    conceptSummary.entityType = result[RDF.TYPE];
    conceptSummary.scheme = result[IM.SCHEME];
    conceptSummary.status = result[IM.HAS_STATUS];
    return conceptSummary;
  });
}

function searchOptions(event: any) {
  if (!event.query.trim().length) {
    getAutocompleteOptions();
  } else {
    autocompleteOptions.value = autocompleteOptions.value.filter(option =>
      option.name.toString().toLocaleLowerCase().startsWith(event.query.toLocaleLowerCase())
    );
  }
}

async function itemSelected(value: ConceptSummary) {
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
  } else if (!props.shape.builderChild && deleteEntityKey) deleteEntityKey(key);
}

function updateValueVariableMap(data: ConceptSummary) {
  if (!props.shape.valueVariable) return;
  let mapKey = props.shape.valueVariable;
  if (props.shape.builderChild) mapKey = mapKey + props.shape.order;
  if (valueVariableMapUpdate) valueVariableMapUpdate(mapKey, summaryToTTIriRef(data));
}

function summaryToTTIriRef(summary: ConceptSummary): TTIriRef {
  return { "@id": summary.iri, name: summary.name } as TTIriRef;
}

function updateEntity(value: ConceptSummary) {
  const result = {} as any;
  result[key.value] = summaryToTTIriRef(value);
  if (entityUpdate && !props.shape.builderChild) entityUpdate(result);
}

function showOptionsOverlay(event: any, data?: any) {
  if (data) {
    optionsOverlayLocation.value = event;
    optionsOP.value.show(optionsOverlayLocation.value);
    hoveredResult.value = data;
  }
}

function hideOptionsOverlay(event: any): void {
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
  border-radius: 3px;
  position: relative;
  min-width: 15rem;
}

.label {
  cursor: pointer;
  border: 1px solid var(--surface-border);
  border-radius: 3px;
  background-color: var(--surface-a);
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
  color: var(--red-500);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
}

.invalid {
  border: 1px solid var(--red-500);
}

.autocomplete-option {
  all: unset;
  z-index: -999;
}
.result-overlay {
  all: unset;
  z-index: 999;
}
</style>
