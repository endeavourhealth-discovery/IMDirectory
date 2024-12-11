<template>
  <div id="dataset-query-definition-builder">
    <div v-if="loading" class="flex">
      <ProgressSpinner />
    </div>
    <div v-else :class="showValidation && invalid && 'invalid'">
      <div>Base query:</div>
      <AutocompleteSearchBar v-model:selected="selectedBaseQuery" :im-query="imQueryForBaseQuery" :root-entities="[IM.MODULE_QUERIES]" />
      <div id="return-builder">
        <span v-if="!selectedBaseQuery">Please select a base query</span>
        <div v-else-if="baseQueryReturnType">
          <div>Base return type: {{ baseQueryReturnType.name }}</div>
          <Button label="Add column" @click="showAddColumnDialog = true" />
        </div>
      </div>
    </div>
    <SearchPropertiesDialog v-if="baseQueryReturnType" :baseQueryReturnType="baseQueryReturnType" v-model:showDialog="showAddColumnDialog" />
  </div>
</template>

<script setup lang="ts">
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { EditorMode } from "@/enums";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { buildIMQueryFromFilters } from "@/helpers/IMQueryBuilder";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { SearchOptions } from "@/interfaces";
import { Match, PropertyShape, Query, QueryRequest, Return, SearchResultSummary, TTIriRef } from "@/interfaces/AutoGen";
import { QueryService } from "@/services";
import { IM } from "@/vocabulary";
import { cloneDeep } from "lodash-es";
import { inject, onMounted, Ref, ref, watch } from "vue";
import SearchPropertiesDialog from "./datasetQueryBuilder/SearchPropertiesDialog.vue";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: any;
}

const props = defineProps<Props>();

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;
const deleteEntityKey = inject(injectionKeys.editorEntity)?.deleteEntityKey;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const updateValidationCheckStatus = inject(injectionKeys.forceValidation)?.updateValidationCheckStatus;
const valueVariableMap = inject(injectionKeys.valueVariableMap)?.valueVariableMap;
if (forceValidation) {
  watch(forceValidation, async () => {
    if (updateValidity) {
      await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
      if (updateValidationCheckStatus) updateValidationCheckStatus(key);
      showValidation.value = true;
    }
  });
}

const loading = ref(true);
const datasetQueryMatch: Ref<Match | undefined> = ref();
const datasetQueryReturns: Ref<Query[] | undefined> = ref();
const validationErrorMessage: Ref<string | undefined> = ref();
const invalid = ref(false);
const showValidation = ref(false);
const selectedBaseQuery: Ref<SearchResultSummary | undefined> = ref();
const imQueryForBaseQuery: Ref<QueryRequest | undefined> = ref();
const baseQueryReturnType: Ref<TTIriRef | undefined> = ref();
const showAddColumnDialog = ref(false);

const key = props.shape.path["@id"];

watch([() => cloneDeep(datasetQueryMatch.value), () => cloneDeep(datasetQueryReturns.value)], async ([newValueMatch, newValueReturn]) => {
  updateEntity();
  if (updateValidity && valueVariableMap) {
    if (newValueMatch || newValueReturn) {
      await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
    }
  }
});

watch(selectedBaseQuery, async newValue => {
  if (newValue) {
    baseQueryReturnType.value = await QueryService.getReturnType(newValue.iri);
  }
});

onMounted(async () => {
  loading.value = true;
  await init();
  loading.value = false;
});

async function init() {
  if (props.value) {
    const definition = JSON.parse(props.value);
    if (isObjectHasKeys(definition, ["match"])) {
      datasetQueryMatch.value = definition.match;
      if (definition.match?.[0]?.instanceOf?.[0]?.["@id"]) {
        selectedBaseQuery.value = { iri: definition.match[0].instanceOf[0]["@id"], name: definition.match[0].instanceOf[0].name } as SearchResultSummary;
      } else {
        selectedBaseQuery.value = undefined;
      }
    } else {
      datasetQueryMatch.value = { match: [] };
      selectedBaseQuery.value = undefined;
    }
    if (isObjectHasKeys(definition, ["query"])) {
      datasetQueryReturns.value = definition.query;
    } else {
      datasetQueryReturns.value = [];
    }
  } else {
    generateDefaultDefinition();
  }
  buildIMQueryForBaseQuery();
}

function buildIMQueryForBaseQuery() {
  const searchOptions: SearchOptions = {
    status: [{ "@id": IM.ACTIVE }, { "@id": IM.DRAFT }],
    types: [{ "@id": IM.COHORT_QUERY }]
  } as SearchOptions;
  imQueryForBaseQuery.value = buildIMQueryFromFilters(searchOptions);
}

function generateDefaultDefinition() {
  datasetQueryMatch.value = { match: [] };
  datasetQueryReturns.value = [];
}

function updateEntity() {
  if (!isArrayHasLength(datasetQueryMatch.value?.match) && !isArrayHasLength(datasetQueryReturns.value)) {
    if (deleteEntityKey) deleteEntityKey(key);
  } else {
    const datasetQuery: Query = {};
    if (isArrayHasLength(datasetQueryMatch.value?.match)) datasetQuery.match = cloneDeep(datasetQueryMatch.value?.match);
    if (isArrayHasLength(datasetQueryReturns.value)) datasetQuery.query = cloneDeep(datasetQueryReturns.value);
    const imDefinition: any = {};
    imDefinition[IM.DEFINITION] = JSON.stringify(datasetQuery);
    if (entityUpdate) entityUpdate(imDefinition);
  }
}
</script>

<style scoped>
.invalid {
  border: 1px solid var(--p-red-500);
  border-radius: 5px;
  padding: 0.25rem;
}
</style>
