import { defineStore } from "pinia";
import { DirectoryState } from "@/stores/types/directoryState";

import { IM } from "@im-library/vocabulary";
import { ConceptSummary } from "@im-library/interfaces";
import { SearchRequest } from "@im-library/interfaces/AutoGen";
import { EntityService } from "@/services";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
// import { getLogger } from "@im-library/logger/LogConfig";

// const log = getLogger("sharedStore");

export const useDirectoryStore = defineStore("directory", {
  state: (): DirectoryState => ({
    findInTreeIri: "",
    searchResults: [] as ConceptSummary[],
    searchLoading: false,
    sidebarControlActivePanel: 0,
    splitterRightSize: 0,
    showReleaseNotes: false,
    showBanner: localStorage.getItem("showBanner") === "true" ? true : false
  }),
  actions: {
    async fetchSearchResults(data: { searchRequest: SearchRequest; controller: AbortController }) {
      const result = await EntityService.advancedSearch(data.searchRequest, data.controller);
      if (result && isArrayHasLength(result)) {
        this.updateSearchResults(result);
      } else {
        this.updateSearchResults([]);
      }
    },
    // Mutations
    updateFindInTreeIri(value: string) {
      this.findInTreeIri = value;
    },
    updateSearchLoading(loading: boolean) {
      this.searchLoading = loading;
    },
    updateSearchResults(searchResults: any) {
      this.searchResults = searchResults;
    },
    updateSidebarControlActivePanel(number: number) {
      this.sidebarControlActivePanel = number;
    },
    updateSplitterRightSize(splitterRightSize: number) {
      this.splitterRightSize = splitterRightSize;
    },
    updateShowReleaseNotes(bool: boolean) {
      this.showReleaseNotes = bool;
    },
    updateShowBanner(bool: boolean) {
      this.showBanner = bool;
      localStorage.setItem("showBanner", bool === true ? "true" : "");
    }
  }
});
