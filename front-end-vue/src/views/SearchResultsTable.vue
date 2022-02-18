<template>
  <div id="search-results-main-container">
    <div class="card">
      <div class="p-grid">
        <div class="p-col-4">
          <div class="p-inputgroup">
            <span class="p-float-label">
              <MultiSelect id="status" v-model="selectedStatus" @change="filterResults" :options="statusOptions" display="chip" />
              <label for="status">Select status:</label>
            </span>
          </div>
        </div>
        <div class="p-col-4">
          <div class="p-inputgroup">
            <span class="p-float-label">
              <MultiSelect id="scheme" v-model="selectedSchemes" @change="filterResults" :options="schemeOptions" display="chip" />
              <label for="scheme">Select scheme:</label>
            </span>
          </div>
        </div>
        <div class="p-col-4">
          <div class="p-inputgroup">
            <span class="p-float-label">
              <MultiSelect id="type" v-model="selectedTypes" @change="filterResults" :options="typeOptions" display="chip" />
              <label for="type">Select concept type:</label>
            </span>
          </div>
        </div>
      </div>

      <DataTable
        :loading="searchLoading"
        :value="localSearchResults"
        contextMenu
        v-model:contextMenuSelection="selectedResult"
        @rowContextmenu="onRowContextMenu"
        @row-dblclick="onRowDblClick"
        responsiveLayout="scroll"
        ref="searchTable"
      >
        <Column field="name" header="Name">
          <template #body="slotProps">
            <div class="ml-2">
              <span :style="getColourFromType(slotProps.data.entityType)" class="p-mx-1">
                <font-awesome-icon v-if="slotProps.data.entityType && slotProps.data.entityType.length" :icon="getFAIconFromType(slotProps.data.entityType)" />
              </span>
              {{ slotProps.data.name }}
            </div>
          </template>
        </Column>
        <Column field="entityType" header="Types">
          <template #body="slotProps">
            {{ getNamesFromTypes(slotProps.data.entityType) }}
          </template>
        </Column>
        <Column field="status" header="Status">
          <template #body="slotProps">
            {{ slotProps.data.status.name }}
          </template>
        </Column>
        <Column field="code" header="Code"></Column>
      </DataTable>

      <ContextMenu :model="rClickOptions" ref="cm" />
    </div>
  </div>
</template>

<script lang="ts">
import { getColourFromType, getFAIconFromType, isOfTypes } from "@/helpers/ConceptTypeMethods";
import { ConceptSummary } from "@/models/search/ConceptSummary";
import { TTIriRef } from "@/models/TripleTree";
import { IM } from "@/vocabulary/IM";
import { defineComponent } from "vue";
import { RouteRecordName } from "vue-router";
import { mapState } from "vuex";
// import "../../node_modules/primeflex/primeflex.css";

export default defineComponent({
  name: "SearchResultsTable",
  computed: {
    ...mapState(["searchLoading", "filterOptions", "selectedFilters", "searchResults"])
  },
  watch: {
    searchResults() {
      this.init();
    },
    chips() {
      this.filterResults();
    }
  },

  mounted() {
    this.init();
  },
  data() {
    return {
      selectedSchemes: [] as string[],
      selectedStatus: [] as string[],
      selectedTypes: [] as string[],
      schemeOptions: [] as string[],
      statusOptions: [] as string[],
      typeOptions: [] as string[],
      localSearchResults: [] as ConceptSummary[],
      selectedResult: {} as ConceptSummary,
      rClickOptions: [
        {
          label: "Open",
          icon: "pi pi-fw pi-folder-open",
          command: () => this.navigate()
        },
        {
          label: "Info",
          icon: "pi pi-fw pi-info-circle",
          command: () => this.showInfo()
        },
        {
          label: "Edit",
          icon: "pi pi-fw pi-pencil",
          command: () => this.showInfo()
        },
        {
          label: "Move to",
          icon: "pi pi-fw pi-arrow-circle-right",
          command: () => this.showInfo()
        },
        {
          separator: true
        },
        {
          label: "Favourite",
          icon: "pi pi-fw pi-star",
          command: () => this.showInfo()
        }
      ]
    };
  },
  methods: {
    init() {
      this.localSearchResults = this.searchResults;
      const schemeOptions = [] as string[];
      const typeOptions = [] as string[];
      const statusOptions = [] as string[];
      if (this.localSearchResults) {
        (this.localSearchResults as ConceptSummary[]).forEach(searchResult => {
          schemeOptions.push(searchResult.scheme.name);
          searchResult.entityType.forEach(type => typeOptions.push(type.name));
          statusOptions.push(searchResult.status.name);
        });
        this.schemeOptions = [...new Set(schemeOptions)];
        this.typeOptions = [...new Set(typeOptions)];
        this.statusOptions = [...new Set(statusOptions)];

        this.selectedSchemes = [...new Set(schemeOptions)];
        this.selectedTypes = [...new Set(typeOptions)];
        this.selectedStatus = [...new Set(statusOptions)];
      }
    },

    filterResults() {
      const filteredSearchResults = [] as ConceptSummary[];
      (this.searchResults as ConceptSummary[]).forEach(searchResult => {
        let isOfTypes = false;
        searchResult.entityType.forEach(type => {
          if (this.selectedTypes.indexOf(type.name) != -1) {
            isOfTypes = true;
          }
        });

        if (this.selectedSchemes.indexOf(searchResult.scheme.name) != -1 && isOfTypes && this.selectedStatus.indexOf(searchResult.status.name) != -1) {
          filteredSearchResults.push(searchResult);
        }
      });
      this.localSearchResults = filteredSearchResults;
    },

    getFAIconFromType(types: TTIriRef[]) {
      return getFAIconFromType(types);
    },

    getColourFromType(types: TTIriRef[]) {
      return "color: " + getColourFromType(types);
    },
    onRowContextMenu(event: any) {
      (this.$refs.cm as any).show(event.originalEvent);
    },

    getNamesFromTypes(typeList: TTIriRef[]) {
      return typeList.map(type => type.name).join(", ");
    },

    onRowDblClick(event: any) {
      this.selectedResult = event.data;
      this.navigate();
    },

    navigate(): void {
      const currentRoute = this.$route.name as RouteRecordName | undefined;
      if (isOfTypes(this.selectedResult?.entityType, IM.FOLDER)) {
        this.$router.push({
          name: currentRoute,
          params: { selectedIri: this.selectedResult.iri }
        });
      } else {
        const viewAppBase = "https://dev.endhealth.co.uk/#/concept/";
        window.open(viewAppBase + encodeURIComponent(this.selectedResult?.iri));
      }
    }
  }
});
</script>

<style scoped>
label {
  font-size: 1rem !important;
}

#search-results-main-container {
  padding-top: 1rem;
  grid-area: content;
  height: calc(100% - 4.1rem);
  width: 100%;
  overflow-y: auto;
  background-color: #ffffff;
}

.p-tabview-panel {
  min-height: 100%;
}

.p-datatable {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  height: 100%;
}
</style>
