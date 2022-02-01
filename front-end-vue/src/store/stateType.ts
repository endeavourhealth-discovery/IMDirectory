import { HistoryItem } from "../models/HistoryItem";
import { User } from "../models/user/User";
import { Namespace } from "@/models/Namespace";

export interface State {
  loading: Map<string, boolean>;
  conceptIri: string;
  history: HistoryItem[];
  searchResults: [];
  currentUser: User;
  registeredUsername: string;
  isLoggedIn: boolean;
  snomedLicenseAccepted: string;
  historyCount: number;
  focusTree: boolean;
  treeLocked: boolean;
  sideNavHierarchyFocus: { name: string; iri: string };
  selectedEntityType: string;
  filters: {
    selectedStatus: string[];
    selectedSchemes: { iri: string; name: string }[];
    selectedTypes: string[];
  };
  term: string;
  instanceIri: string;
  sidebarControlActivePanel: number;
  hierarchySelectedFilters: Namespace[];
}
