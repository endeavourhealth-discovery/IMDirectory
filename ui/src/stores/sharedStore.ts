import { defineStore } from "pinia";
import { SharedState } from "@/stores/types/sharedState";

import { IM } from "@im-library/vocabulary";
import { Namespace, HistoryItem, RecentActivityItem, ConceptSummary, FilterOptions } from "@im-library/interfaces";
import { SearchRequest } from "@im-library/interfaces/AutoGen";
import { EntityService } from "@/services";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
// import { getLogger } from "@im-library/logger/LogConfig";

// const log = getLogger("sharedStore");

export const useSharedStore = defineStore("shared", {
  state: (): SharedState => ({
    conceptIri: IM.MODULE_ONTOLOGY,
    showCookieConsent: false,
    fontAwesomePro: false,
    showSnomedLicense: false,
    focusHierarchy: false,
    arrayObjectNameListboxWithLabelStartExpanded: [],
    tagSeverityMatches: [
      { "@id": IM.ACTIVE, severity: "success" },
      { "@id": IM.DRAFT, severity: "warning" },
      { "@id": IM.INACTIVE, severity: "danger" }
    ],
    textDefinitionStartExpanded: ["Definition"],
    activeProfile: { uuid: "", activeClausePath: "" }
  }),
  actions: {
    updateShowCookieConsent(bool: boolean) {
      this.showCookieConsent = bool;
    },
    updateFontAwesomePro(bool: boolean) {
      this.fontAwesomePro = bool;
    },
    updateActiveProfile(value: any) {
      this.activeProfile = value;
    },
    updateConceptIri(conceptIri: string) {
      this.conceptIri = conceptIri;
    },
    updateShowSnomedLicense(bool: boolean) {
      this.showSnomedLicense = bool;
    },
    updateFocusHierarchy(bool: boolean) {
      this.focusHierarchy = bool;
    },
    updateArrayObjectNameListboxWithLabelStartExpanded(items: any) {
      this.arrayObjectNameListboxWithLabelStartExpanded = items;
    },
    updateTagSeverityMatches(items: any) {
      this.tagSeverityMatches = items;
    },
    updateTextDefinitionStartExpanded(items: any) {
      this.textDefinitionStartExpanded = items;
    }
  }
});
