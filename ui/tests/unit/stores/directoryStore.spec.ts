import { flushPromises } from "@vue/test-utils";
import { EntityService } from "@/services";
import { beforeEach, describe, vi } from "vitest";
import testData from "./directoryStore.testData";
import { createTestingPinia } from "@pinia/testing";
import { useRootStore } from "@/stores/rootStore";
import { SearchRequest } from "@im-library/interfaces/AutoGen";
import { FilterOptions, ConceptSummary } from "@im-library/interfaces";
import { useDirectoryStore } from "@/stores/directoryStore";

describe("state", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        window.sessionStorage.clear();
        createTestingPinia({ stubActions: false });
    });

    afterAll(() => {
        window.sessionStorage.clear();
    });

    it("directoryStore should start with the correct values", () => {
        const directoryStore = useDirectoryStore();
        expect(Object.keys(directoryStore)).toEqual(
            expect.arrayContaining([
                "findInTreeIri",
                "searchResults",
                "searchLoading",
                "sidebarControlActivePanel",
                "fontAwesomePro",
                "splitterRightSize",
                "showReleaseNotes",
                "showBanner",
            ])
        );
        expect(directoryStore.searchResults).toEqual([]);
    });
});

describe("mutations", () => {
    it("can updateSearchResults", () => {
        const directoryStore = useDirectoryStore();

        const testResult = {
            name: "testConcept",
            iri: "testIri",
            scheme: {
                name: "testScheme",
                iri: "testSchemeIri"
            },
            code: "testCode",
            conceptType: {
                elements: [{ iri: "testType", name: "testType" }]
            },
            isDescendantOf: [],
            match: "testMatch",
            weighting: 0,
            status: { iri: "testStatus", name: "testStatus" }
        };
        directoryStore.updateSearchResults(testResult);
        expect(directoryStore.searchResults).toEqual(testResult);
    });
    it("can updateSidebarControlActivePanel", () => {
        const directoryStore = useDirectoryStore();
        directoryStore.updateSidebarControlActivePanel(4);
        expect(directoryStore.sidebarControlActivePanel).toBe(4);
    });
});

describe("actions", () => {
    let iriExistsSpy = vi.spyOn(EntityService, "iriExists");
    let getFilterOptionsSpy = vi.spyOn(EntityService, "getFilterOptions");
    let advancedSearchSpy = vi.spyOn(EntityService, "advancedSearch");

    beforeEach(() => {
        vi.resetAllMocks();
        createTestingPinia({ stubActions: false });
        iriExistsSpy.mockResolvedValue(true);
        getFilterOptionsSpy.mockResolvedValue(testData.FILTER_OPTIONS as any as FilterOptions);
        advancedSearchSpy.mockResolvedValue(testData.SEARCH_RESULTS as any as ConceptSummary[]);
    });

    it("can fetchSearchResults ___ pass", async () => {
        const directoryStore = useDirectoryStore();
        const testInput = { searchRequest: {} as SearchRequest, controller: new AbortController() };
        await directoryStore.fetchSearchResults(testInput);
        await flushPromises();
        expect(advancedSearchSpy).toBeCalledTimes(1);
        expect(advancedSearchSpy).toBeCalledWith(testInput.searchRequest, testInput.controller);
        await flushPromises();
        expect(directoryStore.searchResults).toEqual(testData.SEARCH_RESULTS);
    });

    it("can fetchSearchResults ___ failed", async () => {
        const directoryStore = useDirectoryStore();
        advancedSearchSpy.mockResolvedValue({ status: 400, message: "test fail" } as any as ConceptSummary[]);
        const testInput = { searchRequest: {} as SearchRequest, controller: new AbortController() };
        await directoryStore.fetchSearchResults(testInput);
        await flushPromises();
        expect(advancedSearchSpy).toBeCalledTimes(1);
        expect(advancedSearchSpy).toBeCalledWith(testInput.searchRequest, testInput.controller);
        await flushPromises();
        expect(directoryStore.searchResults).toStrictEqual([]);
    });
});
