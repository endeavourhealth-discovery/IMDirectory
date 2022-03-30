<template>
  <div>
    <AutoComplete
      id="autocomplete-search"
      autoWidth="false"
      v-model="searchText"
      placeholder="Search"
      :suggestions="searchResults"
      @complete="search"
      @item-select="navigate"
    />

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
import axios from "axios";
import { defineComponent } from "vue";
import { mapState } from "vuex";
import { RouteRecordName } from "vue-router";
import DirectService from "@/services/DirectService";
import { TTIriRef, Namespace, EntityReferenceNode, AccountItem, LoginItem } from "im-library/dist/types/interfaces/Interfaces";
import { Enums, Env, Models, Helpers, Vocabulary } from "im-library";
const { AppEnum, SortBy } = Enums;
const {
  DataTypeCheckers: { isObjectHasKeys },
  ConceptTypeMethods: { getColourFromType, getFAIconFromType, isOfTypes }
} = Helpers;
const { IM } = Vocabulary;
const {
  Search: { SearchRequest }
} = Models;

export default defineComponent({
  name: "Search",
  components: { Filters },
  mounted() {
    this.setUserMenuItems();
  },
  computed: {
    ...mapState(["conceptIri", "filterOptions", "searchResults", "selectedFilters", "authReturnUrl"])
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

    getFAIconFromType(types: TTIriRef[]) {
      return getFAIconFromType(types);
    },

    getColourFromType(types: TTIriRef[]) {
      return "color: " + getColourFromType(types);
    },

    openFiltersOverlay(event: any) {
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

    async search(): Promise<void> {
      if (this.searchText) {
        this.$router.push({
          name: "Search"
        });
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
      }
    },
    setUserMenuItems(): void {
      this.loginItems = [
        {
          label: "Login",
          icon: "fa fa-fw fa-user",
          url: Env.authUrl + "login?returnUrl=" + this.authReturnUrl
        },
        {
          label: "Register",
          icon: "fa fa-fw fa-user-plus",
          url: Env.authUrl + "register?returnUrl=" + this.authReturnUrl
        }
      ];
      this.accountItems = [
        {
          label: "My account",
          icon: "fa fa-fw fa-user",
          url: Env.authUrl + "my-account?returnUrl=" + this.authReturnUrl
        },
        {
          label: "Edit account",
          icon: "fa fa-fw fa-user-edit",
          url: Env.authUrl + "my-account/edit?returnUrl=" + this.authReturnUrl
        },
        {
          label: "Change password",
          icon: "fa fa-fw fa-user-lock",
          url: Env.authUrl + "my-account/password-edit?returnUrl=" + this.authReturnUrl
        },
        {
          label: "Logout",
          icon: "fa fa-fw fa-sign-out-alt",
          url: Env.authUrl + "logout?returnUrl=" + this.authReturnUrl
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

.p-autocomplete-panel {
  width: 30rem;
}

.autocomplete-row {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
}

.autocomplete-row-name {
  max-width: calc(100% - 0.5rem);
  height: fit-content;
  word-wrap: break-word;
  white-space: normal;
}

.fa-icon {
  padding-right: 0.25rem;
}

.p-autocomplete-items {
  display: none;
}
</style>
