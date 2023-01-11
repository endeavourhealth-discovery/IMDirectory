import { createStore } from "vuex";
import { AuthService } from "@/services";
import { EntityReferenceNode, Namespace, HistoryItem, RecentActivityItem, ConceptSummary, SearchRequest } from "@im-library/interfaces";
import { FilterDefaults } from "@im-library/config";
import { Avatars } from "@im-library/constants";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { IM } from "@im-library/vocabulary";
import { CustomAlert, User } from "@im-library/models";
import { EntityService } from "@/services";
import { getLogger } from "@im-library/logger/LogConfig";

const log = getLogger("store");

export default createStore({
  // update stateType.ts when adding new state!
  state: {
    conceptIri: IM.MODULE_ONTOLOGY,
    findInTreeIri: "",
    favourites: [] as string[],
    history: [] as HistoryItem[],
    searchResults: [] as ConceptSummary[],
    searchLoading: false,
    currentUser: {} as User,
    isLoggedIn: false as boolean,
    registeredUsername: "" as string,
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
    filterDefaults: FilterDefaults,
    arrayObjectNameListboxWithLabelStartExpanded: [],
    tagSeverityMatches: [
      { "@id": IM.ACTIVE, severity: "success" },
      { "@id": IM.DRAFT, severity: "warning" },
      { "@id": IM.INACTIVE, severity: "danger" }
    ],
    textDefinitionStartExpanded: ["Definition"],
    activeProfile: { uuid: "", activeClausePath: "" },
    splitterRightSize: 0,
    editorIri: localStorage.getItem("editorSelectedIri") as string,
    editorSavedEntity: JSON.parse(localStorage.getItem("editorSavedEntity") || "{}") as any,
    creatorSavedEntity: JSON.parse(localStorage.getItem("creatorSavedEntity") || "{}") as any,
    creatorHasChanges: false as boolean,
    editorHasChanges: false as boolean,
    findInEditorTreeIri: "",
    refreshEditorTree: false as boolean,
    showReleaseNotes: false as boolean
  },
  mutations: {
    updateFindInTreeIri(state, value) {
      state.findInTreeIri = value;
    },
    updateActiveProfile(state, value) {
      state.activeProfile = value;
    },
    updateSearchLoading(state, loading) {
      state.searchLoading = loading;
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
    updateRegisteredUsername(state, username) {
      state.registeredUsername = username;
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
      const foundIndex = activity.findIndex(activityItem => activityItem.iri === recentActivityItem.iri && activityItem.action === recentActivityItem.action);
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
        if (recentActivityItem.iri !== "http://endhealth.info/im#Favourites") {
          activity.push(recentActivityItem);
        }
      }

      localStorage.setItem("recentLocalActivity", JSON.stringify(activity));
      state.recentLocalActivity = activity;
    },
    updateFavourites(state, favourite: string) {
      if (favourite !== "http://endhealth.info/im#Favourites") {
        const favourites: string[] = JSON.parse(localStorage.getItem("favourites") || "[]");
        if (!favourites.includes(favourite)) {
          favourites.push(favourite);
        } else {
          favourites.splice(favourites.indexOf(favourite), 1);
        }
        localStorage.setItem("favourites", JSON.stringify(favourites));
        state.favourites = favourites;
      }
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
    updateArrayObjectNameListboxWithLabelStartExpanded(state, items) {
      state.arrayObjectNameListboxWithLabelStartExpanded = items;
    },
    updateTagSeverityMatches(state, items) {
      state.tagSeverityMatches = items;
    },
    updateTextDefinitionStartExpanded(state, items) {
      state.textDefinitionStartExpanded = items;
    },
    updateSplitterRightSize(state, splitterRightSize) {
      state.splitterRightSize = splitterRightSize;
    },
    updateEditorIri(state, iri) {
      state.editorIri = iri;
      localStorage.setItem("editorSelectedIri", iri);
    },
    updateEditorSavedEntity(state, entity) {
      state.editorSavedEntity = entity;
      if (entity) localStorage.setItem("editorSavedEntity", JSON.stringify(entity));
      else localStorage.removeItem("editorSavedEntity");
    },
    updateCreatorSavedEntity(state, entity) {
      state.creatorSavedEntity = entity;
      if (entity) localStorage.setItem("creatorSavedEntity", JSON.stringify(entity));
      else localStorage.removeItem("creatorSavedEntity");
    },
    updateCreatorHasChanges(state, bool) {
      state.creatorHasChanges = bool;
    },
    updateEditorHasChanges(state, bool) {
      state.editorHasChanges = bool;
    },
    updateFindInEditorTreeIri(state, iri) {
      state.findInEditorTreeIri = iri;
    },
    updateRefreshTree(state) {
      state.refreshEditorTree = !state.refreshEditorTree;
    },
    updateShowReleaseNotes(state, bool) {
      state.showReleaseNotes = bool;
    }
  },
  actions: {
    async initFavourites({ commit, state }) {
      const favourites = JSON.parse(localStorage.getItem("favourites") || "[]") as string[];
      for (let index = 0; index < favourites.length; index++) {
        const iriExists = await EntityService.iriExists(favourites[index]);
        if (!iriExists) {
          favourites.splice(index, 1);
        }
      }
      localStorage.setItem("favourites", JSON.stringify(favourites));
      state.favourites = favourites;
    },
    async fetchFilterSettings({ commit, state }) {
      const filterDefaults = await EntityService.getFilterOptions();
      if (filterDefaults && isObjectHasKeys(filterDefaults, ["status", "schemes", "types", "sortFields", "sortDirections"])) {
        commit("updateFilterOptions", {
          status: filterDefaults.status,
          schemes: filterDefaults.schemes,
          types: filterDefaults.types,
          sortFields: filterDefaults.sortFields,
          sortDirections: filterDefaults.sortDirections
        });

        const selectedStatus = state.filterOptions.status.filter((item: EntityReferenceNode) => FilterDefaults.statusOptions.includes(item["@id"]));
        const selectedSchemes = state.filterOptions.schemes.filter((item: Namespace) => FilterDefaults.schemeOptions.includes(item.iri));
        const selectedTypes = state.filterOptions.types.filter((item: EntityReferenceNode) => FilterDefaults.typeOptions.includes(item["@id"]));
        const selectedField = FilterDefaults.sortField;
        const selectedDirection = FilterDefaults.sortDirection;
        commit("updateSelectedFilters", {
          status: selectedStatus,
          schemes: selectedSchemes,
          types: selectedTypes,
          sortField: selectedField,
          sortDirection: selectedDirection
        });
        commit("updateHierarchySelectedFilters", selectedSchemes);
      }
    },
    async fetchSearchResults({ commit }, data: { searchRequest: SearchRequest; controller: AbortController }) {
      const result = await EntityService.advancedSearch(data.searchRequest, data.controller);
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
              log.info("Force logout successful");
            } else {
              log.error("Force logout failed");
            }
          });
        }
      });
      return result;
    }
  },
  modules: {}
});
