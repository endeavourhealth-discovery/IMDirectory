<template>
  <Menubar :model="items">
    <template #start>
      <img class="im-logo" src="../../assets/logos/Logo-object-empty.png" alt="IM logo" />
    </template>
    <template #end>
      <Button icon="pi pi-th-large" class="p-button-rounded p-button-text p-button-plain p-button-lg" @click="openAppsOverlay" />
      <OverlayPanel ref="appsO">
        <!-- <div class="p-fluid app-list-container"> -->
        <div class="p-grid " justify-content-end>
          <div class="p-col-4">
            <i class="pi pi-cog"></i>
          </div>
          <div class="p-col-4">4</div>
          <div class="p-col-4">4</div>
          <div class="p-col-4">4</div>
          <div class="p-col-4">4</div>
          <div class="p-col-4">4</div>
        </div>
        <!-- </div> -->
      </OverlayPanel>

      <AutoComplete
        class="p-inputtext-lg search-input"
        autoWidth="false"
        v-model="searchText"
        :suggestions="searchResults"
        placeholder="Search"
        @complete="search"
        @item-select="navigate"
      >
        <template #item="slotProps">
          <div class="ml-2">{{ slotProps.item.name }}</div>
        </template>
      </AutoComplete>

      <Button icon="pi pi-sliders-h" class="p-button-rounded p-button-text p-button-plain p-button-lg" @click="openFiltersOverlay" />
      <OverlayPanel ref="filtersO" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: '450px' }">
        <div class="p-fluid results-filter-container">
          <Filters :search="search" />
        </div>
      </OverlayPanel>
      <Button icon="pi pi-user" class="p-button-rounded p-button-text p-button-plain p-button-lg" />
    </template>
  </Menubar>
</template>

<script lang="ts">
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { EntityReferenceNode } from "@/models/EntityReferenceNode";
import { Namespace } from "@/models/Namespace";
import { ConceptSummary } from "@/models/search/ConceptSummary";
import { SearchRequest } from "@/models/search/SearchRequest";
import { SortBy } from "@/models/search/SortBy";
import { TTIriRef } from "@/models/TripleTree";
import Filters from "@/components/sidebar/Filters.vue";
import EntityService from "@/services/EntityService";
import axios, { CancelToken } from "axios";
import { defineComponent } from "vue";
import { RouteRecordName } from "vue-router";
import { mapState } from "vuex";

export default defineComponent({
  name: "TopBar",
  components: { Filters },
  watch: {},
  computed: mapState(["filterOptions", "selectedFilters", "searchResults", "focusHierarchy", "sidebarControlActivePanel"]),
  data() {
    return {
      loading: false,
      request: {} as { cancel: any; msg: string },
      searchText: "",
      items: [
        {
          label: "Videos",
          icon: "pi pi-fw pi-video",
          items: [
            [
              {
                label: "Video 1",
                items: [{ label: "Video 1.1" }, { label: "Video 1.2" }]
              },
              {
                label: "Video 2",
                items: [{ label: "Video 2.1" }, { label: "Video 2.2" }]
              }
            ],
            [
              {
                label: "Video 3",
                items: [{ label: "Video 3.1" }, { label: "Video 3.2" }]
              },
              {
                label: "Video 4",
                items: [{ label: "Video 4.1" }, { label: "Video 4.2" }]
              }
            ]
          ]
        },
        {
          label: "Users",
          icon: "pi pi-fw pi-users",
          items: [
            [
              {
                label: "User 1",
                items: [{ label: "User 1.1" }, { label: "User 1.2" }]
              },
              {
                label: "User 2",
                items: [{ label: "User 2.1" }, { label: "User 2.2" }]
              }
            ],
            [
              {
                label: "User 3",
                items: [{ label: "User 3.1" }, { label: "User 3.2" }]
              },
              {
                label: "User 4",
                items: [{ label: "User 4.1" }, { label: "User 4.2" }]
              }
            ],
            [
              {
                label: "User 5",
                items: [{ label: "User 5.1" }, { label: "User 5.2" }]
              },
              {
                label: "User 6",
                items: [{ label: "User 6.1" }, { label: "User 6.2" }]
              }
            ]
          ]
        },
        {
          label: "Events",
          icon: "pi pi-fw pi-calendar",
          items: [
            [
              {
                label: "Event 1",
                items: [{ label: "Event 1.1" }, { label: "Event 1.2" }]
              },
              {
                label: "Event 2",
                items: [{ label: "Event 2.1" }, { label: "Event 2.2" }]
              }
            ],
            [
              {
                label: "Event 3",
                items: [{ label: "Event 3.1" }, { label: "Event 3.2" }]
              },
              {
                label: "Event 4",
                items: [{ label: "Event 4.1" }, { label: "Event 4.2" }]
              }
            ]
          ]
        },
        {
          label: "Settings",
          icon: "pi pi-fw pi-cog",
          items: [
            [
              {
                label: "Setting 1",
                items: [{ label: "Setting 1.1" }, { label: "Setting 1.2" }]
              },
              {
                label: "Setting 2",
                items: [{ label: "Setting 2.1" }, { label: "Setting 2.2" }]
              },
              {
                label: "Setting 3",
                items: [{ label: "Setting 3.1" }, { label: "Setting 3.2" }]
              }
            ],
            [
              {
                label: "Setting 4",
                items: [{ label: "Setting 4.1" }, { label: "Setting 4.2" }]
              }
            ]
          ]
        }
      ]
    };
  },
  methods: {
    openAppsOverlay() {
      (this.$refs.appsO as any).toggle(event);
    },
    openFiltersOverlay() {
      (this.$refs.filtersO as any).toggle(event);
    },
    navigate(event: any): void {
      this.$router.push({
        name: "Concept",
        params: { selectedIri: event.value.iri }
      });
      this.searchText = "";
    },

    async search(): Promise<void> {
      this.loading = true;
      this.$store.commit("updateSidebarControlActivePanel", 1);
      const searchRequest = new SearchRequest();
      searchRequest.termFilter = this.searchText;
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
    }
  }
});
</script>

<style scoped>
.im-logo {
  text-align: center;
  color: lightgray;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 0rem;
}

.app-list-container {
  justify-content: center;
}

@media screen and (max-width: 1439px) {
  .im-logo {
    width: 3vw;
  }
}

@media screen and (min-width: 1440px) {
  .im-logo {
    width: 3vw;
  }
}
</style>
