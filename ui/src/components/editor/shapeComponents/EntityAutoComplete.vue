<template>
  <div class="autocomplete-container">
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
        >
          <template #item="slotProps">
            <div class="autocomplete-option" @mouseenter="showOptionsOverlay($event, slotProps.item)" @mouseleave="hideOptionsOverlay($event)">
              <span>{{ slotProps.item.name }}</span>
            </div>
          </template>
        </AutoComplete>
      </div>
      <small v-if="invalidAssociatedProperty" class="validate-error">Missing property for refinement. Please select a property first.</small>
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
import {inject, onBeforeUnmount, onMounted, PropType, Ref, ref, watch} from "vue";
import {AbortController} from "abortcontroller-polyfill/dist/cjs-ponyfill";
import _ from "lodash";
import {EditorMode} from "@im-library/enums";
import {getNamesAsStringFromTypes} from "@im-library/helpers/ConceptTypeMethods";
import {isArrayHasLength, isObject, isObjectHasKeys} from "@im-library/helpers/DataTypeCheckers";
import {processArguments} from "@im-library/helpers/EditorMethods";
import {isTTIriRef} from "@im-library/helpers/TypeGuards";
import {EntityService, QueryService} from "@/services";
import {IM, RDF, RDFS} from "@im-library/vocabulary";
import {PropertyShape} from "@im-library/models/AutoGen";
import {ConceptSummary, Query, QueryRequest, TTIriRef} from "@im-library/interfaces";
import injectionKeys from "@/injectionKeys/injectionKeys";
import router from "@/router";

