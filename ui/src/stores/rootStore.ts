import { defineStore } from "pinia";
import { RootState } from "@/stores/types/rootState";

import { IM } from "@im-library/vocabulary";
import { Namespace, HistoryItem, RecentActivityItem, ConceptSummary, FilterOptions } from "@im-library/interfaces";
import { SearchRequest } from "@im-library/interfaces/AutoGen";
import { EntityService } from "@/services";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
// import { getLogger } from "@im-library/logger/LogConfig";

// const log = getLogger("rootStore");

export const useRootStore = defineStore("root", {
  state: (): RootState => ({
    conceptIri: IM.MODULE_ONTOLOGY,
    snomedLicenseAccepted: localStorage.getItem("snomedLicenseAccepted") === "true" ? true : false,
    showSnomedLicense: false,
    focusHierarchy: false,
    arrayObjectNameListboxWithLabelStartExpanded: [],
    tagSeverityMatches: [
      { "@id": IM.ACTIVE, severity: "success" },
      { "@id": IM.DRAFT, severity: "warning" },
      { "@id": IM.INACTIVE, severity: "danger" }
    ],
    textDefinitionStartExpanded: ["Definition"],
    activeProfile: { uuid: "", activeClausePath: "" },
  }),
  actions: {
    updateActiveProfile(value: any) {
      this.activeProfile = value;
    },
    updateConceptIri(conceptIri: any) {
      this.conceptIri = conceptIri;
    },
    updateSnomedLicenseAccepted(bool: boolean) {
      this.snomedLicenseAccepted = bool;
      localStorage.setItem("snomedLicenseAccepted", bool === true ? "true" : "");
    },
    updateShowSnomedLicense(bool: boolean) {
      this.showSnomedLicense = bool;
    },
    updateFocusHierarchy(bool: any) {
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
