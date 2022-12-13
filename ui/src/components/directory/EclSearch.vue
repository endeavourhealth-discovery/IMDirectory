<template>
  <div id="query-search-container">
    <h3 class="title">Expression constraints language search</h3>
    <h5 class="info">ECL expression:</h5>
    <div class="text-copy-container">
      <Textarea
        v-model="queryString"
        id="query-string-container"
        placeholder="Enter expression here or use the ECL builder to generate your search..."
        :class="eclError ? 'p-invalid' : ''"
        data-testid="query-string"
      />
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
      <Button label="ECL builder" @click="showBuilder" class="p-button-help" data-testid="builder-button" />
      <Button label="Search" @click="search" class="p-button-primary" :disabled="!queryString.length" data-testid="search-button" />
    </div>
    <div class="results-container">
      <p v-if="searchResults.length > 1000" class="result-summary" data-testid="search-count">{{ totalCount }} results found. Display limited to first 1000.</p>
      <SearchResults :searchResults="searchResults" :loading="loading" />
    </div>
  </div>
  <Builder :showDialog="showDialog" @ECLSubmitted="updateECL" @closeDialog="showDialog = false" :data-testid="'builder-visible-' + showDialog" />
</template>

<script setup lang="ts">
import { Ref, ref, watch } from "vue";
import Builder from "@/components/directory/topbar/eclSearch/Builder.vue";
import SearchResults from "@/components/directory/topbar/eclSearch/SearchResults.vue";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { ConceptSummary } from "@im-library/interfaces";
import { DataTypeCheckers } from "@im-library/helpers";
import { LoggerService, SetService } from "@/services";
import { useToast } from "primevue/usetoast";
const { isObjectHasKeys, isObject } = DataTypeCheckers;

const toast = useToast();

const queryString = ref("");
const showDialog = ref(false);
const searchResults: Ref<ConceptSummary[]> = ref([]);
const totalCount = ref(0);
const eclError = ref(false);
const loading = ref(false);
const controller: Ref<AbortController> = ref({} as AbortController);

watch(queryString, () => (eclError.value = false));

function updateECL(data: string): void {
  queryString.value = data;
  showDialog.value = false;
}

function showBuilder(): void {
  showDialog.value = true;
}

async function search(): Promise<void> {
  if (queryString.value) {
    loading.value = true;
    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();
    const result = await SetService.ECLSearch(queryString.value, false, 1000, controller.value);
    if (isObjectHasKeys(result, ["entities", "count", "page"])) {
      searchResults.value = result.entities;
      totalCount.value = result.count;
    } else {
      eclError.value = true;
      searchResults.value = [];
      totalCount.value = 0;
    }
    loading.value = false;
  }
}

function copyToClipboard(): string {
  return queryString.value;
}

function onCopy(): void {
  toast.add(LoggerService.success("Value copied to clipboard"));
}

function onCopyError(): void {
  toast.add(LoggerService.error("Failed to copy value to clipboard"));
}
</script>

<style scoped>
#query-search-container {
  height: 100%;
  width: 100%;
  /* overflow: auto; */
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
