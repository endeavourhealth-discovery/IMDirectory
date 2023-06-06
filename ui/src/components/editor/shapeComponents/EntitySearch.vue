<template>
  <div class="entity-search-item-container">
    <label v-if="shape.showTitle">{{ shape.name }}</label>
    <div class="label-container">
      <InputText
        ref="miniSearchInput"
        type="text"
        v-model="searchTerm"
        @input="debounceForSearch"
        @keyup.enter="search"
        @focus="showOverlay"
        @change="showOverlay"
        placeholder="Search"
        class="p-inputtext search-input"
        autoWidth="true"
        v-tooltip="{ value: selectedResult.name ?? '', class: 'entity-tooltip' }"
        @dragenter.prevent
        @dragover.prevent
        @drop="dropReceived"
      />
      <Button :disabled="!selectedResult['@id']" icon="fa-solid fa-sitemap" @click="findInTree(selectedResult['@id'])" />
    </div>
  </div>
  <OverlayPanel class="search-op" ref="miniSearchOP" :showCloseIcon="true" :dismissable="true">
    <SearchMiniOverlay :searchTerm="searchTerm" :searchResults="searchResults" :loading="loading" @searchResultSelected="updateSelectedResult" />
  </OverlayPanel>
</template>

<script setup lang="ts">
import { PropType, watch, onMounted, ref, Ref, inject } from "vue";
import SearchMiniOverlay from "@/components/editor/shapeComponents/SearchMiniOverlay.vue";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import _ from "lodash";
import { ConceptSummary } from "@im-library/interfaces";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { EditorMode } from "@im-library/enums";
import { isObjectHasKeys, isObject } from "@im-library/helpers/DataTypeCheckers";
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
const validityUpdate = inject(injectionKeys.editorValidity)?.updateValidity;
const valueVariableMapUpdate = inject(injectionKeys.valueVariableMap)?.updateValueVariableMap;

watch(
  () => _.cloneDeep(props.value),
  async () => {
    await init();
  }
);

onMounted(async () => {
  await init();
});

let loading = ref(false);
let controller: Ref<AbortController> = ref({} as AbortController);
let selectedResult: Ref<TTIriRef> = ref({} as TTIriRef);
let searchTerm = ref("");
let searchResults: Ref<ConceptSummary[]> = ref([]);
let label = ref("");
let key = ref("");
let invalid = ref(false);
let debounce = ref(0);

const miniSearchOP = ref();

watch(
  () => searchTerm.value,
  () => {
    if (searchTerm.value === "") {
      hideOverlay();
    }
  }
);

async function init() {
  if (isObjectHasKeys(props.shape, ["path"])) key.value = props.shape.path!["@id"];
  if (props.value && isObjectHasKeys(props.value, ["name", "@id"])) {
    updateSelectedResult(props.value);
    await search();
  } else {
    selectedResult.value = {} as TTIriRef;
    searchTerm.value = "";
  }
  label.value = props.shape.name as string;
}

function debounceForSearch(): void {
  clearTimeout(debounce.value);
  debounce.value = window.setTimeout(() => {
    search();
  }, 600);
}

async function search(): Promise<void> {
  if (searchTerm.value.length > 2) {
    loading.value = true;
    let queryRequest = {} as QueryRequest;
    let query = {} as Query;
    if (isObjectHasKeys(props.shape, ["select", "argument"])) {
      queryRequest.argument = processArguments(props.shape);
      queryRequest.textSearch = searchTerm.value;
      query["@id"] = props.shape.select![0]["@id"];
      queryRequest.query = query;
    }
    if (isObjectHasKeys(props.shape, ["select"])) {
      queryRequest.textSearch = searchTerm.value;
      query["@id"] = props.shape.select![0]["@id"];
      queryRequest.query = query;
    }
    if (!isObjectHasKeys(query, ["@id"])) throw new Error("No query iri found for entity search");

    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();
    if (controller.value) {
      const result = await QueryService.queryIM(queryRequest, controller.value);
      if (result && isObjectHasKeys(result, ["entities"])) {
        searchResults.value = convertToConceptSummary(result.entities);
      } else searchResults.value = [];
    }
    loading.value = false;
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

function hideOverlay(): void {
  const x = miniSearchOP.value as any;
  if (x) x.hide();
}

function showOverlay(event: any): void {
  const x = miniSearchOP.value as any;
  if (searchTerm.value !== "") x.show(event, event.target);
}

async function updateSelectedResult(data: ConceptSummary | TTIriRef) {
  if (!isObjectHasKeys(data)) {
    selectedResult.value = {} as TTIriRef;
    searchTerm.value = "";
  } else if (isTTIriRef(data)) {
    selectedResult.value = data;
    searchTerm.value = data.name as string;
  } else {
    selectedResult.value = { "@id": data.iri, name: data.name } as TTIriRef;
    searchTerm.value = data.name;
  }
  if (!props.shape.builderChild && key.value) {
    updateEntity();
  } else {
    emit("updateClicked", selectedResult.value);
  }
  await updateValidity();
  updateValueVariableMap(selectedResult.value);
  hideOverlay();
}

function updateEntity() {
  const result = {} as any;
  result[key.value] = selectedResult.value;
  if (entityUpdate && !props.shape.builderChild) entityUpdate(result);
}

function updateValueVariableMap(data: TTIriRef) {
  if (!props.shape.valueVariable) return;
  let mapKey = props.shape.valueVariable;
  if (props.shape.builderChild) mapKey = mapKey + props.shape.order;
  if (valueVariableMapUpdate) valueVariableMapUpdate(mapKey, data);
}

async function updateValidity() {
  if (isObjectHasKeys(props.shape, ["validation"]) && editorEntity) {
    invalid.value = !(await QueryService.checkValidation(props.shape.validation!["@id"], editorEntity.value));
  } else {
    invalid.value = !defaultValidity();
  }
  if (validityUpdate) validityUpdate({ key: key, valid: !invalid.value });
}

function defaultValidity() {
  return isTTIriRef(selectedResult.value);
}

function findInTree(iri: string) {
  if (iri) editorStore.updateFindInEditorTreeIri(iri);
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

.search-input {
  flex: 1 1 auto;
  min-width: 25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
