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
    <span class="error-message" v-if="eclError">{{ eclErrorMessage }}</span>
    <div class="button-container">
      <Button :disabled="eclError" label="ECL builder" @click="showBuilder" class="p-button-help" data-testid="builder-button" />
      <Button label="Search" @click="search" class="p-button-primary" :disabled="!queryString.length || eclError" data-testid="search-button" />
    </div>
    <div class="filters-container">
      <div class="status-filter p-inputgroup">
        <span class="p-float-label">
          <MultiSelect id="status" v-model="selectedStatus" optionLabel="name" @change="search" :options="statusOptions" display="chip" />
          <label for="status">Select status:</label>
        </span>
      </div>
    </div>
    <div class="results-container">
      <p v-if="searchResults.length > 1000" class="result-summary" data-testid="search-count">{{ totalCount }} results found. Display limited to first 1000.</p>
      <SearchResults :searchResults="searchResults" :totalRecords="totalCount" :loading="loading" />
    </div>
  </div>
  <Builder
    :showDialog="showDialog"
    :eclString="queryString"
    @eclSubmitted="updateECL"
    @closeDialog="showDialog = false"
    @eclConversionError="updateError"
    :key="builderKey"
    :data-testid="'builder-visible-' + showDialog"
  />
</template>

<script setup lang="ts">
import { Ref, ref, watch, computed, onMounted } from "vue";
import Builder from "@/components/directory/topbar/eclSearch/Builder.vue";
import SearchResults from "@/components/directory/topbar/eclSearch/SearchResults.vue";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { ConceptSummary, EclSearchRequest, TTIriRef } from "@im-library/interfaces";
import { isObject, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { IM } from "@im-library/vocabulary";
import { getLogger } from "@im-library/logger/LogConfig";
import { EclService } from "@/services";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";
import { useStore } from "vuex";
import { byName } from "@im-library/helpers/Sorters";

const toast = useToast();
const store = useStore();

const statusOptions = computed(() => store.state.filterOptions.status);
const savedEcl = computed(() => store.state.eclEditorSavedString);

const queryString = ref("");
const showDialog = ref(false);
const searchResults: Ref<ConceptSummary[]> = ref([]);
const totalCount = ref(0);
const eclError = ref(false);
const eclErrorMessage = ref("");
const loading = ref(false);
const controller: Ref<AbortController> = ref({} as AbortController);
const selectedStatus: Ref<TTIriRef[]> = ref([]);
const builderKey = ref(0);

watch(queryString, () => {
  eclError.value = false;
  store.commit("updateEclEditorSavedString", queryString.value);
});

watch(selectedStatus, async () => {
  selectedStatus.value = selectedStatus.value.sort(byName);
});

onMounted(() => {
  setFilterDefaults();
  if (savedEcl.value) queryString.value = savedEcl.value;
});

function updateECL(data: string): void {
  queryString.value = data;
  showDialog.value = false;
}

function showBuilder(): void {
  builderKey.value = Math.round(Math.random() * 1000);
  showDialog.value = true;
}

function updateError(errorUpdate: { error: boolean; message: string }): void {
  eclError.value = errorUpdate.error;
  eclErrorMessage.value = errorUpdate.message;
}

async function search(): Promise<void> {
  if (queryString.value) {
    loading.value = true;
    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();
    const eclQuery = await EclService.getQueryFromECL(queryString.value);
    const eclSearchRequest = { eclQuery: eclQuery, includeLegacy: false, limit: 1000, statusFilter: selectedStatus.value } as EclSearchRequest;
    const result = await EclService.ECLSearch(eclSearchRequest, controller.value);
    searchResults.value = result;
    totalCount.value = result.length;
    loading.value = false;
  }
}

function setFilterDefaults() {
  selectedStatus.value = statusOptions.value.filter((option: any) => option["@id"] === IM.ACTIVE);
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
  margin: 1rem 0 1rem 0;
}

.results-container {
  width: 100%;
  flex: 0 1 auto;
  overflow: auto;
}

.error-message {
  color: #f44336;
}

.filters-container {
  width: 100%;
  display: flex;
  flex-flow: row wrap;
}

.status-filter {
  width: 20rem;
  padding: 1.25rem 0.5rem 0.5rem 0.5rem;
  justify-self: flex-start;
}

.text-copy-container {
  width: 100%;
  display: flex;
  flex-flow: row;
  align-items: center;
}
</style>
