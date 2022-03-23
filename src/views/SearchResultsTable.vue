<template>
  <div id="search-results-main-container">
    <div class="card">
      <div class="filters-container">
        <div class="p-inputgroup">
          <span class="p-float-label">
            <MultiSelect id="status" v-model="selectedStatus" @change="filterResults" :options="statusOptions" display="chip" />
            <label for="status">Select status:</label>
          </span>
        </div>
        <div class="p-inputgroup">
          <span class="p-float-label">
            <MultiSelect id="scheme" v-model="selectedSchemes" @change="filterResults" :options="schemeOptions" display="chip" />
            <label for="scheme">Select scheme:</label>
          </span>
        </div>
        <div class="p-inputgroup">
          <span class="p-float-label">
            <MultiSelect id="type" v-model="selectedTypes" @change="filterResults" :options="typeOptions" display="chip" />
            <label for="type">Select concept type:</label>
          </span>
        </div>
      </div>

      <DataTable
        :value="localSearchResults"
        class="p-datatable-sm"
        v-model:selection="selected"
        selectionMode="single"
        @rowUnselect="onRowUnselect"
        @rowSelect="onRowSelect"
        @rowContextmenu="onRowContextMenu"
        @contextmenu="onRightClick"
        @row-dblclick="onRowDblClick"
        :scrollable="true"
        scrollHeight="flex"
        :loading="searchLoading"
        v-model:contextMenuSelection="selected"
        ref="searchTable"
        dataKey="iri"
      >
        <Column field="name" header="Name">
          <template #body="slotProps">
            <div class="ml-2">
              <span :style="getColourFromType(slotProps.data.entityType)" class="p-mx-1">
                <font-awesome-icon v-if="slotProps.data.entityType && slotProps.data.entityType.length" :icon="getFAIconFromType(slotProps.data.entityType)" />
              </span>
              {{ slotProps.data.match }}
              <span v-if="isFavourite(slotProps.data.iri)" style="color: #e39a36" class="p-mx-1">
                <i class="fa-solid fa-star"></i>
              </span>
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
import DirectService from "@/services/DirectService";
import { defineComponent } from "vue";
import { RouteRecordName } from "vue-router";
import { mapState } from "vuex";
import { TTIriRef } from "im-library/dist/types/interfaces/Interfaces";
import { Enums, Helpers, Vocabulary, Models } from "im-library";
const { IM } = Vocabulary;
const {
  ConceptTypeMethods: { getColourFromType, getFAIconFromType, isOfTypes }
} = Helpers;
const {
  Search: { ConceptSummary }
} = Models;
const { AppEnum } = Enums;

export default defineComponent({
  name: "SearchResultsTable",
  computed: {
    ...mapState(["highLevelTypes", "searchLoading", "filterOptions", "selectedFilters", "searchResults", "favourites"])
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
      localSearchResults: [] as Models.Search.ConceptSummary[],
      selected: {} as Models.Search.ConceptSummary,
      rClickOptions: [
        {
          label: "Open",
          icon: "pi pi-fw pi-folder-open",
          command: () => this.open()
        },
        {
          label: "View",
          icon: "pi pi-fw pi-eye",
          command: () => this.view()
        },
        {
          label: "Info",
          icon: "pi pi-fw pi-info-circle",
          command: () => this.showInfo()
        },
        // {
        //   label: "Edit",
        //   icon: "pi pi-fw pi-pencil",
        //   command: () => this.navigateToEditor()
        // },
        // {
        //   label: "Move to",
        //   icon: "pi pi-fw pi-arrow-circle-right",
        //   command: () => this.showInfo()
        // },
        {
          separator: true
        },
        {
          label: "Favourite",
          icon: "pi pi-fw pi-star",
          command: () => this.updateFavourites()
        }
      ]
    };
  },
  methods: {
    updateFavourites() {
      this.$store.commit("updateFavourites", this.selected.iri);
    },
    isFavourite(iri: string) {
      if (!this.favourites.length) return false;
      return this.favourites.includes(iri);
    },
    init() {
      this.localSearchResults = this.searchResults;
      const schemeOptions = [] as string[];
      const typeOptions = [] as string[];
      const statusOptions = [] as string[];
      if (this.localSearchResults) {
        (this.localSearchResults as Models.Search.ConceptSummary[]).forEach(searchResult => {
          schemeOptions.push(searchResult.scheme.name);
          searchResult.entityType.forEach(type => {
            if (this.highLevelTypes.includes(type["@id"])) typeOptions.push(type.name);
          });
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

    showInfo() {
      this.$store.commit("updateSelectedConceptIri", this.selected.iri);
      this.$emit("openBar");
    },

    filterResults() {
      const filteredSearchResults = [] as Models.Search.ConceptSummary[];
      (this.searchResults as Models.Search.ConceptSummary[]).forEach(searchResult => {
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

    onRowSelect(row: any) {
      this.$store.commit("updateSelectedConceptIri", row.data.iri);
    },

    getFAIconFromType(types: TTIriRef[]) {
      return getFAIconFromType(types);
    },

    getColourFromType(types: TTIriRef[]) {
      return "color: " + getColourFromType(types);
    },

    updateRClickOptions() {
      this.rClickOptions[this.rClickOptions.length - 1].label = this.isFavourite(this.selected.iri) ? "Unfavourite" : "Favourite";
    },

    onRowContextMenu(event: any) {
      this.updateRClickOptions();
      (this.$refs.cm as any).show(event.originalEvent);
    },

    onRowUnselect() {
      this.selected = {} as Models.Search.ConceptSummary;
    },

    getNamesFromTypes(typeList: TTIriRef[]) {
      return typeList.map(type => type.name).join(", ");
    },

    navigateToEditor(): void {
      DirectService.directTo(AppEnum.EDITOR, this.selected.iri, this);
    },

    onRightClick(event: any) {
      this.updateRClickOptions();
      (this.$refs.menu as any).show(event);
    },

    onRowDblClick(event: any) {
      this.selected = event.data;
      if (isOfTypes(this.selected?.entityType, IM.FOLDER)) this.open();
      else this.view();
    },

    open() {
      this.$router.push({
        name: "Folder",
        params: { selectedIri: this.selected.iri }
      });
    },

    view() {
      DirectService.directTo(AppEnum.VIEWER, this.selected.iri, this);
    }
  }
});
</script>

<style scoped>
.card {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
}

label {
  font-size: 1rem !important;
}

#search-results-main-container {
  padding-top: 1rem;
  height: 100%;
  background-color: #ffffff;
}

.filters-container {
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
}

.p-inputgroup {
  width: 33.3%;
  padding: 0.5rem;
}

.p-datatable {
  height: calc(100% - 3.5rem) !important;
}
</style>
