import { Namespace, ConceptSummary, FilterOptions } from "@im-library/interfaces";

export interface DirectoryState {
    findInTreeIri: string;
    searchResults: ConceptSummary[];
    searchLoading: boolean;
    sidebarControlActivePanel: number;
    fontAwesomePro: boolean;
    splitterRightSize: number;
    showReleaseNotes: boolean;
    showBanner: boolean;
}
