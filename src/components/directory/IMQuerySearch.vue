<template>
  <div id="query-search-container">
    <h3 class="title">IM language search</h3>
    <div class="input-container">
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
import { QueryRequest, SearchResultSummary } from "vue-library/interfaces";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "vue-library/models";
import { ToastSeverity } from "vue-library/enums";
import Button from "primevue/button";
import Textarea from "primevue/textarea";
import { useCopyToClipboard } from "@/composables/useCopyToClipboard";
import ResultsTable from "../shared/ResultsTable.vue";

const emit = defineEmits<{
  locateInTree: [payload: string];
  selectedUpdated: [payload: SearchResultSummary];
}>();

const toast = useToast();
const imQueryString = ref("");
const { copyToClipboard, onCopy, onCopyError } = useCopyToClipboard(imQueryString);
const imQuery: Ref<QueryRequest | undefined> = ref();
const updateSearch: Ref<boolean> = ref(false);
const searchLoading: Ref<boolean> = ref(false);

function onSearch() {
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

function format() {
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

#query-string-container {
  width: 100%;
  height: 10rem;
  overflow: auto;
  flex-grow: 100;
  margin-right: 1rem;
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

.input-container {
  width: 98%;
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

.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
}
</style>
