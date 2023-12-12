import { defineStore } from "pinia";
import { DirectoryState } from "@/stores/types/directoryState";

import { IM } from "@im-library/vocabulary";
import { ConceptSummary } from "@im-library/interfaces";
import { SearchRequest } from "@im-library/interfaces/AutoGen";
import { EntityService } from "@/services";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";

export const useDirectoryStore = defineStore("directory", {
  state: (): DirectoryState => ({
    conceptIri: IM.MODULE_ONTOLOGY,
    findInTreeIri: "",
    findInTreeBoolean: false,
    searchResults: [] as ConceptSummary[],
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
      if (result && isArrayHasLength(result)) {
        this.updateSearchResults(result);
      } else {
        this.updateSearchResults([]);
      }
    },
    // Mutations
    updateFindInTreeIri(value: string) {
      console.log(this.findInTreeBoolean);
      this.updateFindInTreeBoolean(true);
      this.findInTreeIri = value;
    },
    updateFindInTreeBoolean(value: boolean) {
      console.log(this.findInTreeBoolean);
      this.findInTreeBoolean = value;
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
