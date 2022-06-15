<template>
  <div id="search-results-main-container">
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
      :paginator="true"
      :rows="20"
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
      :loading="isLoading"
      v-model:contextMenuSelection="selected"
      ref="searchTable"
      dataKey="iri"
    >
      <template #empty>
        None
      </template>
      <Column field="name" header="Name">
        <template #body="slotProps">
          <div class="ml-2">
            <span :style="'color: ' + slotProps.data.colour" class="p-mx-1">
              <i v-if="slotProps.data.icon" :class="slotProps.data.icon" aria-hidden="true" />
            </span>
            <span class="break-all">{{ slotProps.data.match }}</span>
          </div>
        </template>
      </Column>
      <Column field="entityType" header="Types">
        <template #body="slotProps">
          <span class="break-all">{{ slotProps.data.typeNames }}</span>
        </template>
      </Column>
      <Column field="status" header="Status">
        <template #body="slotProps">
          <span>{{ slotProps.data.status?.name }}</span>
        </template>
      </Column>
      <Column field="code" header="Code">
        <template #body="slotProps">
          <span class="break-all">{{ slotProps.data.code }}</span>
        </template>
      </Column>
      <Column :exportable="false" bodyStyle="text-align: center; overflow: visible; justify-content: flex-end;">
        <template #body="slotProps">
          <div class="buttons-container">
            <Button icon="fa-solid fa-sitemap" class="p-button-rounded p-button-text p-button-plain row-button" @click="locate(slotProps)" v-tooltip.top="" />
            <Button
              v-if="slotProps.data.hasChildren"
              @click="open"
              aria-haspopup="true"
              aria-controls="overlay_menu"
              type="button"
              class="p-button-rounded p-button-text p-button-plain row-button"
              icon="pi pi-folder-open"
              v-tooltip.top="'Open'"
            />
            <Button icon="pi pi-fw pi-eye" class="p-button-rounded p-button-text p-button-plain row-button" @click="view(slotProps)" v-tooltip.top="'View'" />
            <Button
              icon="pi pi-fw pi-info-circle"
              class="p-button-rounded p-button-text p-button-plain row-button"
              @click="showInfo(slotProps)"
              v-tooltip.top="'Info'"
            />
            <Button
              icon="fa-solid fa-pen-to-square"
              class="p-button-rounded p-button-text p-button-plain row-button"
              @click="edit(slotProps)"
              v-tooltip.top="'Edit'"
            />
            <Button
              v-if="isFavourite(slotProps.data.iri)"
              style="color: #e39a36"
              icon="pi pi-fw pi-star-fill"
              class="p-button-rounded p-button-text row-button-fav"
              @click="updateFavourites(slotProps)"
              v-tooltip.left="'Unfavourite'"
            />

            <Button
              v-else
              icon="pi pi-fw pi-star"
              class="p-button-rounded p-button-text p-button-plain row-button"
              @click="updateFavourites(slotProps)"
              v-tooltip.left="'Favourite'"
            />
          </div>
        </template>
      </Column>
    </DataTable>
    <ContextMenu :model="rClickOptions" ref="cm" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";
import { Helpers, Models } from "im-library";
const {
  ConceptTypeMethods: { getColourFromType, getFAIconFromType, isFolder, getNamesAsStringFromTypes },
  DataTypeCheckers: { isArrayHasLength, isObjectHasKeys }
} = Helpers;

