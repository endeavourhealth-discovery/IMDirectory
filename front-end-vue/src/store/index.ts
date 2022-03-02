import { SearchRequest } from "./../models/search/SearchRequest";
import { createStore } from "vuex";
import EntityService from "../services/EntityService";
import { User } from "../models/user/User";
import AuthService from "@/services/AuthService";
import { avatars } from "@/models/user/Avatars";
import LoggerService from "@/services/LoggerService";
import { CustomAlert } from "@/models/user/CustomAlert";
import { ConceptSummary } from "@/models/search/ConceptSummary";
import { IM } from "@/vocabulary/IM";
import { Namespace } from "@/models/Namespace";
import { EntityReferenceNode } from "@/models/EntityReferenceNode";
import ConfigService from "@/services/ConfigService";
import { FilterDefaultsConfig } from "@/models/configs/FilterDefaultsConfig";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { RecentActivityItem } from "@/models/RecentActivityItem";

export default createStore({
  // update stateType.ts when adding new state!
  state: {
    conceptIri: IM.MODULE_ONTOLOGY,
    favourites: JSON.parse(localStorage.getItem("favourites") || "[]") as string[],
    searchResults: [] as ConceptSummary[],
    searchLoading: false,
    currentUser: {} as User,
    registeredUsername: "" as string,
    isLoggedIn: false as boolean,
    recentLocalActivity: localStorage.getItem("recentLocalActivity") as string,
    snomedLicenseAccepted: localStorage.getItem("snomedLicenseAccepted") as string,
    blockedIris: [] as string[],
    filterOptions: {
      status: [] as EntityReferenceNode[],
      schemes: [] as Namespace[],
      types: [] as EntityReferenceNode[]
    },
    selectedFilters: {
      status: [] as EntityReferenceNode[],
      schemes: [] as Namespace[],
      types: [] as EntityReferenceNode[]
    },
    quickFiltersStatus: new Map<string, boolean>(),
    instanceIri: "",
    catalogueSearchResults: [] as string[],
    hierarchySelectedFilters: [] as Namespace[],
    filterDefaults: {} as FilterDefaultsConfig
  },
  mutations: {
    updateSearchLoading(state, loading) {
      state.searchLoading = loading;
    },
    updateBlockedIris(state, blockedIris) {
      state.blockedIris = blockedIris;
    },
    updateConceptIri(state, conceptIri) {
      state.conceptIri = conceptIri;
    },

    updateSearchResults(state, searchResults) {
      state.searchResults = searchResults;
    },
    updateFilterOptions(state, filters) {
      state.filterOptions = filters;
    },
    updateSelectedFilters(state, filters) {
      state.selectedFilters = filters;
    },
    updateQuickFiltersStatus(state, status) {
      state.quickFiltersStatus.set(status.key, status.value);
    },
    updateCurrentUser(state, user) {
      state.currentUser = user;
    },
    updateRegisteredUsername(state, username) {
      state.registeredUsername = username;
    },
    updateIsLoggedIn(state, status) {
      state.isLoggedIn = status;
    },
    updateSnomedLicenseAccepted(state, status: string) {
      state.snomedLicenseAccepted = status;
      localStorage.setItem("snomedLicenseAccepted", status);
    },
    updateRecentLocalActivity(state, recentActivityItem: RecentActivityItem) {
      let activity: RecentActivityItem[] = JSON.parse(localStorage.getItem("recentLocalActivity") || "[]");
      activity = activity.filter(stored => {
        return stored.iri !== recentActivityItem.iri;
      });
      activity.push(recentActivityItem);
      if (activity.length > 5) {
        activity.shift();
      }
      localStorage.setItem("recentLocalActivity", JSON.stringify(activity));
      state.recentLocalActivity = JSON.stringify(activity);
    },
    updateFavourites(state, favourite: string) {
      const favourites: string[] = JSON.parse(localStorage.getItem("favourites") || "[]");
      if (!favourites.includes(favourite)) {
        favourites.push(favourite);
      } else {
        favourites.splice(favourites.indexOf(favourite), 1);
      }
      localStorage.setItem("favourites", JSON.stringify(favourites));
      state.favourites = favourites;
    },
    updateInstanceIri(state, instanceIri) {
      state.instanceIri = instanceIri;
    },
    updateCatalogueSearchResults(state, results) {
      state.catalogueSearchResults = results;
    },
    updateHierarchySelectedFilters(state, filters) {
      state.hierarchySelectedFilters = filters;
    },
    updateFilterDefaults(state, defaults) {
      state.filterDefaults = defaults;
    }
  },
  actions: {
    async fetchBlockedIris({ commit }) {
      const blockedIris = await ConfigService.getXmlSchemaDataTypes();
      commit("updateBlockedIris", blockedIris);
    },
    async fetchSearchResults({ commit }, data: { searchRequest: SearchRequest; cancelToken: any }) {
      const result = await EntityService.advancedSearch(data.searchRequest, data.cancelToken);
      if (result && isArrayHasLength(result)) {
        commit("updateSearchResults", result);
      } else {
        commit("updateSearchResults", []);
      }
    },
    async logoutCurrentUser({ commit }) {
      let result = new CustomAlert(500, "Logout (store) failed");
      await AuthService.signOut().then(res => {
        if (res.status === 200) {
          commit("updateCurrentUser", null);
          commit("updateIsLoggedIn", false);
          result = res;
        } else {
          result = res;
        }
      });
      return result;
    },
    async authenticateCurrentUser({ commit, dispatch }) {
      const result = { authenticated: false };
      await AuthService.getCurrentAuthenticatedUser().then(res => {
        if (res.status === 200 && res.user) {
          commit("updateIsLoggedIn", true);
          const loggedInUser = res.user;
          const foundAvatar = avatars.find(avatar => avatar === loggedInUser.avatar);
          if (!foundAvatar) {
            loggedInUser.avatar = avatars[0];
          }
          commit("updateCurrentUser", loggedInUser);
          result.authenticated = true;
        } else {
          dispatch("logoutCurrentUser").then(resLogout => {
            if (resLogout.status === 200) {
              LoggerService.info(undefined, "Force logout successful");
            } else {
              LoggerService.error(undefined, "Force logout failed");
            }
          });
        }
      });
      return result;
    }
  },
  modules: {}
});
