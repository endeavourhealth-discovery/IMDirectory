<template>
  <!-- <div id="side-bar"> -->
  <NavTree />
  <!-- </div> -->
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { SearchRequest } from "@/models/search/SearchRequest";
import { SortBy } from "@/models/search/SortBy";
import axios from "axios";
import { mapState } from "vuex";
import { TTIriRef } from "@/models/TripleTree";
import { EntityReferenceNode } from "@/models/EntityReferenceNode";
import { Namespace } from "@/models/Namespace";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { getContainerElementOptimalHeight } from "@/helpers/GetContainerElementOptimalHeight";
import EntityService from "@/services/EntityService";
import { IM } from "@/vocabulary/IM";
import { FilterDefaultsConfig } from "@/models/configs/FilterDefaultsConfig";
import ConfigService from "@/services/ConfigService";
import NavTree from "@/components/home/NavTree.vue";

export default defineComponent({
  name: "Navigator",
  components: {
    NavTree
  },
  computed: mapState(["filterOptions", "selectedFilters", "searchResults", "focusHierarchy", "sidebarControlActivePanel"]),
  watch: {
    focusHierarchy(newValue) {
      if (newValue) {
        this.$store.commit("updateFocusHierarchy", false);
      }
    },
    sidebarControlActivePanel(newValue) {
      this.active = newValue;
    }
  },
  data() {
    return {
      loading: false,
      searchTerm: "",
      active: 0,
      debounce: 0,
      request: {} as { cancel: any; msg: string },
      sideMenuHeight: "",
      configs: {} as FilterDefaultsConfig,
      filtersLoaded: false
    };
  },
  async mounted() {
    window.addEventListener("resize", this.onResize);
    await this.init();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    async init() {
      await this.getConfigs();
      await this.setFilterOptions();
      this.setFilterDefaults();
      this.filtersLoaded = true;
      this.setContainerHeights();
    },

    tabChange(event: any): void {
      this.$store.commit("updateSidebarControlActivePanel", event.index);
    },

    onResize(): void {
      this.setContainerHeights();
    },

    async getConfigs(): Promise<void> {
      this.configs = await ConfigService.getFilterDefaults();
      this.$store.commit("updateFilterDefaults", this.configs);
    },

    async setFilterOptions(): Promise<void> {
      const schemeOptions = await EntityService.getNamespaces();
      const statusOptions = await EntityService.getEntityChildren(IM.STATUS);
      const typeOptions = await EntityService.getEntityChildren(IM.MODELLING_ENTITY_TYPE);

      this.$store.commit("updateFilterOptions", {
        status: statusOptions,
        schemes: schemeOptions,
        types: typeOptions
      });
    },

    setFilterDefaults() {
      const selectedStatus = this.filterOptions.status.filter((item: EntityReferenceNode) => this.configs.statusOptions.includes(item["@id"]));
      const selectedSchemes = this.filterOptions.schemes.filter((item: Namespace) => this.configs.schemeOptions.includes(item.iri));
      const selectedTypes = this.filterOptions.types.filter((item: EntityReferenceNode) => this.configs.typeOptions.includes(item["@id"]));

      this.$store.commit("updateSelectedFilters", {
        status: selectedStatus,
        schemes: selectedSchemes,
        types: selectedTypes
      });
      this.$store.commit("updateHierarchySelectedFilters", selectedSchemes);
    },

    async search(): Promise<void> {
      // if (this.searchTerm.length > 2) {
      this.loading = true;
      this.$store.commit("updateSidebarControlActivePanel", 1);
      const searchRequest = new SearchRequest();
      searchRequest.termFilter = this.searchTerm;
      searchRequest.sortBy = SortBy.Usage;
      searchRequest.page = 1;
      searchRequest.size = 100;
      searchRequest.schemeFilter = this.selectedFilters.schemes.map((scheme: Namespace) => scheme.iri);

      searchRequest.statusFilter = [];
      this.selectedFilters.status.forEach((status: EntityReferenceNode) => {
        searchRequest.statusFilter.push(status["@id"]);
      });

      searchRequest.typeFilter = [];
      this.selectedFilters.types.forEach((type: TTIriRef) => {
        searchRequest.typeFilter.push(type["@id"]);
      });
      if (isObjectHasKeys(this.request, ["cancel", "msg"])) {
        await this.request.cancel({ status: 499, message: "Search cancelled by user" });
      }
      const axiosSource = axios.CancelToken.source();
      this.request = { cancel: axiosSource.cancel, msg: "Loading..." };
      await this.$store.dispatch("fetchSearchResults", {
        searchRequest: searchRequest,
        cancelToken: axiosSource.token
      });
      this.loading = false;
      // }
    },

    debounceForSearch(): void {
      clearTimeout(this.debounce);
      this.debounce = window.setTimeout(() => {
        this.search();
      }, 600);
    },

    setContainerHeights(): void {
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

.hierarchy-filter-container {
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

.p-tabview-panel {
  overflow-x: hidden;
}

.loading-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}
</style>
