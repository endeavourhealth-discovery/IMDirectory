<template>
  <Splitter id="side-bar" layout="vertical">
    <SplitterPanel :size="50">
      <NavTree />
    </SplitterPanel>
    <SplitterPanel :size="50">
      <FavTree />
    </SplitterPanel>
  </Splitter>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";
import { mapState } from "vuex";
import EntityService from "@/services/EntityService";
import ConfigService from "@/services/ConfigService";
import NavTree from "@/components/home/NavTree.vue";
import FavTree from "@/components/home/FavTree.vue";
import { TTIriRef, EntityReferenceNode, Namespace, FilterDefaultsConfig } from "im-library/dist/types/interfaces/Interfaces";
import { Enums, Helpers, Vocabulary, Models } from "im-library";
const {
  DataTypeCheckers: { isObjectHasKeys },
  ContainerDimensionGetters: { getContainerElementOptimalHeight }
} = Helpers;
const { IM } = Vocabulary;
const {
  Search: { SearchRequest }
} = Models;
const { SortBy } = Enums;

export default defineComponent({
  name: "Navigator",
  components: {
    NavTree,
    FavTree
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
  max-height: calc(100vh - 4rem);
  height: calc(100vh - 4rem);
  overflow: auto;
}
</style>
