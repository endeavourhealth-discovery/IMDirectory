<template>
  <Dialog header="Run quick query" v-model:visible="visible" maximizable>
    <div class="flex flex-column" id="query-param-wrapper">
      <div v-for="param in params" class="flex flex-column" id="param-input">
        <span id="param-header">{{ param.name }}</span>
        <InputText v-if="XSD.STRING === param.type" v-tooltip="param.desc" type="text" v-model="param.value" class="param-value" />
        <AutoComplete
          v-else
          :multiple="param.maxCount > 1"
          v-tooltip="param.desc"
          :suggestions="suggestions"
          option-label="name"
          v-model="param.value"
          @complete="debounceForSearch"
        />
      </div>

      <Button label="Run" @click="testQuery()" autofocus />

      <div v-if="queryLoading" class="flex flex-row justify-contents-center align-items-center">
        <ProgressSpinner />
      </div>
      <div v-else-if="!queryLoading && isObjectHasKeys(queryResults, ['entities'])">
        <DataTable :value="queryResults.entities" class="flex flex-column" scrollHeight="flex" tableStyle="min-width: 50rem">
          <template #header>
            <div class="flex flex-wrap align-items-center justify-content-between gap-2">
              <span class="text-xl text-900 font-bold">Results: {{ queryResults.entities.length }}</span>
            </div>
          </template>
          <template #loading> Loading data. Please wait. </template>
          <template #empty> No results found. </template>
          <Column v-for="col of cols" :key="col.field" :field="col.field" :header="col.field"> </Column>
        </DataTable>
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" icon="fa-duotone fa-ban" severity="secondary" @click="visible = false" />
      <Button label="Clear" icon="fa-duotone fa-ban" severity="warning" @click="clearResults()" />
      <Button
        label="Download"
        icon="fa-duotone fa-ban fa-download"
        severity="help"
        @click="onDownload"
        :disabled="!isObjectHasKeys(queryResults, ['entities']) || !isArrayHasLength(queryResults.entities)"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, Ref, computed, ComputedRef, watch, onMounted } from "vue";
