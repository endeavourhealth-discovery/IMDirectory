import { ConceptSummary } from "@im-library/interfaces";

export interface DirectoryState {
  conceptIri: string;
  findInTreeIri: string;
  findInTreeBoolean: boolean;
  searchResults: ConceptSummary[];
  searchLoading: boolean;
  sidebarControlActivePanel: number;
  splitterRightSize: number;
  focusHierarchy: boolean;
  textDefinitionStartExpanded: string[];
  arrayObjectNameListboxWithLabelStartExpanded: string[];
}
