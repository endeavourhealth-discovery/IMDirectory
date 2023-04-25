import { defineStore } from 'pinia'
import { RootState } from "@/stores/rootState";

import { IM } from "@im-library/vocabulary";
import { Namespace, HistoryItem, RecentActivityItem, ConceptSummary, FilterOptions, CustomAlert } from "@im-library/interfaces";
import { SearchRequest } from "@im-library/interfaces/AutoGen";
import { AuthService, EntityService } from "@/services";
import { Avatars } from "@im-library/constants";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { useUserStore } from "@/stores/userStore";
// import { getLogger } from "@im-library/logger/LogConfig";

// const log = getLogger("store");

export const useRootStore = defineStore('root', {
  state: (): RootState => ({
    conceptIri: IM.MODULE_ONTOLOGY,
    findInTreeIri: "",
    favourites: [] as string[],
    history: [] as HistoryItem[],
    searchResults: [] as ConceptSummary[],
    searchLoading: false,
    isLoggedIn: false as boolean,
    registeredUsername: "" as string,
    recentLocalActivity: JSON.parse(localStorage.getItem("recentLocalActivity") || "[]") as RecentActivityItem[],
    snomedLicenseAccepted: localStorage.getItem("snomedLicenseAccepted") === "true" ? true : false,
    snomedReturnUrl: "",
    authReturnUrl: "",
    filterOptions: {} as FilterOptions,
    selectedFilters: {} as FilterOptions,
    quickFiltersStatus: new Map<string, boolean>(),
    focusHierarchy: false,
    sidebarControlActivePanel: 0,
    hierarchySelectedFilters: [] as Namespace[],
    filterDefaults: {} as FilterOptions,
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
    showReleaseNotes: false as boolean,
    fontAwesomePro: false,
    eclEditorSavedString: localStorage.getItem("eclEditorSavedString") || ("" as string),
    currentTheme: localStorage.getItem("currentTheme") as string,
    cookiesEssentialAccepted: localStorage.getItem("cookiesEssentialAccepted") === "true" ? true : false,
    cookiesOptionalAccepted: localStorage.getItem("cookiesOptionalAccepted") === "true" ? true : false,
    showCookieConsent: false,
    showBanner: localStorage.getItem("showBanner") === "true" ? true : false,
    previousAppUrl: ""
  }),
  actions: {
    async initFavourites() {
      const favourites = JSON.parse(localStorage.getItem("favourites") || "[]") as string[];
      for (let index = 0; index < favourites.length; index++) {
        const iriExists = await EntityService.iriExists(favourites[index]);
        if (!iriExists) {
          favourites.splice(index, 1);
        }
      }
      localStorage.setItem("favourites", JSON.stringify(favourites));
      this.favourites = favourites;
    },

    async fetchFilterSettings() {
      const filterOptions = await EntityService.getFilterOptions();
      const filterDefaults = await EntityService.getFilterDefaultOptions();
      if (
        isObjectHasKeys(filterOptions, ["status", "schemes", "types", "sortFields", "sortDirections"]) &&
        isObjectHasKeys(filterDefaults, ["status", "schemes", "types", "sortFields", "sortDirections"])
      ) {
        this.updateFilterDefaults(filterDefaults);
        this.updateFilterOptions(filterOptions);
        const selectedStatus = this.filterOptions.status.filter(item =>
          filterDefaults.status.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
        );
        const selectedSchemes = this.filterOptions.schemes.filter(item =>
          filterDefaults.schemes.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
        );
        const selectedTypes = this.filterOptions.types.filter(item => filterDefaults.types.map(defaultOption => defaultOption["@id"]).includes(item["@id"]));
        const selectedField = this.filterOptions.sortFields.filter(item =>
          filterDefaults.sortFields.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
        );
        const selectedDirection = this.filterOptions.sortDirections.filter(item =>
          filterDefaults.sortDirections.map(defaultOption => defaultOption["@id"]).includes(item["@id"])
        );

        this.updateSelectedFilters( {
          status: selectedStatus,
          schemes: selectedSchemes,
          types: selectedTypes,
          sortFields: selectedField,
          sortDirections: selectedDirection
        } as FilterOptions);
        this.updateHierarchySelectedFilters(selectedSchemes);
      }
    },
    async fetchSearchResults(data: { searchRequest: SearchRequest; controller: AbortController }) {
      const result = await EntityService.advancedSearch(data.searchRequest, data.controller);
      if (result && isArrayHasLength(result)) {
        this.updateSearchResults(result);
      } else {
        this.updateSearchResults( []);
      }
    },
    async logoutCurrentUser() {
      let result = { status: 500, message: "Logout (store) failed" } as CustomAlert;
      await AuthService.signOut().then(res => {
        if (res.status === 200) {
          useUserStore().updateCurrentUser(null);
          this.updateIsLoggedIn(false);
          result = res;
        } else {
          result = res;
        }
      });
      return result;
    },
    async authenticateCurrentUser() {
      const result = { authenticated: false };
      await AuthService.getCurrentAuthenticatedUser().then(res => {
        if (res.status === 200 && res.user) {
          this.updateIsLoggedIn(true);
          const loggedInUser = res.user;
          const foundAvatar = Avatars.find((avatar: string) => avatar === loggedInUser.avatar);
          if (!foundAvatar) {
            loggedInUser.avatar = Avatars[0];
          }
          useUserStore().updateCurrentUser(loggedInUser);
          result.authenticated = true;
        } else {
          this.logoutCurrentUser().then(resLogout => {
            if (resLogout.status === 200) {
              // log.info("Force logout successful");
            } else {
              // log.error("Force logout failed");
            }
          });
        }
      });
      return result;
    },
    clearOptionalCookies() {
      localStorage.removeItem("currentTheme");
      localStorage.removeItem("favourites");
      localStorage.removeItem("recentLocalActivity");
      localStorage.removeItem("directoryMainSplitterVertical");
      localStorage.removeItem("directoryMainSplitterHorizontal");
      localStorage.removeItem("viewerMainSplitterVertical");
      localStorage.removeItem("viewerMainSplitterHorizontal");
      localStorage.removeItem("eclEditorSavedString");
      localStorage.removeItem("editorSavedEntity");
      localStorage.removeItem("creatorSavedEntity");
      localStorage.removeItem("editorSelectedIri");
    },
  // Mutations
    updateFindInTreeIri( value: any) {
      this.findInTreeIri = value;
    },
    updateActiveProfile( value: any) {
      this.activeProfile = value;
    },
    updateSearchLoading( loading: any) {
      this.searchLoading = loading;
    },
    updateConceptIri( conceptIri: any) {
      this.conceptIri = conceptIri;
    },
    updateSearchResults( searchResults: any) {
      this.searchResults = searchResults;
    },
    updateFilterOptions( filters: any) {
      this.filterOptions = filters;
    },
    updateSelectedFilters( filters: any) {
      this.selectedFilters = filters;
    },
    updateQuickFiltersStatus( status: any) {
      this.quickFiltersStatus.set(status.key, status.value);
    },
    updateIsLoggedIn( status: any) {
      this.isLoggedIn = status;
    },
    updateRegisteredUsername( username: any) {
      this.registeredUsername = username;
    },
    updateSnomedLicenseAccepted( bool: boolean) {
      this.snomedLicenseAccepted = bool;
      localStorage.setItem("snomedLicenseAccepted", bool === true ? "true" : "");
    },
    updateSnomedReturnUrl( url: any) {
      this.snomedReturnUrl = url;
    },
    updateAuthReturnUrl( url: any) {
      this.authReturnUrl = url;
    },
    updateRecentLocalActivity( recentActivityItem: RecentActivityItem) {
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

      if (this.cookiesOptionalAccepted) localStorage.setItem("recentLocalActivity", JSON.stringify(activity));
      this.recentLocalActivity = activity;
    },
    updateFavourites( favourite: string) {
      if (favourite !== "http://endhealth.info/im#Favourites") {
        const favourites: string[] = JSON.parse(localStorage.getItem("favourites") || "[]");
        if (!favourites.includes(favourite)) {
          favourites.push(favourite);
        } else {
          favourites.splice(favourites.indexOf(favourite), 1);
        }
        if (this.cookiesOptionalAccepted) localStorage.setItem("favourites", JSON.stringify(favourites));
        this.favourites = favourites;
      }
    },
    updateFocusHierarchy( bool: any) {
      this.focusHierarchy = bool;
    },
    updateSidebarControlActivePanel( number: any) {
      this.sidebarControlActivePanel = number;
    },
    updateHierarchySelectedFilters( filters: any) {
      this.hierarchySelectedFilters = filters;
    },
    updateFilterDefaults( defaults: any) {
      this.filterDefaults = defaults;
    },
    updateArrayObjectNameListboxWithLabelStartExpanded( items: any) {
      this.arrayObjectNameListboxWithLabelStartExpanded = items;
    },
    updateTagSeverityMatches( items: any) {
      this.tagSeverityMatches = items;
    },
    updateTextDefinitionStartExpanded( items: any) {
      this.textDefinitionStartExpanded = items;
    },
    updateSplitterRightSize( splitterRightSize: any) {
      this.splitterRightSize = splitterRightSize;
    },
    updateEditorIri( iri: any) {
      this.editorIri = iri;
      if (this.cookiesOptionalAccepted) localStorage.setItem("editorSelectedIri", iri);
    },
    updateEditorSavedEntity( entity: any) {
      this.editorSavedEntity = entity;
      if (entity && this.cookiesOptionalAccepted) localStorage.setItem("editorSavedEntity", JSON.stringify(entity));
      else localStorage.removeItem("editorSavedEntity");
    },
    updateCreatorSavedEntity( entity: any) {
      if (this.cookiesOptionalAccepted) {
        this.creatorSavedEntity = entity;
        if (entity && this.cookiesOptionalAccepted) localStorage.setItem("creatorSavedEntity", JSON.stringify(entity));
        else localStorage.removeItem("creatorSavedEntity");
      }
    },
    updateCreatorHasChanges( bool: any) {
      this.creatorHasChanges = bool;
    },
    updateEditorHasChanges( bool: any) {
      this.editorHasChanges = bool;
    },
    updateFindInEditorTreeIri( iri: any) {
      this.findInEditorTreeIri = iri;
    },
    updateRefreshTree() {
      this.refreshEditorTree = !this.refreshEditorTree;
    },
    updateShowReleaseNotes( bool: any) {
      this.showReleaseNotes = bool;
    },
    updateFontAwesomePro( bool: any) {
      this.fontAwesomePro = bool;
    },
    updateEclEditorSavedString( ecl: any) {
      this.eclEditorSavedString = ecl;
      if (ecl && this.cookiesOptionalAccepted) localStorage.setItem("eclEditorSavedString", ecl);
      else localStorage.removeItem("eclEditorSavedString");
    },
    updateCurrentTheme( theme: any) {
      this.currentTheme = theme;
      if (this.cookiesOptionalAccepted) localStorage.setItem("currentTheme", theme);
    },
    updateCookiesEssentialAccepted( bool: any) {
      this.cookiesEssentialAccepted = bool;
      localStorage.setItem("cookiesEssentialAccepted", bool);
    },
    updateCookiesOptionalAccepted( bool: any) {
      this.cookiesOptionalAccepted = bool;
      localStorage.setItem("cookiesOptionalAccepted", bool);
    },
    updateShowCookieConsent( bool: boolean) {
      this.showCookieConsent = bool;
    },
    updateShowBanner( bool: boolean) {
      this.showBanner = bool;
      localStorage.setItem("showBanner", bool === true ? "true" : "");
    }
  },
});
