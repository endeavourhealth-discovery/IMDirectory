import { SearchResponse } from "@im-library/interfaces/AutoGen";

export interface DirectoryState {
  conceptIri: string;
  findInTreeIri: string;
  searchResults: SearchResponse;
  searchLoading: boolean;
  sidebarControlActivePanel: number;
  splitterRightSize: number;
  focusHierarchy: boolean;
  textDefinitionStartExpanded: string[];
  arrayObjectNameListboxWithLabelStartExpanded: string[];
}
