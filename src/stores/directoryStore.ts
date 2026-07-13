import { ref } from "vue";

import { IM, RDFS } from "@endeavour/vue-library/enums";
import { isObjectHasKeys } from "@endeavour/vue-library/helpers";
import type { SearchResponse } from "@endeavour/vue-library/models";

import { defineStore } from "pinia";

import { EntityService } from "@/services";

export const useDirectoryStore = defineStore("directory", () => {
  const conceptIri = ref<string>(IM.MODULE_ONTOLOGY);
  const findInTreeIri = ref<string>("");
  const searchResults = ref<SearchResponse | undefined>();
  const findInTreeBoolean = ref<boolean>(false);
  const searchLoading = ref<boolean>(false);
  const sidebarControlActivePanel = ref<number>(0);
  const splitterRightSize = ref<number>(0);
  const focusHierarchy = ref<boolean>(false);
  const textDefinitionStartExpanded = ref<string[]>(["Definition"]);
  const arrayObjectNameListboxWithLabelStartExpanded = ref<string[]>([]);

  function updateConceptIri(iri: string) {
    conceptIri.value = iri;
  }

  async function getConceptName(): Promise<string> {
    if (conceptIri.value) {
      const result = await EntityService.getPartialEntity(conceptIri.value, [RDFS.LABEL]);
      if (isObjectHasKeys(result, [RDFS.LABEL]) && typeof result[RDFS.LABEL] === "string") return result[RDFS.LABEL];
    }
    return "";
  }

  function updateFindInTreeIri(iri: string) {
    updateFindInTreeBoolean(true);
    findInTreeIri.value = iri;
  }

  function updateFindInTreeBoolean(bool: boolean) {
    findInTreeBoolean.value = bool;
  }

  function updateSearchLoading(loading: boolean) {
    searchLoading.value = loading;
  }

  function updateSearchResults(newSearchResults: SearchResponse | undefined) {
    searchResults.value = newSearchResults;
  }

  function updateSidebarControlActivePanel(number: number) {
    sidebarControlActivePanel.value = number;
  }

  function updateSplitterRightSize(newSplitterRightSize: number) {
    splitterRightSize.value = newSplitterRightSize;
  }

  function updateTextDefinitionStartExpanded(items: string[]) {
    textDefinitionStartExpanded.value = items;
  }

  function updateArrayObjectNameListboxWithLabelStartExpanded(items: string[]) {
    arrayObjectNameListboxWithLabelStartExpanded.value = items;
  }

  function updateFocusHierarchy(bool: boolean) {
    focusHierarchy.value = bool;
  }

  return {
    arrayObjectNameListboxWithLabelStartExpanded,
    conceptIri,
    findInTreeBoolean,
    findInTreeIri,
    focusHierarchy,
    searchLoading,
    searchResults,
    sidebarControlActivePanel,
    splitterRightSize,
    textDefinitionStartExpanded,
    updateArrayObjectNameListboxWithLabelStartExpanded,
    updateConceptIri,
    updateFindInTreeBoolean,
    updateFindInTreeIri,
    updateFocusHierarchy,
    updateSearchLoading,
    updateSearchResults,
    updateSidebarControlActivePanel,
    updateSplitterRightSize,
    updateTextDefinitionStartExpanded,
    getConceptName
  };
});