const props = defineProps({
  shape: { type: Object as PropType<PropertyShape>, required: true },
  mode: { type: String as PropType<EditorMode>, required: true },
  value: { type: Object as PropType<TTIriRef>, required: false },
  disabled: { type: Boolean, required: false, default: false },
  position: { type: Number, required: false }
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
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const validityUpdate = inject(injectionKeys.editorValidity)?.updateValidity;
const valueVariableMap = inject(injectionKeys.valueVariableMap)?.valueVariableMap;
const valueVariableMapUpdate = inject(injectionKeys.valueVariableMap)?.updateValueVariableMap;

watch(
  () => _.cloneDeep(valueVariableMap?.value),
  async () => {
    await init();
  }
);

const miniSearchOP = ref();
const optionsOP = ref();

onMounted(async () => {
  await init();
});

let loading = ref(false);
let selectedResult: Ref<ConceptSummary | undefined> = ref();
let invalidAssociatedProperty = ref(false);
let invalid = ref(false);
let associatedProperty = ref("");
let controller: Ref<AbortController> = ref({} as AbortController);
let autocompleteOptions: Ref<ConceptSummary[]> = ref([]);
let key = ref("");
let hoveredResult: Ref<ConceptSummary> = ref({} as ConceptSummary);
let optionsOverlayLocation: Ref<any> = ref({});

onBeforeUnmount(() => {
  if (isObjectHasKeys(optionsOverlayLocation.value)) {
    hideOptionsOverlay(optionsOverlayLocation.value);
  }
});

watch(selectedResult, (newValue, oldValue) => {
  if (newValue && !_.isEqual(newValue, oldValue)) {
    itemSelected(newValue);
  }
});

async function init() {
  loading.value = true;
  if (isObjectHasKeys(props.shape, ["path"])) key.value = props.shape.path["@id"];
  getAssociatedProperty();
  await getAutocompleteOptions();
  if (props.value && isTTIriRef(props.value)) {
    const found = autocompleteOptions.value.find(option => option.name === props.value?.name);
    if (found) selectedResult.value = found;
  }
  loading.value = false;
}

function getAssociatedProperty() {
  if (isObjectHasKeys(props.shape, ["argument"])) {
    if (isArrayHasLength(props.shape.argument) && isObjectHasKeys(props.shape.argument[0], ["valueVariable"]) && props.shape.argument[0].valueVariable) {
      invalidAssociatedProperty.value = false;
      if (props.shape.builderChild) {
        if (
          valueVariableMap &&
          (valueVariableMap.value.has(props.shape.argument[0].valueVariable + props.shape.order) ||
            valueVariableMap.value.has(props.shape.argument[0].valueVariable))
        ) {
          if (valueVariableMap.value.has(props.shape.argument[0].valueVariable)) {
            associatedProperty.value = valueVariableMap.value.get(props.shape.argument[0].valueVariable);
          } else {
            associatedProperty.value = valueVariableMap.value.get(props.shape.argument[0].valueVariable + props.shape.order);
          }
        } else {
          invalidAssociatedProperty.value = true;
        }
      } else if (valueVariableMap && valueVariableMap.value.has(props.shape.argument[0].valueVariable)) {
        associatedProperty.value = valueVariableMap.value.get(props.shape.argument[0].valueVariable);
      } else {
        invalidAssociatedProperty.value = true;
      }
    } else if (isObjectHasKeys(props.shape.argument[0], ["valueIri"]) && props.shape.argument[0].valueIri) {
      associatedProperty.value = props.shape.argument[0].valueIri["@id"];
    } else {
      invalidAssociatedProperty.value = false;
    }
  } else {
    invalidAssociatedProperty.value = false;
  }
}

async function getAutocompleteOptions() {
  if (associatedProperty.value) {
    let queryRequest = {} as QueryRequest;
    let query = {} as Query;
    if (isObjectHasKeys(props.shape, ["select", "argument"])) {
      queryRequest.argument=processArguments(props.shape, valueVariableMap?.value);
      query["@id"] = props.shape.select[0]["@id"];
      queryRequest.query = query;
    } else {
      throw new Error("EntityAutoComplete is missing 'select' or 'argument' in propertyShape object");
    }
    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();
    if (controller.value) {
      if (queryRequest.query["@id"] === "http://endhealth.info/im#Query_AllowableRanges") {
        const propIri = queryRequest.argument[0].valueIri["@id"];
        if(propIri) {
          const data:TTIriRef[] = await EntityService.getPropertyType(router.currentRoute.value.params.selectedIri as string, propIri);
          if(data) {
            autocompleteOptions.value = convertToConceptSummary(data);
          }
        }
      } else {
        const result = await QueryService.queryIM(queryRequest, controller.value);
        if (result && isObjectHasKeys(result, ["entities"])) {
          autocompleteOptions.value = convertToConceptSummary(result.entities);
        }
      }
    }
  }
}

function convertToConceptSummary(results: any[]) {
  return results.map(result => {
    const conceptSummary = {} as ConceptSummary;
    conceptSummary.iri = result["@id"];
    conceptSummary.name = result[RDFS.LABEL];
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
    autocompleteOptions.value = autocompleteOptions.value.filter(option => option.name.toLocaleLowerCase().startsWith(event.query.toLocaleLowerCase()));
  }
}

async function itemSelected(value: ConceptSummary) {
  if (isObjectHasKeys(value)) {
    if (!props.shape.builderChild && key.value) {
      updateEntity(value);
      await updateValidity(value);
    } else {
      emit("updateClicked", summaryToTTIriRef(value));
    }
    updateValueVariableMap(value);
  }
}

function updateValueVariableMap(data: ConceptSummary) {
  if (!props.shape.valueVariable) return;
  let mapKey = props.shape.valueVariable;
  if (props.shape.builderChild) mapKey = mapKey + props.shape.order;
  if (valueVariableMapUpdate) valueVariableMapUpdate(mapKey, summaryToTTIriRef(data));
}

function summaryToTTIriRef(summary: ConceptSummary) {
  return { "@id": summary.iri, name: summary.name };
}

function updateEntity(value: ConceptSummary) {
  const result = {} as any;
  result[key.value] = summaryToTTIriRef(value);
  if (entityUpdate && !props.shape.builderChild) entityUpdate(result);
}

async function updateValidity(value: ConceptSummary) {
  if (isObjectHasKeys(props.shape, ["validation"]) && editorEntity) {
    invalid.value = !(await QueryService.checkValidation(props.shape.validation["@id"], editorEntity.value));
  } else {
    invalid.value = !defaultValidity();
  }
  if (validityUpdate) validityUpdate({ key: key, valid: !invalid.value });
}

function defaultValidity() {
  return true;
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
</script>

<style scoped>
.autocomplete-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
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
  flex: 0 1 auto;
  padding: 1rem;
  border-radius: 3px;
  position: relative;
  min-width: 15rem;
}

.label {
  cursor: pointer;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  background-color: #ffffff;
  padding: 0.25rem;
}

.float-text {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.75rem;
  color: #6c757d;
}

.search-input {
  width: 20rem;
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
  color: #e24c4c;
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
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
