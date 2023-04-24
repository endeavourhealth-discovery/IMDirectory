<template>
  <div class="search-results-container">
    <DataTable
      :value="searchResults"
      v-model:selection="selectedResult"
      @row-select="onNodeSelect"
      selectionMode="single"
      class="p-datatable-sm"
      :scrollable="true"
      removableSort
      :paginator="true"
      paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      :rows="15"
      @page="scrollToTop"
      :loading="loading"
    >
      <template #empty> None </template>
      <template #loading> Loading... </template>
      <Column field="name" header="Results">
        <template #body="{ data }: any">
          <div class="result-container" @mouseenter="showDetailsOverlay($event, data)" @mouseleave="hideDetailsOverlay()">
            <div class="result-icon-container">
              <IMFontAwesomeIcon
                :icon="getPerspectiveByConceptType(data.entityType)"
                fixed-width
                class="result-icon"
                :style="getColorByConceptType(data.entityType)"
              />
            </div>
            <div class="result-text-container">
              {{ data.name }}<br />
              <small style="color: lightgrey">{{ data.name }}</small>
            </div>
            <Button :disabled="!data.iri" icon="fa-solid fa-sitemap" @click="findInTree(data.iri)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <OverlayPanel ref="detailsOP" id="overlay-panel" style="width: 25vw" :dismissable="true">
      <div class="result-overlay">
        <div class="left-side" v-if="hoveredResult.iri">
          <p>
            <strong>Name: </strong>
            <span>
              {{ hoveredResult.name }}
            </span>
          </p>
          <p>
            <strong>Iri: </strong>
            <span style="word-break: break-all">
              {{ hoveredResult.iri }}
            </span>
          </p>
          <p>
            <strong>Code: </strong>
            <span>
              {{ hoveredResult.code }}
            </span>
          </p>
        </div>
        <div class="right-side" v-if="hoveredResult.iri">
          <p>
            <strong>Status: </strong>
            <span v-if="hoveredResult.status">
              {{ hoveredResult.status.name }}
            </span>
          </p>
          <p>
            <strong>Scheme: </strong>
            <span v-if="hoveredResult.scheme">
              {{ hoveredResult.scheme.name }}
            </span>
          </p>
          <p>
            <strong>Type: </strong>
            <span>
              {{ getConceptTypes(hoveredResult) }}
            </span>
          </p>
        </div>
      </div>
    </OverlayPanel>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref } from "vue";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { getFAIconFromType, getColourFromType } from "@im-library/helpers/ConceptTypeMethods";
import { ConceptSummary } from "@im-library/interfaces";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { useRootStore } from "@/stores/root";

const store = useRootStore();

const props = defineProps({
  searchTerm: { type: String, required: false },
  searchResults: { type: Array as PropType<Array<ConceptSummary>>, required: false },
  loading: { type: Boolean, required: true }
});

const emit = defineEmits({ searchResultSelected: (_payload: ConceptSummary) => true });

const detailsOP = ref();

let selectedResult = ref({} as ConceptSummary);
let hoveredResult = ref({} as ConceptSummary);

function getPerspectiveByConceptType(conceptType: TTIriRef[]): string[] {
  return getFAIconFromType(conceptType);
}

function getColorByConceptType(conceptType: TTIriRef[]): string {
  return "color:" + getColourFromType(conceptType);
}

function onNodeSelect(): void {
  emit("searchResultSelected", selectedResult.value);
}

function scrollToTop(): void {
  const resultsContainer = document.getElementById("search-results-container") as HTMLElement;
  const scrollBox = resultsContainer?.getElementsByClassName("p-datatable-wrapper")[0] as HTMLElement;
  if (scrollBox) {
    scrollBox.scrollTop = 0;
  }
}

function hideDetailsOverlay(): void {
  const x = detailsOP.value as any;
  x.hide();
}

function showDetailsOverlay(event: any, data: ConceptSummary) {
  hoveredResult.value = data;
  if (hoveredResult.value.name === "ANY") {
    return;
  }
  const x = detailsOP.value as any;
  x.show(event, event.target);
}

function getConceptTypes(concept: ConceptSummary): any {
  return concept.entityType
    .map(function (type: any) {
      return type.name;
    })
    .join(", ");
}

function findInTree(iri: string) {
  if (iri) store.updateFindInEditorTreeIri(iri);
}
</script>

<style scoped>
.add-expression-button {
  border-style: dashed !important;
}
.p-button-label {
  padding-left: 0.5rem;
}
.search-results-container {
  flex-grow: 5;
  overflow-y: auto;
}
.search-results-container ::v-deep(.p-datatable) {
  height: 40vh;
  width: 30rem;
  display: flex;
  flex-flow: column;
  justify-content: space-between;
}
.search-results-container ::v-deep(.p-datatable-wrapper) {
  flex-grow: 6;
}
.result-container {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}
.result-icon-container {
  height: 100%;
}
.result-text-container {
  height: fit-content;
  flex-grow: 10;
}
.result-icon {
  font-size: 2rem;
  color: lightgrey;
  padding: 5px;
}
@media screen and (min-width: 1024px) {
  .result-overlay {
    display: flex;
    flex-flow: row;
    justify-content: flex-start;
    width: 100%;
    gap: 7px;
  }
  .left-side,
  .right-side {
    max-width: 50%;
    flex-grow: 2;
  }
  .button-container {
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    width: fit-content;
  }
}
#overlay-panel:hover {
  transition-delay: 2s;
}
@media screen and (max-width: 1023px) {
  .result-overlay {
    display: flex;
    flex-flow: column;
    justify-content: flex-start;
    width: 100%;
    gap: 7px;
  }
  .left-side,
  .right-side {
    width: 100%;
    flex-grow: 2;
  }
}
</style>
