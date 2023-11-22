import { defineStore } from "pinia";
import { DirectoryState } from "@/stores/types/directoryState";

import { IM } from "@im-library/vocabulary";
import { SearchRequest, SearchResponse, SearchResultSummary } from "@im-library/interfaces/AutoGen";
import { EntityService } from "@/services";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";

export const useDirectoryStore = defineStore("directory", {
  state: (): DirectoryState => ({
    conceptIri: IM.MODULE_ONTOLOGY,
    findInTreeIri: "",
    searchResults: {} as SearchResponse,
    searchLoading: false,
    sidebarControlActivePanel: 0,
    splitterRightSize: 0,
    focusHierarchy: false,
    textDefinitionStartExpanded: ["Definition"],
    arrayObjectNameListboxWithLabelStartExpanded: []
  }),
  actions: {
    updateConceptIri(conceptIri: string) {
      this.conceptIri = conceptIri;
    },
    async fetchSearchResults(data: { searchRequest: SearchRequest; controller: AbortController }) {
      const result = await EntityService.advancedSearch(data.searchRequest, data.controller);
      if (result) {
        this.updateSearchResults(result);
      } else {
        this.updateSearchResults({} as SearchResponse);
      }
    },
    // Mutations
    updateFindInTreeIri(value: string) {
      this.findInTreeIri = value;
    },
    updateSearchLoading(loading: boolean) {
      this.searchLoading = loading;
    },
    updateSearchResults(searchResults: SearchResponse) {
      this.searchResults = searchResults;
    },
    updateSidebarControlActivePanel(number: number) {
      this.sidebarControlActivePanel = number;
    },
    updateSplitterRightSize(splitterRightSize: number) {
      this.splitterRightSize = splitterRightSize;
    },
    updateTextDefinitionStartExpanded(items: any) {
      this.textDefinitionStartExpanded = items;
    },
    updateArrayObjectNameListboxWithLabelStartExpanded(items: any) {
      this.arrayObjectNameListboxWithLabelStartExpanded = items;
    },
    updateFocusHierarchy(bool: boolean) {
      this.focusHierarchy = bool;
    }
  }
});
