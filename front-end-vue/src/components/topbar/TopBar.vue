<template>
  <Menubar>
    <template #start>
      <img class="im-logo" src="../../assets/logos/Logo-object-empty.png" alt="IM logo" v-on:click="toLangingPage" />
      <InputText id="text-input-search" v-if="autocompleteDisplay" v-model="searchText" @input="search" type="text" placeholder="Search" />

      <AutoComplete
        id="autocomplete-search"
        v-else
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
    </template>
    <template #end>
      <Button icon="pi pi-th-large" class="p-button-rounded p-button-text p-button-plain p-button-lg" @click="openAppsOverlay" />
      <OverlayPanel ref="appsO">
        <div class="grid">
          <div class="col-6">
            <Button v-tooltip.bottom="'Editor'" icon="far fa-edit" class="p-button-rounded p-button-text p-button-plain" @click="navigateToEditor" />
          </div>
          <div class="col-6">
            <Button v-tooltip.bottom="'UPRN'" icon="far fa-map" class="p-button-rounded p-button-text p-button-plain" @click="navigateToEditor" />
          </div>
        </div>
      </OverlayPanel>

      <Button
        v-if="!isLoggedIn"
        icon="pi pi-user"
        class="p-button-rounded p-button-text p-button-plain p-button-lg"
        @click="openUserMenu"
        aria-haspopup="true"
        aria-controls="overlay_menu"
      />
      <Button
        v-if="isLoggedIn"
        class="p-button-rounded p-button-text p-button-plain p-button-lg"
        @click="openUserMenu"
        aria-haspopup="true"
        aria-controls="overlay_menu"
      >
        <img class="avatar-icon" alt="avatar icon" :src="getUrl(currentUser.avatar)" style="width: 1.5rem" />
      </Button>
      <Menu ref="userMenu" :model="getItems()" :popup="true" />
    </template>
  </Menubar>
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
  name: "TopBar",
  components: { Filters },
  watch: {},
  computed: {
    autocompleteDisplay() {
      return this.$route.name === "Search";
    },
    ...mapState(["currentUser", "isLoggedIn", "conceptIri", "filterOptions", "selectedFilters", "searchResults"])
  },
  data() {
    return {
      request: {} as { cancel: any; msg: string },
      searchText: "",
      loginItems: [
        {
          label: "Login",
          icon: "fa fa-fw fa-user",
          url: "/user/login"
        },
        {
          label: "Register",
          icon: "fa fa-fw fa-user-plus",
          to: "/user/register"
        }
      ] as LoginItem[],

      accountItems: [
        {
          label: "My account",
          icon: "fa fa-fw fa-user",
          url: "/user/my-account"
        },
        {
          label: "Edit account",
          icon: "fa fa-fw fa-user-edit",
          to: "/user/my-account/edit"
        },
        {
          label: "Change password",
          icon: "fa fa-fw fa-user-lock",
          to: "/user/my-account/password-edit"
        },
        {
          label: "Logout",
          icon: "fa fa-fw fa-sign-out-alt",
          to: "/user/logout"
        }
      ] as AccountItem[]
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
      return require("@/assets/avatars/" + item);
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

    toLangingPage() {
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
    }
  }
});
</script>

<style>
.im-logo {
  text-align: center;
  color: lightgray;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 0rem;
  position: absolute;
  z-index: 100;
}

.app-list-container {
  justify-content: center;
}

@media screen and (max-width: 1439px) {
  .im-logo {
    width: 40px;
  }
}

@media screen and (min-width: 1440px) {
  .im-logo {
    width: 40px;
  }
}
#filter-button {
  height: 40px;
}

#autocomplete-search {
  font-size: 1rem;
  background: #dee2e6;
  border: none;
  width: 30rem;
  margin-left: 3.5rem;
  height: 40px;
}

#text-input-search {
  font-size: 1rem;
  background: #dee2e6;
  border: none;
  width: 30rem;
  margin-left: 3.5rem;
  height: 40px;
}

.p-menubar .p-menubar-button {
  display: none;
}

.p-menubar {
  background: #ffffff;
}

.clickable {
  cursor: pointer;
}

.p-menubar-root-list,
.p-menubar-button {
  visibility: hidden;
}
</style>
