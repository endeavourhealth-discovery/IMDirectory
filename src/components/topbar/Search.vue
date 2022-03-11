<template>
  <div>
      <AutoComplete
        id="autocomplete-search"
        @keydown="directToSearchView"
        autoWidth="false"
        v-model="searchText"
        :suggestions="searchResults"
        placeholder="Search"
        @complete="search"
        @item-select="navigate"
      >
        <template #item="data">
          <div class="ml-2" v-tooltip.left="data.item.code">
            <span :style="getColourFromType(data.item.entityType)" class="p-mx-1">
              <font-awesome-icon v-if="data.item.entityType && data.item.entityType.length" :icon="getFAIconFromType(data.item.entityType)" />
            </span>
            {{ data.item.name }}
          </div>
        </template>
      </AutoComplete>

      <Button id="filter-button" icon="pi pi-sliders-h" class="p-button-rounded p-button-text p-button-plain p-button-lg" @click="openFiltersOverlay" />
      <OverlayPanel ref="filtersO" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: '450px' }">
        <div class="p-fluid results-filter-container">
          <Filters :search="search" />
        </div>
      </OverlayPanel>
  </div>
</template>

<script lang="ts">
import Filters from "@/components/topbar/Filters.vue";
import axios, { CancelToken } from "axios";
import { defineComponent } from "vue";
import { mapState } from "vuex";
import { RouteRecordName } from "vue-router";
import DirectService from "@/services/DirectService";
import { TTIriRef, Namespace, EntityReferenceNode, AccountItem, LoginItem, ModuleItem } from "im-library/dist/types/interfaces/Interfaces";
import { Enums, Models, Helpers, Vocabulary } from "im-library";
const { AppEnum, SortBy } = Enums;
const {
  DataTypeCheckers: { isObjectHasKeys },
  ModuleIris: { MODULE_IRIS },
  ConceptTypeMethods: { getColourFromType, getFAIconFromType, isOfTypes }
} = Helpers;
const { IM } = Vocabulary;
const {
  Search: { ConceptSummary, SearchRequest }
} = Models;

export default defineComponent({
  name: "Search",
  components: { Filters },
  mounted() {
    this.setUserMenuItems();
  },
  computed: {
    autocompleteDisplay() {
      return this.$route.name === "Search";
    },
    ...mapState(["currentUser", "isLoggedIn", "conceptIri", "filterOptions", "selectedFilters", "searchResults", "authReturnUrl"])
  },
  data() {
    return {
      request: {} as { cancel: any; msg: string },
      searchText: "",
      loginItems: [] as LoginItem[],
      accountItems: [] as AccountItem[]
    };
  },
  methods: {
    navigateToEditor(): void {
      DirectService.directTo(AppEnum.EDITOR, "", this);
    },
    getItems(): LoginItem[] | AccountItem[] {
      if (this.isLoggedIn) {
        return this.accountItems;
      } else {
        return this.loginItems;
      }
    },

    openUserMenu(event: any): void {
      (this.$refs.userMenu as any).toggle(event);
    },

    getUrl(item: string): string {
      const url = new URL(`../../assets/avatars/${item}`, import.meta.url);
      return url.href;
    },

    getFAIconFromType(types: TTIriRef[]) {
      return getFAIconFromType(types);
    },

    getColourFromType(types: TTIriRef[]) {
      return "color: " + getColourFromType(types);
    },

    openAppsOverlay() {
      (this.$refs.appsO as any).toggle(event);
    },
    openFiltersOverlay() {
      (this.$refs.filtersO as any).toggle(event);
    },

    navigate(event: any): void {
      const currentRoute = this.$route.name as RouteRecordName | undefined;
      if (isOfTypes(event.value?.entityType, IM.FOLDER)) {
        this.$router.push({
          name: currentRoute,
          params: { selectedIri: event.value.iri }
        });
      } else {
        DirectService.directTo(AppEnum.VIEWER, event.value.iri, this);
      }
      this.searchText = "";
    },

    toLandingPage() {
      this.$router.push({
        path: "/"
      });
    },

    directToSearchView(event: any) {
      if (event.code === "Enter") {
        this.$router.push({
          name: "Search"
        });
      }
    },

    async search(): Promise<void> {
      this.$store.commit("updateSearchLoading", true);
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
      this.$store.commit("updateSearchLoading", false);
    },
    setUserMenuItems(): void {
      this.loginItems = [
        {
          label: "Login",
          icon: "fa fa-fw fa-user",
          url: import.meta.env.VITE_AUTH_URL + "login?returnUrl=" + this.authReturnUrl
        },
        {
          label: "Register",
          icon: "fa fa-fw fa-user-plus",
          url: import.meta.env.VITE_AUTH_URL + "register?returnUrl=" + this.authReturnUrl
        }
      ];
      this.accountItems = [
        {
          label: "My account",
          icon: "fa fa-fw fa-user",
          url: import.meta.env.VITE_AUTH_URL + "my-account?returnUrl=" + this.authReturnUrl
        },
        {
          label: "Edit account",
          icon: "fa fa-fw fa-user-edit",
          url: import.meta.env.VITE_AUTH_URL + "my-account/edit?returnUrl=" + this.authReturnUrl
        },
        {
          label: "Change password",
          icon: "fa fa-fw fa-user-lock",
          url: import.meta.env.VITE_AUTH_URL + "my-account/password-edit?returnUrl=" + this.authReturnUrl
        },
        {
          label: "Logout",
          icon: "fa fa-fw fa-sign-out-alt",
          url: import.meta.env.VITE_AUTH_URL + "logout?returnUrl=" + this.authReturnUrl
        }
      ];
    }
  }
});
</script>

<style>
#filter-button {
  height: 2.25rem;
}

#autocomplete-search {
  font-size: 1rem;
  background: #dee2e6;
  border: none;
  width: 30rem;
  height: 2.25rem;
}
</style>
