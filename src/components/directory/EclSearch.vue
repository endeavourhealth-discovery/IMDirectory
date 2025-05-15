<template>
  <div id="ecl-search-container">
    <h3 class="title">Expression constraints language search</h3>
    <h5 class="info">ECL expression:</h5>
    <div class="text-copy-container">
      <Textarea
        v-model="eclQueryString"
        id="query-string-container"
        placeholder="Enter expression here or use the ECL builder to generate your search..."
        :class="eclError ? 'p-invalid' : ''"
        data-testid="query-string"
        @keydown="onKeyDown"
        @keyup="onKeyUp"
      />
      <Button
        :disabled="!eclQueryString.length"
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
      <Button :disabled="eclError" label="ECL builder" @click="showBuilder" severity="help" data-testid="builder-button" />
      <Button
        label="Search"
        :loading="searchLoading"
        @click="onSearch()"
        class="p-button-primary"
        :disabled="!eclQueryString.length || eclError"
        data-testid="ecl-search-button"
      />
    </div>
    <div class="filters-container">
      <div class="status-filter p-inputgroup">
        <FloatLabel>
          <MultiSelect id="status" v-model="selectedStatus" optionLabel="name" @change="onSearch()" :options="statusOptions" display="chip" />
          <label for="status">Select status:</label>
        </FloatLabel>
      </div>
    </div>
    <div class="results-container">
      <ResultsTable
        v-model:loading="searchLoading"
        :update-search="updateSearch"
        :ecl-query="eclQuery"
        @rowSelected="(selected: SearchResultSummary) => emit('selectedUpdated', selected)"
        @locateInTree="(iri: string) => $emit('locateInTree', iri)"
      />
    </div>
    <Builder
      :showDialog="showDialog"
      :eclString="eclQueryString"
      @eclSubmitted="updateECL"
      @closeDialog="showDialog = false"
      @eclConversionError="updateError"
      :key="builderKey"
      :data-testid="'builder-visible-' + showDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, watch, computed, onMounted } from "vue";
import Builder from "@/components/directory/topbar/eclSearch/ECLBuilder.vue";
import { EclSearchRequest, TTIriRef, SearchResultSummary } from "@/interfaces/AutoGen";
import { IM } from "@/vocabulary";
import { EclService } from "@/services";
import { byName } from "@/helpers/Sorters";
import ResultsTable from "@/components/shared/ResultsTable.vue";
import { useEditorStore } from "@/stores/editorStore";
import { useFilterStore } from "@/stores/filterStore";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";
import { GenericObject } from "@/interfaces/GenericObject";

const emit = defineEmits<{
  locateInTree: [payload: string];
  selectedUpdated: [payload: SearchResultSummary];
}>();

const filterStore = useFilterStore();
const editorStore = useEditorStore();
const statusOptions = computed(() => filterStore.filterOptions.status);
const savedEcl = computed(() => editorStore.eclEditorSavedString);
const eclQueryString = ref("");
const { copyToClipboard, onCopy, onCopyError } = setupCopyToClipboard(eclQueryString);
const showDialog = ref(false);
const eclError = ref(false);
const eclErrorMessage = ref("");
const selectedStatus: Ref<TTIriRef[]> = ref([]);
const builderKey = ref(0);
const eclQuery: Ref<EclSearchRequest | undefined> = ref();
const keysPressed: GenericObject = {};
const updateSearch: Ref<boolean> = ref(false);
const searchLoading: Ref<boolean> = ref(false);

watch(eclQueryString, () => {
  eclError.value = false;
  editorStore.updateEclEditorSavedString(eclQueryString.value);
});

watch(selectedStatus, async () => {
  selectedStatus.value.sort(byName);
});

onMounted(() => {
  setFilterDefaults();
  if (savedEcl.value) eclQueryString.value = savedEcl.value;
});

async function onKeyDown(event: KeyboardEvent) {
  keysPressed[event.key] = true;
  if (keysPressed["Control"] && keysPressed["Enter"] && eclQueryString.value.length && !eclError.value) await onSearch();
}

function onKeyUp(event: KeyboardEvent) {
  delete keysPressed[event.key];
}

function updateECL(data: string): void {
  eclQueryString.value = data;
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

async function onSearch(): Promise<void> {
  if (eclQueryString.value) {
    const imQuery = await EclService.getQueryFromECL(eclQueryString.value);
    eclQuery.value = {
      eclQuery: imQuery,
      includeLegacy: false,
      statusFilter: selectedStatus.value
    } as EclSearchRequest;
    updateSearch.value = !updateSearch.value;
  }
}

function setFilterDefaults() {
  selectedStatus.value = statusOptions.value.filter(option => option.iri === IM.ACTIVE);
}
</script>

<style scoped>
#ecl-search-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
}

#query-builder-container {
  width: 100%;
  grow: 100;
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
  grow: 100;
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
  color: var(--p-red-500);
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
