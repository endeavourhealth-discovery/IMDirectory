import { defineStore } from "pinia";
import { DirectoryState } from "@/stores/types/directoryState";

import { IM } from "@im-library/vocabulary";
import { ConceptSummary } from "@im-library/interfaces";
import { SearchRequest } from "@im-library/interfaces/AutoGen";
import { EntityService } from "@/services";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
// import { getLogger } from "@im-library/logger/LogConfig";

// const log = getLogger("rootStore");

export const useDirectoryStore = defineStore("directory", {
    state: (): DirectoryState => ({
        conceptIri: IM.MODULE_ONTOLOGY,
        findInTreeIri: "",
        searchResults: [] as ConceptSummary[],
        searchLoading: false,
        sidebarControlActivePanel: 0,
        fontAwesomePro: false,
        splitterRightSize: 0,
        showReleaseNotes: false as boolean,
        showBanner: localStorage.getItem("showBanner") === "true" ? true : false,
    }),
    actions: {
        async fetchSearchResults(data: { searchRequest: SearchRequest; controller: AbortController }) {
            const result = await EntityService.advancedSearch(data.searchRequest, data.controller);
            if (result && isArrayHasLength(result)) {
                this.updateSearchResults(result);
            } else {
                this.updateSearchResults([]);
            }
        },
        // Mutations
        updateFindInTreeIri(value: any) {
            this.findInTreeIri = value;
        },
        updateSearchLoading(loading: any) {
            this.searchLoading = loading;
        },
        updateConceptIri(conceptIri: any) {
            this.conceptIri = conceptIri;
        },
        updateSearchResults(searchResults: any) {
            this.searchResults = searchResults;
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
        updateSidebarControlActivePanel(number: any) {
            this.sidebarControlActivePanel = number;
        },
        updateTagSeverityMatches(items: any) {
            this.tagSeverityMatches = items;
        },
        updateSplitterRightSize(splitterRightSize: any) {
            this.splitterRightSize = splitterRightSize;
        },
        updateShowReleaseNotes(bool: any) {
            this.showReleaseNotes = bool;
        },
        updateFontAwesomePro(bool: any) {
            this.fontAwesomePro = bool;
        },
        updateShowBanner(bool: boolean) {
            this.showBanner = bool;
            localStorage.setItem("showBanner", bool === true ? "true" : "");
        }
    }
});
