<template>
  <div id="query-search-container">
    <h3 class="title">IM language search</h3>
    <h5 class="info">IMQuery definition:</h5>
    <div class="text-copy-container">
      <Textarea v-model="imQueryString" id="query-string-container" placeholder="Enter query definition here" data-testid="query-string" />
      <Button
        :disabled="!imQueryString.length"
        icon="fa-solid fa-copy"
        v-tooltip.left="'Copy to clipboard'"
        v-clipboard:copy="copyToClipboard()"
        v-clipboard:success="onCopy"
        v-clipboard:error="onCopyError"
        data-testid="copy-to-clipboard-button"
      />
    </div>
    <div class="button-container">
      <Button label="Format" @click="format" severity="help" :disabled="!imQueryString.length" data-testid="search-button" />
      <Button label="Search" @click="onSearch" class="p-button-primary" :disabled="!imQueryString.length" data-testid="search-button" />
    </div>
    <div class="results-container">
      <ResultsTable
        v-model:loading="searchLoading"
        :update-search="updateSearch"
        :im-query="imQuery"
        @rowSelected="(selected: SearchResultSummary) => emit('selectedUpdated', selected)"
        @locateInTree="(iri: string) => $emit('locateInTree', iri)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from "vue";
import { QueryRequest, SearchResultSummary } from "@/interfaces/AutoGen";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@/models";
import { ToastSeverity } from "@/enums";
import Button from "primevue/button";
import Textarea from "primevue/textarea";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";
import ResultsTable from "../shared/ResultsTable.vue";

const emit = defineEmits({
  locateInTree: (_payload: string) => true,
  selectedUpdated: (_payload: SearchResultSummary) => true
});

const toast = useToast();
const imQueryString = ref("");
const { copyToClipboard, onCopy, onCopyError } = setupCopyToClipboard(imQueryString);
const imQuery: Ref<QueryRequest | undefined> = ref();
const updateSearch: Ref<boolean> = ref(false);
const searchLoading: Ref<boolean> = ref(false);

async function onSearch(): Promise<void> {
  if (imQueryString.value) {
    try {
      imQuery.value = parseQuery();
      updateSearch.value = !updateSearch.value;
    } catch (error) {
      if (!(error instanceof SyntaxError) && !(error instanceof TypeError))
        toast.add(new ToastOptions(ToastSeverity.ERROR, "An error occurred: " + (error as Error).message));
    }
  }
}

function parseQuery() {
  try {
    return JSON.parse(imQueryString.value);
  } catch (error) {
    if (error instanceof SyntaxError) {
      toast.add(new ToastOptions(ToastSeverity.WARN, "JSON is invalid: " + error.message));
    }
  }
}

async function format() {
  const parsed = parseQuery();
  if (parsed) imQueryString.value = JSON.stringify(parsed, null, 2);
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
