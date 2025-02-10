import { defineStore } from "pinia";
import { DirectoryState } from "@/stores/types/directoryState";

import { IM, RDFS } from "@/vocabulary";
import { SearchResponse } from "@/interfaces/AutoGen";
import { EntityService } from "@/services";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";

export const useDirectoryStore = defineStore("directory", {
  state: (): DirectoryState => ({
    conceptIri: IM.MODULE_ONTOLOGY,
    findInTreeIri: "",
    searchResults: undefined,
    findInTreeBoolean: false,
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
    async getConceptName(): Promise<string> {
      if (this.conceptIri) {
        const result = await EntityService.getPartialEntity(this.conceptIri, [RDFS.LABEL]);
        if (isObjectHasKeys(result, [RDFS.LABEL])) return result[RDFS.LABEL];
      }
      return "";
    },
    // Mutations
    updateFindInTreeIri(value: string) {
      this.updateFindInTreeBoolean(true);
      this.findInTreeIri = value;
    },
    updateFindInTreeBoolean(value: boolean) {
      this.findInTreeBoolean = value;
    },
    updateSearchLoading(loading: boolean) {
      this.searchLoading = loading;
    },
    updateSearchResults(searchResults: SearchResponse | undefined) {
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
