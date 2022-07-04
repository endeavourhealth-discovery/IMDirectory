import { createStore } from "vuex";
import AuthService from "@/services/AuthService";
import { EntityReferenceNode, Namespace, HistoryItem, RecentActivityItem } from "im-library/dist/types/interfaces/Interfaces";
import { Models, Constants, Vocabulary, Helpers, Config } from "im-library";
const { IM } = Vocabulary;
const { Avatars } = Constants;
const { CustomAlert } = Models;
const {
  DataTypeCheckers: { isArrayHasLength }
} = Helpers;
import vm from "@/main";

export default createStore({
  // update stateType.ts when adding new state!
  state: {
    selectedConceptIri: "",
    locateOnNavTreeIri: {},
    conceptIri: IM.MODULE_ONTOLOGY,
    favourites: [] as string[],
    history: [] as HistoryItem[],
    searchResults: [] as Models.Search.ConceptSummary[],
    searchLoading: false,
    currentUser: {} as Models.User,
    isLoggedIn: false as boolean,
    recentLocalActivity: JSON.parse(localStorage.getItem("recentLocalActivity") || "[]") as RecentActivityItem[],
    snomedLicenseAccepted: localStorage.getItem("snomedLicenseAccepted") as string,
    snomedReturnUrl: "",
    authReturnUrl: "",
    filterOptions: {
      status: [] as EntityReferenceNode[],
      schemes: [] as Namespace[],
      types: [] as EntityReferenceNode[],
      sortFields: [] as { label: string; value: any }[],
      sortDirections: [] as { label: string; value: any }[]
    },
    selectedFilters: {
      status: [] as EntityReferenceNode[],
      schemes: [] as Namespace[],
      types: [] as EntityReferenceNode[],
      sortField: "",
      sortDirection: ""
    },
    quickFiltersStatus: new Map<string, boolean>(),
    focusHierarchy: false,
    sidebarControlActivePanel: 0,
    hierarchySelectedFilters: [] as Namespace[],
    filterDefaults: Config.Values.FILTER_DEFAULTS,
    arrayObjectNameListboxWithLabelStartExpanded: [],
    tagSeverityMatches: [
      { "@id": IM.ACTIVE, severity: "success" },
      { "@id": IM.DRAFT, severity: "warning" },
      { "@id": IM.INACTIVE, severity: "danger" }
    ],
    textDefinitionStartExpanded: ["Definition"],
    activeProfile: { uuid: "", activeClausePath: "" }
  },
  mutations: {
    updateActiveProfile(state, value) {
      state.activeProfile = value;
    },
    updateSearchLoading(state, loading) {
      state.searchLoading = loading;
    },
    updateSelectedConceptIri(state, selectedConceptIri) {
      state.selectedConceptIri = selectedConceptIri;
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
    updateSnomedReturnUrl(state, url) {
      state.snomedReturnUrl = url;
    },
    updateAuthReturnUrl(state, url) {
      state.authReturnUrl = url;
    },
    updateRecentLocalActivity(state, recentActivityItem: RecentActivityItem) {
      let activity: RecentActivityItem[] = JSON.parse(localStorage.getItem("recentLocalActivity") || "[]");
      activity.forEach(activityItem => {
        activityItem.dateTime = new Date(activityItem.dateTime);
      });
      const foundIndex = activity.findIndex(activityItem => activityItem.iri === recentActivityItem.iri && activityItem.app === recentActivityItem.app);
      if (foundIndex !== -1) {
        activity[foundIndex].dateTime = recentActivityItem.dateTime;
        activity.sort((a, b) => {
          if (a.dateTime.getTime() > b.dateTime.getTime()) {
            return 1;
          } else if (b.dateTime.getTime() > a.dateTime.getTime()) {
            return -1;
          } else {
            return 0;
          }
        });
      } else {
        while (activity.length > 4) activity.shift();
        activity.push(recentActivityItem);
      }

      localStorage.setItem("recentLocalActivity", JSON.stringify(activity));
      state.recentLocalActivity = activity;
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
    updateLocateOnNavTreeIri(state, iri) {
      state.locateOnNavTreeIri = { iri };
    },
    updateArrayObjectNameListboxWithLabelStartExpanded(state, items) {
      state.arrayObjectNameListboxWithLabelStartExpanded = items;
    },
    updateTagSeverityMatches(state, items) {
      state.tagSeverityMatches = items;
    },
    updateTextDefinitionStartExpanded(state, items) {
      state.textDefinitionStartExpanded = items;
    }
  },
  actions: {
    async initFavourites({ commit, state }) {
      const favourites = JSON.parse(localStorage.getItem("favourites") || "[]") as string[];
      for (let index = 0; index < favourites.length; index++) {
        const iriExists = await vm.$entityService.iriExists(favourites[index]);
        if (!iriExists) {
          favourites.splice(index, 1);
        }
      }
      localStorage.setItem("favourites", JSON.stringify(favourites));
      state.favourites = favourites;
    },
    async fetchFilterSettings({ commit, state }) {
      const filterDefaults = await vm.$entityService.getFilterOptions();
      console.log(JSON.stringify(filterDefaults));
      commit("updateFilterOptions", {
        status: filterDefaults.status,
        schemes: filterDefaults.schemes,
        types: filterDefaults.types,
        sortFields: filterDefaults.sortFields,
        sortDirections: filterDefaults.sortDirections
      });

      const selectedStatus = state.filterOptions.status.filter((item: EntityReferenceNode) =>
        Config.Values.FILTER_DEFAULTS.statusOptions.includes(item["@id"])
      );
      const selectedSchemes = state.filterOptions.schemes.filter((item: Namespace) => Config.Values.FILTER_DEFAULTS.schemeOptions.includes(item.iri));
      const selectedTypes = state.filterOptions.types.filter((item: EntityReferenceNode) => Config.Values.FILTER_DEFAULTS.typeOptions.includes(item["@id"]));
      commit("updateSelectedFilters", {
        status: selectedStatus,
        schemes: selectedSchemes,
        types: selectedTypes
      });
      commit("updateHierarchySelectedFilters", selectedSchemes);
    },
    async fetchSearchResults({ commit }, data: { searchRequest: Models.Search.SearchRequest; controller: AbortController }) {
      const result = await vm.$entityService.advancedSearch(data.searchRequest, data.controller);
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
              vm.$loggerService.info(undefined, "Force logout successful");
            } else {
              vm.$loggerService.error(undefined, "Force logout failed");
            }
          });
        }
      });
      return result;
    }
  },
  modules: {}
});
