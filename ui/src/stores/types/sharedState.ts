import { Namespace, ConceptSummary, RecentActivityItem, HistoryItem, FilterOptions } from "@im-library/interfaces";

export interface SharedState {
  // loading: Map<string, boolean>;
  conceptIri: string;
  showCookieConsent: boolean;
  fontAwesomePro: boolean;
  showSnomedLicense: boolean;
  focusHierarchy: boolean;
  // filters:
  //   selectedStatus: string[];
  //   selectedSchemes: { iri: string; name: string }[];
  //   selectedTypes: string[];
  // };
  // term: string;
  // instanceIri: string;
  arrayObjectNameListboxWithLabelStartExpanded: string[];
  tagSeverityMatches: any[];
  textDefinitionStartExpanded: string[];
  activeProfile: any;
}
