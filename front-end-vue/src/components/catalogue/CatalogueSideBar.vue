<template>
  <div id="side-bar">
    <span class="p-input-icon-left search-bar">
      <i class="pi pi-search" aria-hidden="true" />
      <InputText
        type="text"
        v-model="searchTerm"
        @keydown="checkKey($event.code)"
        @input="debounceForSearch"
        placeholder="Search"
        class="p-inputtext-lg search-input"
        autoWidth="false"
      />
    </span>
    <TabView v-model:activeIndex="active" class="side-menu" :style="'maxHeight: ' + sideMenuHeight + ';'">
      <TabPanel>
        <template #header>
          <i class="fas fa-search icon-header" aria-hidden="true" />
          <span>Search Results</span>
        </template>
        <div class="p-fluid results-filter-container">
          <CatalogueSearchResults :loading="loading" :searchResults="searchResults" @searchResultSelected="updateHistory" />
          <CatalogueFilters v-if="typeOptions.length" :typeOptions="typeOptions" @typesSelected="updateTypes" />
        </div>
      </TabPanel>
      <TabPanel>
        <template #header>
          <i class="fas fa-history icon-header" aria-hidden="true" />
          <span>History</span>
        </template>
        <CatalogueHistory :history="history" />
      </TabPanel>
    </TabView>
  </div>
</template>

<script lang="ts">
import CatalogueService from "@/services/CatalogueService";
import { defineComponent, PropType } from "@vue/runtime-core";
import CatalogueSearchResults from "@/components/catalogue/catalogueSideBar/CatalogueSearchResults.vue";
import CatalogueFilters from "@/components/catalogue/catalogueSideBar/CatalogueFilters.vue";
import CatalogueHistory from "@/components/catalogue/catalogueSideBar/CatalogueHistory.vue";
import { isArrayHasLength, isObject } from "@/helpers/DataTypeCheckers";
import axios from "axios";
import { mapState } from "vuex";
import { InstanceHistoryItem } from "@/models/catalogue/InstanceHistoryItem";
import { SimpleCount } from "@/models/SimpleCount";
import { InstanceSearchResult } from "@/models/catalogue/InstanceSearchResult";
import { getContainerElementOptimalHeight } from "@/helpers/GetContainerElementOptimalHeight";

export default defineComponent({
  name: "CatalogueSideBar",
  props: {
    history: { type: Array as PropType<InstanceHistoryItem[]>, required: false },
    typeOptions: { type: Array as PropType<SimpleCount[]>, required: true }
  },
  components: { CatalogueSearchResults, CatalogueFilters, CatalogueHistory },
  emits: { updateHistory: (payload: any) => true },
  computed: { ...mapState(["catalogueSearchResults"]) },
  async mounted() {
    window.addEventListener("resize", this.onResize);
    if (isArrayHasLength(this.catalogueSearchResults)) this.searchResults = this.catalogueSearchResults;
    this.setContainerHeight();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  data() {
    return {
      searchTerm: "",
      searchResults: [] as InstanceSearchResult[],
      selectedTypes: [] as SimpleCount[],
      active: 0,
      debounce: 0,
      loading: false,
      request: {} as { cancel: any; msg: string },
      sideMenuHeight: ""
    };
  },
  methods: {
    onResize(): void {
      this.setContainerHeight();
    },

    async getSearchResult(): Promise<void> {
      if (this.searchTerm.length < 3) return;
      this.loading = true;
      if (isObject(this.request) && isArrayHasLength(Object.keys(this.request))) {
        await this.request.cancel({ status: 499, message: "Search cancelled by user" });
      }
      const axiosSource = axios.CancelToken.source();
      this.request = { cancel: axiosSource.cancel, msg: "Loading..." };
      const selectedTypeIris = this.selectedTypes.map(type => type.iri);
      this.searchResults = await CatalogueService.getSearchResult(this.searchTerm, selectedTypeIris, axiosSource.token);
      this.$store.commit("updateCatalogueSearchResults", this.searchResults);
      this.loading = false;
    },

    debounceForSearch(): void {
      clearTimeout(this.debounce);
      this.debounce = window.setTimeout(() => {
        this.getSearchResult();
      }, 600);
    },

    updateTypes(types: SimpleCount[]): void {
      this.selectedTypes = types;
    },

    checkKey(event: any): void {
      if (event === "Enter") {
        this.getSearchResult();
      }
    },

    updateHistory(historyItem: InstanceHistoryItem): void {
      this.$emit("updateHistory", historyItem);
    },

    setContainerHeight(): void {
      this.sideMenuHeight = getContainerElementOptimalHeight("side-bar", ["search-bar"], false);
    }
  }
});
</script>

<style scoped>
#side-bar {
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  max-height: calc(100vh - 2rem);
  grid-area: sidebar;
  height: calc(100vh - 2rem);
  width: 30vw;
}

.side-menu {
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  flex-grow: 100;
}

.side-menu ::v-deep(.p-tabview-panels) {
  flex-grow: 6;
  overflow-y: auto;
}

.side-menu ::v-deep(.p-tabview-panel) {
  height: 100%;
}

.results-filter-container {
  display: flex;
  flex-flow: column;
  justify-content: space-between;
  height: 100%;
}

.search-bar {
  width: 100%;
}

.search-input {
  width: 100%;
}

.icon-header {
  margin: 0 4px 0 0;
}
</style>