import { QueryRequest, Argument, TTIriRef, Query, SearchResultSummary } from "@im-library/interfaces/AutoGen";
import AutoComplete from "primevue/autocomplete";
import { EntityService, QueryService } from "@/services";
import { isArrayHasLength, isObject, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { FilterOptions, QueryResponse } from "@im-library/interfaces";
import { useFilterStore } from "@/stores/filterStore";
import setupDownloadFile from "@/composables/downloadFile";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";
import { useToast } from "primevue/usetoast";
import { IM, RDFS, SHACL, XSD } from "@im-library/vocabulary";
import { cloneDeep } from "lodash";

interface Param {
  name: string;
  desc: string;
  type: string;
  minCount: number;
  maxCount: number;
  value: any;
}

interface Props {
  queryIri?: string;
  query?: Query;
  showDialog: boolean;
}

const props = defineProps<Props>();

const filterStore = useFilterStore();
const controller: Ref<AbortController> = ref({} as AbortController);
const queryLoading: Ref<boolean> = ref(false);
const debounce = ref(0);
const filterDefaults: ComputedRef<FilterOptions> = computed(() => filterStore.filterDefaults);
const suggestions: Ref<SearchResultSummary[]> = ref([]);
const toast = useToast();
const visible = ref(false);
const { downloadFile } = setupDownloadFile(window, document);
const params: Ref<Param[]> = ref([]);
const queryResults: Ref<QueryResponse> = ref({} as QueryResponse);
const cols: Ref<{ field: string }[]> = ref([]);

const emit = defineEmits({
  "update:showDialog": (_payload: boolean) => true
});

watch(
  () => props.showDialog,
  newValue => {
    visible.value = newValue;
  }
);

watch(visible, newValue => {
  if (!newValue) {
    emit("update:showDialog", newValue);
  }
});

watch(
  () => props.queryIri,
  async () => await init()
);

watch(
  () => cloneDeep(props.query),
  async () => await init()
);

onMounted(async () => await init());

async function init() {
  params.value = await getParams();
}

function clearResults() {
  queryResults.value = { entities: [], "@context": {} };
}

async function getQueryRequest() {
  const request = {} as QueryRequest;

  if (props.queryIri) {
    const entity = await EntityService.getPartialEntity(props.queryIri, [IM.DEFINITION]);
    if (isObjectHasKeys(entity, [IM.DEFINITION])) request.query = JSON.parse(entity[IM.DEFINITION]);
  } else if (props.query) {
    request.query = props.query;
  }

  return request;
}

function addArguments(queryRequest: QueryRequest) {
  queryRequest.argument = [];
  for (const param of params.value) {
    if ("Text search" === param.name) {
      if (param.value) queryRequest.textSearch = param.value;
    } else {
      const argument = {
        parameter: param.name
      } as Argument;

      if (isArrayHasLength(param.value)) {
        argument.valueIriList = (param.value as SearchResultSummary[]).map(summary => {
          return { "@id": summary.iri, name: summary.name } as TTIriRef;
        });
      } else {
        argument.valueIri = { "@id": param.value.iri, name: param.value.name } as TTIriRef;
      }
      queryRequest.argument.push(argument);
    }
  }
}

async function search(searchTerm: any) {
  if (!isObject(controller.value)) {
    controller.value.abort();
  }
  controller.value = new AbortController();
  const response = await EntityService.simpleSearch(searchTerm.query, filterDefaults.value, controller.value);
  suggestions.value = response.entities ? response.entities : [];
}

function debounceForSearch(searchTerm: any): void {
  clearTimeout(debounce.value);
  debounce.value = window.setTimeout(() => {
    search(searchTerm);
  }, 600);
}

async function testQuery() {
  queryLoading.value = true;
  try {
    const queryRequest = await getQueryRequest();
    addArguments(queryRequest);
    queryResults.value = await QueryService.queryIM(queryRequest);
    if (isObjectHasKeys(queryResults.value, ["entities"]) && isArrayHasLength(queryResults.value.entities))
      cols.value = getCols(queryResults.value.entities[0]);
    if (cols.value.some(col => col.field !== RDFS.LABEL)) {
      await addNamesToResults(queryResults.value.entities);
      cols.value.push({ field: "name" });
    }
  } catch (error: any) {
    if (error?.response?.data) toast.add(new ToastOptions(ToastSeverity.ERROR, "An error occurred: " + error?.response?.data.debugMessage));
  }

  queryLoading.value = false;
}

async function addNamesToResults(entities: any[]) {
  const results = await EntityService.getNames(entities.map(entity => entity["@id"]));
  if (isArrayHasLength(results))
    for (const namedEntity of results) {
      const found = entities.find(entity => entity["@id"] === namedEntity["@id"]);
      if (found) found.name = namedEntity.name;
    }
}

function getCols(entity: any) {
  const cols = [];
  for (const key of Object.keys(entity)) {
    cols.push({ field: key });
  }
  return cols;
}

function onDownload(): void {
  if (isObjectHasKeys(queryResults.value, ["entities"]) && isArrayHasLength(queryResults.value.entities)) {
    const fieldNames = getCols(queryResults.value.entities[0]).map(col => col.field);
    const heading = fieldNames.join(",");
    let body = "";
    for (const entity of queryResults.value.entities) {
      let row = "";
      for (const fieldName of fieldNames) {
        row += entity[fieldName] + ",";
      }
      body += row + "\n";
    }
    const csv = heading + "\n" + body;
    downloadFile(csv, "results.csv");
  }
}

async function getParams(iri?: string) {
  const parameters = [
    {
      name: "Text search",
      desc: "Text search parameter that is used against the label of the entity",
      type: XSD.STRING,
      minCount: 0,
      maxCount: 1,
      value: ""
    }
  ];
  if (iri) {
    const entity = await EntityService.getPartialEntity(iri, [SHACL.PARAMETER]);
    if (isObjectHasKeys(entity, [SHACL.PARAMETER]))
      for (const param of entity[SHACL.PARAMETER]) {
        parameters.push({
          name: param[RDFS.LABEL],
          desc: param[RDFS.COMMENT],
          type: param[SHACL.CLASS]?.[0]?.name || param[SHACL.DATATYPE]?.[0]?.name,
          minCount: param[SHACL.MINCOUNT],
          maxCount: param[SHACL.MAXCOUNT],
          value: ""
        });
      }
  }

  return parameters;
}
</script>

<style scoped></style>
