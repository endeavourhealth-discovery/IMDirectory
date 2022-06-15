<template>
  <div id="search-results-container" class="p-field">
    <div v-if="loading" class="p-d-flex p-flex-row p-jc-center">
      <div class="p-text-center">
        <ProgressSpinner />
      </div>
    </div>
    <DataTable
      v-else
      :value="searchResults"
      v-model:selection="selectedResult"
      @row-select="onNodeSelect"
      selectionMode="single"
      class="p-datatable-sm"
      :scrollable="true"
      removableSort
      :paginator="true"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      :rowsPerPageOptions="[15, 25, 50]"
      currentPageReportTemplate="Displaying {first} to {last} of {totalRecords} results"
      :rows="15"
      @page="scrollToTop"
    >
      <template #empty>
        None
      </template>
      <template #loading>
        Loading...
      </template>
      <Column field="name">
        <template #header>
          Results
          <Button
            :disabled="!searchResults.length"
            class="p-button-sm p-button-text"
            icon="pi pi-external-link"
            @click="exportCSV()"
            v-tooltip.right="'Download results table'"
          />
        </template>

        <template #body="slotProps">
          <div class="result-container" @mouseenter="showOverlay($event, slotProps.data)" @mouseleave="hideOverlay()">
            <div class="result-icon-container" :style="getColorByConceptType(slotProps.data.entityType)">
              <i :class="getPerspectiveByConceptType(slotProps.data.entityType)" class="result-icon" aria-hidden="true" />
            </div>
            <div class="result-text-container">
              {{ slotProps.data.name }}<br />
              <small style="color:lightgrey">{{ slotProps.data.name }}</small>
            </div>
            <div class="button-container">
              <Button
                icon="pi pi-copy"
                class="p-button-rounded p-button-text p-button-secondary row-button"
                v-clipboard:copy="copyConceptToClipboardVueWrapper(slotProps.data)"
                v-clipboard:success="onCopy"
                v-clipboard:error="onCopyError"
                v-tooltip.right="'Copy concept summary to clipboard \n (right click to copy individual properties)'"
                @contextmenu="onCopyRightClick"
              />
            </div>
          </div>
        </template>
      </Column>
    </DataTable>

    <ContextMenu ref="copyMenu" :model="copyMenuItems" />

    <OverlayPanel ref="op" id="overlay-panel" :dismissable="true">
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
            <span style="word-break:break-all;">
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

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { mapState } from "vuex";
import { Helpers, Models } from "im-library";
import { TTIriRef } from "im-library/dist/types/interfaces/Interfaces";
const {
  DataTypeCheckers: { isObjectHasKeys },
  ConceptTypeMethods: { getColourFromType, getFAIconFromType },
  CopyConceptToClipboard: { copyConceptToClipboard, conceptObjectToCopyString }
} = Helpers;

