import { createStore } from "vuex";
import EntityService from "../services/EntityService";
import AuthService from "@/services/AuthService";
import LoggerService from "@/services/LoggerService";
import ConfigService from "@/services/ConfigService";
import { FilterDefaultsConfig, EntityReferenceNode, Namespace, HistoryItem, RecentActivityItem } from "im-library/dist/types/interfaces/Interfaces";
import { Models, Constants, Vocabulary, Helpers } from "im-library";
const { IM, RDF, RDFS } = Vocabulary;
const { Avatars } = Constants;
const {
  User,
  Search: { SearchRequest, ConceptSummary },
  CustomAlert
} = Models;
const {
  DataTypeCheckers: { isArrayHasLength, isObjectHasKeys }
} = Helpers;

export default createStore({
  // update stateType.ts when adding new state!
  state: {
    conceptIri: IM.MODULE_ONTOLOGY,
    favourites: JSON.parse(localStorage.getItem("favourites") || "[]") as string[],
    history: [] as HistoryItem[],
    searchResults: [] as Models.Search.ConceptSummary[],
    searchLoading: false,
    currentUser: {} as Models.User,
    isLoggedIn: false as boolean,
    recentLocalActivity: localStorage.getItem("recentLocalActivity") as string,
    snomedLicenseAccepted: localStorage.getItem("snomedLicenseAccepted") as string,
    blockedIris: [] as string[],
    highLevelTypes: [] as string[],
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
    focusHierarchy: false,
    sidebarControlActivePanel: 0,
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
    updateIsLoggedIn(state, status) {
      state.isLoggedIn = status;
    },
    updateSnomedLicenseAccepted(state, status: string) {
      state.snomedLicenseAccepted = status;
      localStorage.setItem("snomedLicenseAccepted", status);
    },
    updateRecentLocalActivity(state, recentActivityItem: RecentActivityItem) {
      let activity: RecentActivityItem[] = JSON.parse(localStorage.getItem("recentLocalActivity") || "[]");
      activity.forEach(activityItem => {
        activityItem.dateTime = new Date(activityItem.dateTime);
      });
      const foundIndex = activity.findIndex(activityItem => activityItem.iri === recentActivityItem.iri && activityItem.app === recentActivityItem.app);
      if (foundIndex !== -1) {
        activity[foundIndex].dateTime = recentActivityItem.dateTime;
        activity.sort((a, b) => (a.dateTime.getTime() > b.dateTime.getTime() ? 1 : b.dateTime.getTime() > a.dateTime.getTime() ? -1 : 0));
      } else {
        if (activity.length > 4) activity.shift();
        activity.push(recentActivityItem);
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
    updateFocusHierarchy(state, bool) {
      state.focusHierarchy = bool;
    },
    updateSidebarControlActivePanel(state, number) {
      state.sidebarControlActivePanel = number;
    },
    updateHierarchySelectedFilters(state, filters) {
      state.hierarchySelectedFilters = filters;
    },
    updateFilterDefaults(state, defaults) {
      state.filterDefaults = defaults;
    },
    updateHighLevelTypes(state, highLevelTypes) {
      state.highLevelTypes = highLevelTypes;
    }
  },
  actions: {
    async fetchHighLevelTypes({ commit }) {
      const configs = await ConfigService.getFilterDefaults();
      commit("updateHighLevelTypes", configs.typeOptions);
    },
    async fetchBlockedIris({ commit }) {
      const blockedIris = await ConfigService.getXmlSchemaDataTypes();
      commit("updateBlockedIris", blockedIris);
    },
    async fetchSearchResults({ commit }, data: { searchRequest: Models.Search.SearchRequest; cancelToken: any }) {
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
          const foundAvatar = Avatars.find((avatar: string) => avatar === loggedInUser.avatar);
          if (!foundAvatar) {
            loggedInUser.avatar = Avatars[0];
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