export default defineComponent({
  name: "SearchResultsTable",
  computed: {
    ...mapState(["searchLoading", "filterOptions", "selectedFilters", "searchResults", "favourites", "filterDefaults"]),

    isLoading() {
      if (this.loading || this.searchLoading) return true;
      else return false;
    }
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
      localSearchResults: [] as any[],
      loading: true,
      selected: {} as any,
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
    updateFavourites(row?: any) {
      if (row) this.selected = row.data;
      this.$store.commit("updateFavourites", this.selected.iri);
    },

    isFavourite(iri: string) {
      if (!this.favourites.length) return false;
      return this.favourites.includes(iri);
    },

    init() {
      this.loading = true;
      this.localSearchResults = [...this.searchResults];
      this.processSearchResults();
      if (isArrayHasLength(this.localSearchResults)) {
        this.setFiltersFromSearchResults();
      } else {
        this.setFilterDefaults();
      }
      this.loading = false;
    },

    processSearchResults() {
      for (const result of this.localSearchResults) {
        if (isObjectHasKeys(result, ["entityType"])) {
          result.icon = getFAIconFromType(result.entityType);
          result.colour = getColourFromType(result.entityType);
          result.typeNames = getNamesAsStringFromTypes(result.entityType);
          result.favourite = this.isFavourite(result.iri);
        }
      }
    },

    setFilterDefaults() {
      this.schemeOptions = this.filterOptions.schemes.map((scheme: any) => scheme.name);
      this.typeOptions = this.filterOptions.types.map((type: any) => type.name);
      this.statusOptions = this.filterOptions.status.map((item: any) => item.name);
      this.selectedSchemes = this.filterOptions.schemes
        .filter((option: any) => this.filterDefaults.schemeOptions.includes(option.iri))
        .map((scheme: any) => scheme.name);
      this.selectedStatus = this.filterOptions.status
        .filter((option: any) => this.filterDefaults.statusOptions.includes(option["@id"]))
        .map((status: any) => status.name);
      this.selectedTypes = this.filterOptions.types
        .filter((option: any) => this.filterDefaults.typeOptions.includes(option["@id"]))
        .map((type: any) => type.name);
    },

    setFiltersFromSearchResults() {
      const schemeOptions = [] as string[];
      const typeOptions = [] as string[];
      const statusOptions = [] as string[];
      (this.localSearchResults as Models.Search.ConceptSummary[]).forEach(searchResult => {
        schemeOptions.push(searchResult.scheme?.name);
        searchResult.entityType.forEach(type => {
          if (this.filterDefaults.typeOptions.includes(type["@id"])) typeOptions.push(type.name);
        });
        statusOptions.push(searchResult.status?.name);
      });
      this.schemeOptions = [...new Set(schemeOptions)];
      this.typeOptions = [...new Set(typeOptions)];
      this.statusOptions = [...new Set(statusOptions)];

      this.selectedSchemes = [...new Set(schemeOptions)];
      this.selectedTypes = [...new Set(typeOptions)];
      this.selectedStatus = [...new Set(statusOptions)];
    },

    showInfo(row?: any) {
      if (row) this.selected = row.data;

      this.$store.commit("updateSelectedConceptIri", this.selected.iri);
      this.$emit("openBar");
    },

    filterResults() {
      const filteredSearchResults = [] as Models.Search.ConceptSummary[];
      (this.searchResults as Models.Search.ConceptSummary[]).forEach(searchResult => {
        let isSelectedType = false;
        searchResult.entityType.forEach(type => {
          if (this.selectedTypes.indexOf(type.name) != -1) {
            isSelectedType = true;
          }
        });

        if (this.selectedSchemes.indexOf(searchResult.scheme.name) != -1 && isSelectedType && this.selectedStatus.indexOf(searchResult.status.name) != -1) {
          filteredSearchResults.push(searchResult);
        }
      });
      this.localSearchResults = [...filteredSearchResults];
      this.processSearchResults();
    },

    onRowSelect(row: any) {
      this.$store.commit("updateSelectedConceptIri", row.data.iri);
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

    navigateToEditor(): void {
      this.$directService.directTo(this.$env.EDITOR_URL, this.selected.iri, "editor");
    },

    onRightClick(event: any) {
      this.updateRClickOptions();
      (this.$refs.menu as any).show(event);
    },

    onRowDblClick(event: any) {
      this.selected = event.data;
      if (isFolder(this.selected?.entityType)) this.open();
      else this.view();
    },

    open() {
      this.$router.push({
        name: "Folder",
        params: { selectedIri: this.selected.iri }
      });
    },

    view(row?: any) {
      if (row) this.selected = row.data;
      this.$directService.directTo(this.$env.VIEWER_URL, this.selected.iri, "concept");
    },

    edit(row?: any) {
      if (row) this.selected = row.data;
      this.$directService.directTo(this.$env.EDITOR_URL, this.selected.iri, "editor");
    },

    locate(row: any) {
      if (row) {
        this.$router.push({
          name: "Folder",
          params: { selectedIri: row.data.iri }
        });
        this.$store.commit("updateLocateOnNavTreeIri", row.data.iri);
      }
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
  height: 100%;
  flex: 1 1 auto;
  overflow: auto;
  background-color: #ffffff;
  display: flex;
  flex-flow: column nowrap;
}

.filters-container {
  width: 100%;
  padding-top: 1rem;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
}

.p-inputgroup {
  width: 33.3%;
  padding: 0.5rem;
}

.p-datatable {
  flex: 1 1 auto;
  overflow: auto;
}

.buttons-container {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
  row-gap: 0.5rem;
}

.break-all {
  word-break: break-all;
}

.row-button:hover {
  background-color: #6c757d !important;
  color: #ffffff !important;
}

.row-button-fav:hover {
  background-color: #e39a36 !important;
  color: #ffffff !important;
}
</style>