export default defineComponent({
  name: "SearchResults",
  components: {},
  props: {
    searchResults: { type: Array as PropType<Array<unknown>> },
    loading: Boolean
  },
  watch: {
    searchResults(newValue) {
      this.results = newValue;
    }
  },
  computed: mapState(["blockedIris"]),
  async mounted() {
    this.defaultPredicates = await this.$configService.getDefaultPredicateNames();
  },
  data() {
    return {
      results: new Models.Search.SearchResponse(),
      selectedResult: {} as Models.Search.ConceptSummary,
      hoveredResult: {} as Models.Search.ConceptSummary,
      copyMenuItems: [] as any[],
      defaultPredicates: {} as any
    };
  },
  methods: {
    downloadFile(data: any, fileName: string) {
      const url = window.URL.createObjectURL(new Blob([data], { type: "application" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
    },

    exportCSV(): void {
      const heading = ["name", "iri"].join(",");
      const body = this.searchResults?.map((row: any) => [row.name, row.iri].join(",")).join("\n");
      const csv = [heading, body].join("\n");
      console.log(csv);
      this.downloadFile(csv, "results.csv");
    },

    getPerspectiveByConceptType(conceptTypes: TTIriRef[]): string[] {
      return getFAIconFromType(conceptTypes);
    },

    getColorByConceptType(conceptTypes: TTIriRef[]): string {
      return "color:" + getColourFromType(conceptTypes);
    },

    onNodeSelect(): void {
      this.$router.push({
        name: "Concept",
        params: { selectedIri: this.selectedResult.iri }
      });
    },

    scrollToTop(): void {
      const resultsContainer = document.getElementById("search-results-container") as HTMLElement;
      const scrollBox = resultsContainer?.getElementsByClassName("p-datatable-wrapper")[0] as HTMLElement;
      if (scrollBox) {
        scrollBox.scrollTop = 0;
      }
    },

    hideOverlay(): void {
      const x = this.$refs.op as any;
      x.hide();
    },

    showOverlay(event: any, data: Models.Search.ConceptSummary): void {
      this.hoveredResult = data;
      this.setCopyMenuItems();
      const x = this.$refs.op as any;
      x.show(event, event.target);
    },

    getConceptTypes(concept: Models.Search.ConceptSummary): string {
      if (isObjectHasKeys(concept, ["entityType"])) {
        return concept.entityType
          .map(function(type: any) {
            return type.name;
          })
          .join(", ");
      } else {
        return "None";
      }
    },

    onCopy(): void {
      this.$toast.add(this.$loggerService.success("Value copied to clipboard"));
    },

    onCopyError(): void {
      this.$toast.add(this.$loggerService.error("Failed to copy value to clipboard"));
    },

    onCopyRightClick(event: any) {
      const x = this.$refs.copyMenu as any;
      x.show(event);
    },

    copyConceptToClipboardVueWrapper(data: any) {
      let filteredData = { ...data };
      delete filteredData.match;
      delete filteredData.weighting;
      delete filteredData.isDescendantOf;
      return copyConceptToClipboard(filteredData, undefined, this.defaultPredicates, this.blockedIris);
    },

    async setCopyMenuItems(): Promise<void> {
      this.copyMenuItems = [
        {
          label: "Copy",
          disabled: true
        },
        {
          separator: true
        },
        {
          label: "All",
          command: async () => {
            await navigator.clipboard
              .writeText(copyConceptToClipboard(this.hoveredResult, undefined, this.defaultPredicates, this.blockedIris))
              .then(() => {
                this.$toast.add(this.$loggerService.success("Concept copied to clipboard"));
              })
              .catch(err => {
                this.$toast.add(this.$loggerService.error("Failed to copy concept to clipboard", err));
              });
          }
        }
      ];

      let key: string;
      let value: any;
      for ([key, value] of Object.entries(this.hoveredResult)) {
        let result = conceptObjectToCopyString(key, value, 0, 1, undefined, this.defaultPredicates);
        if (!result) continue;
        const label = result.label;
        const text = result.value;
        this.copyMenuItems.push({
          label: label,
          command: async () => {
            await navigator.clipboard
              .writeText(text)
              .then(() => {
                this.$toast.add(this.$loggerService.success(label + " copied to clipboard"));
              })
              .catch(err => {
                this.$toast.add(this.$loggerService.error("Failed to copy " + label + " to clipboard", err));
              });
          }
        });
      }
    }
  }
});
</script>

<style scoped>
#search-results-container {
  height: 100%;
}

#search-results-container ::v-deep(.p-datatable) {
  height: 100%;
  display: flex;
  flex-flow: column;
  justify-content: space-between;
}

#search-results-container ::v-deep(.p-datatable-wrapper) {
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
  margin-right: 1em;
}

.result-text-container {
  height: fit-content;
  flex-grow: 10;
}

.result-icon {
  font-size: 2.5rem;
  padding: 5px;
}

#overlay-panel:hover {
  transition-delay: 2s;
}

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

.row-button:hover {
  background-color: #6c757d !important;
  color: #ffffff !important;
}
</style>
