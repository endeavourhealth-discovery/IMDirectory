import { SearchResponse } from "@/interfaces/AutoGen";

export interface DirectoryState {
  conceptIri: string;
  findInTreeIri: string;
  searchResults: SearchResponse | undefined;
  findInTreeBoolean: boolean;
  searchLoading: boolean;
  sidebarControlActivePanel: number;
  splitterRightSize: number;
  focusHierarchy: boolean;
  textDefinitionStartExpanded: string[];
  arrayObjectNameListboxWithLabelStartExpanded: string[];
}
