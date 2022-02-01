import { SearchRequest } from "./../models/search/SearchRequest";
import { createStore } from "vuex";
import EntityService from "../services/EntityService";
import { HistoryItem } from "../models/HistoryItem";
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
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";

export default createStore({
  // update stateType.ts when adding new state!
  state: {
    conceptIri: IM.MODULE_ONTOLOGY,
    history: [] as HistoryItem[],
    searchResults: [] as ConceptSummary[],
    currentUser: {} as User,
    registeredUsername: "" as string,
    isLoggedIn: false as boolean,
    snomedLicenseAccepted: localStorage.getItem("snomedLicenseAccepted") as string,
    historyCount: 0 as number,
    focusTree: false as boolean,
    treeLocked: true as boolean,
    resetTree: false as boolean,
    blockedIris: [] as string[],
    sideNavHierarchyFocus: {
      name: "Ontology",
      fullName: "Ontologies",
      iri: IM.MODULE_ONTOLOGY,
      route: "Dashboard"
    } as { name: string; iri: string; fullName: string; route: string },
    selectedEntityType: "",
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
    moduleSelectedEntities: new Map([
      ["Ontology", IM.MODULE_ONTOLOGY],
      ["Sets", IM.MODULE_SETS],
      ["DataModel", IM.MODULE_DATA_MODEL],
      ["Catalogue", IM.MODULE_CATALOGUE],
      ["Queries", IM.MODULE_QUERIES]
    ]),
    activeModule: "default",
    conceptActivePanel: 0,
    focusHierarchy: false,
    instanceIri: "",
    sidebarControlActivePanel: 0,
    catalogueSearchResults: [] as string[],
    hierarchySelectedFilters: [] as Namespace[],
    filterDefaults: {} as FilterDefaultsConfig
  },
  mutations: {
    updateBlockedIris(state, blockedIris) {
      state.blockedIris = blockedIris;
    },
    updateConceptIri(state, conceptIri) {
      state.conceptIri = conceptIri;
    },
    updateHistory(state, historyItem) {
      state.history = state.history.filter(function(el) {
        return el.conceptName !== historyItem.conceptName;
      });
      state.history.splice(0, 0, historyItem);
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
    updateHistoryCount(state, count) {
      state.historyCount = count;
    },
    updateFocusTree(state, bool) {
      state.focusTree = bool;
    },
    updateTreeLocked(state, bool) {
      state.treeLocked = bool;
    },
    updateResetTree(state, bool) {
      state.resetTree = bool;
    },
    updateSideNavHierarchyFocus(state, focus) {
      state.sideNavHierarchyFocus = focus;
    },
    updateSelectedEntityType(state, type) {
      state.selectedEntityType = type;
    },
    updateModuleSelectedEntities(state, data) {
      state.moduleSelectedEntities.set(data.module, data.iri);
    },
    updateConceptActivePanel(state, number) {
      state.conceptActivePanel = number;
    },
    updateActiveModule(state, module) {
      state.activeModule = module;
    },
    updateFocusHierarchy(state, bool) {
      state.focusHierarchy = bool;
    },
    updateInstanceIri(state, instanceIri) {
      state.instanceIri = instanceIri;
    },
    updateCatalogueSearchResults(state, results) {
      state.catalogueSearchResults = results;
    },
    updateSidebarControlActivePanel(state, number) {
      state.sidebarControlActivePanel = number;
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
