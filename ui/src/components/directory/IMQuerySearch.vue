<template>
  <div id="query-search-container">
    <h3 class="title">IM language search</h3>
    <h5 class="info">IMQuery definition:</h5>
    <div class="text-copy-container">
      <Textarea v-model="queryString" id="query-string-container" placeholder="Enter query definition here" data-testid="query-string" />
      <Button
        :disabled="!queryString.length"
        icon="fa-solid fa-copy"
        v-tooltip.left="'Copy to clipboard'"
        v-clipboard:copy="copyToClipboard()"
        v-clipboard:success="onCopy"
        v-clipboard:error="onCopyError"
        data-testid="copy-to-clipboard-button"
      />
    </div>
    <div class="button-container">
      <Button label="Format" @click="format" severity="help" :disabled="!queryString.length" data-testid="search-button" />
      <Button label="Search" @click="search" class="p-button-primary" :disabled="!queryString.length" data-testid="search-button" />
    </div>
    <div class="results-container">
      <SearchResults
        :show-filters="false"
        :search-results="searchResults"
        :search-loading="loading"
        @locate-in-tree="(iri:string) => emit('locateInTree', iri)"
        @selected-updated="(selected:ConceptSummary) => emit('selectedUpdated', selected)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from "vue";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { ConceptSummary } from "@im-library/interfaces";
import { Query, QueryRequest } from "@im-library/interfaces/AutoGen";
import { isArrayHasLength, isObject } from "@im-library/helpers/DataTypeCheckers";
import { QueryService } from "@/services";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";
import { IM, RDF, RDFS } from "@im-library/vocabulary";
import SearchResults from "@/components/shared/SearchResults.vue";
import Button from "primevue/button";
import Textarea from "primevue/textarea";

const emit = defineEmits({
  locateInTree: (_payload: string) => true,
  selectedUpdated: (_payload: ConceptSummary) => true
});

const toast = useToast();
const queryString = ref("");
const searchResults: Ref<ConceptSummary[]> = ref([]);
const controller: Ref<AbortController> = ref({} as AbortController);
const loading = ref(false);

async function search(): Promise<void> {
  if (queryString.value) {
    loading.value = true;
    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();
    const queryRequest = {} as QueryRequest;

    try {
      queryRequest.query = parseQuery();
      addDefaultQuerySelect(queryRequest.query);
      const result = await QueryService.queryIM(queryRequest);
      const queryResults = convertResultsToConceptSummaryList(result.entities);
      searchResults.value = queryResults;
    } catch (error) {
      if (!(error instanceof SyntaxError) && !(error instanceof TypeError))
        toast.add(new ToastOptions(ToastSeverity.ERROR, "An error occurred: " + (error as Error).message));
    }

    loading.value = false;
  }
}

function parseQuery() {
  try {
    return JSON.parse(queryString.value);
  } catch (error) {
    if (error instanceof SyntaxError) {
      toast.add(new ToastOptions(ToastSeverity.WARN, "JSON is invalid: " + error.message));
    }
  }
}

function convertResultsToConceptSummaryList(entities: any[]) {
  if (!isArrayHasLength(entities)) return [];
  return entities.map(entity => {
    return {
      iri: entity["@id"],
      name: entity[RDFS.LABEL],
      match: entity[RDFS.LABEL],
      entityType: entity[RDF.TYPE],
      code: entity[IM.CODE]
    } as ConceptSummary;
  });
}

function addDefaultQuerySelect(query: Query) {
  // TODO add return when ready
  // if (!isArrayHasLength(query.select)) query.select = [];
  // const defaultProperties = [RDFS.LABEL, RDF.TYPE, IM.CODE];
  // for (const property of defaultProperties) {
  //   const select = {
  //     "@id": property
  //   } as Select;
  //   query.select.push(select);
  // }
}

async function format() {
  const parsed = parseQuery();
  if (parsed) queryString.value = JSON.stringify(parsed, null, 2);
}

function copyToClipboard(): string {
  return queryString.value;
}

function onCopy(): void {
  toast.add(new ToastOptions(ToastSeverity.SUCCESS, "Value copied to clipboard"));
}

function onCopyError(): void {
  toast.add(new ToastOptions(ToastSeverity.ERROR, "Failed to copy value to clipboard"));
}
</script>

<style scoped>
#query-search-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
}

#query-builder-container {
  width: 100%;
  flex-grow: 100;
  overflow: auto;
}

#query-build {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
  margin: 0 0 1rem 0;
}

#next-option-container {
  width: 100%;
  display: flex;
  flex-flow: row;
  justify-content: center;
}

#query-string-container {
  width: 100%;
  height: 10rem;
  overflow: auto;
  flex-grow: 100;
}

.info {
  align-self: flex-start;
  margin: 0 0 0.5rem 0;
}

.button-container {
  display: flex;
  flex-flow: row;
  gap: 1rem;
  margin: 0 0 1rem 0;
}

.results-container {
  width: 100%;
  flex: 0 1 auto;
  overflow: auto;
}

.text-copy-container {
  width: 100%;
  display: flex;
  flex-flow: row;
  align-items: center;
  margin: 0 0 1rem 0;
}
</style>
