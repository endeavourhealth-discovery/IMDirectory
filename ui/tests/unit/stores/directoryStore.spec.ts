import { flushPromises } from "@vue/test-utils";
import { EntityService } from "@/services";
import { beforeEach, describe, vi } from "vitest";
import testData from "./directoryStore.testData";
import { createTestingPinia } from "@pinia/testing";
import { useSharedStore } from "@/stores/sharedStore";
import { SearchRequest, SearchResponse, SearchResultSummary } from "@im-library/interfaces/AutoGen";
import { FilterOptions } from "@im-library/interfaces";
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
        "conceptIri",
        "findInTreeIri",
        "searchResults",
        "searchLoading",
        "sidebarControlActivePanel",
        "splitterRightSize",
        "focusHierarchy",
        "textDefinitionStartExpanded",
        "arrayObjectNameListboxWithLabelStartExpanded"
      ])
    );
    expect(directoryStore.conceptIri).toBe("http://endhealth.info/im#DiscoveryOntology");
    expect(directoryStore.searchResults).toEqual([]);
    expect(directoryStore.focusHierarchy).toBe(false);
  });
});

describe("mutations", () => {
  it("can updateSearchResults", () => {
    const directoryStore = useDirectoryStore();

    const testResult = {
      count: 1,
      page: 1,
      entities: [
        {
          name: "testConcept",
          iri: "testIri",
          scheme: {
            name: "testScheme",
            "@id": "testSchemeIri"
          },
          code: "testCode",
          entityType: [{ "@id": "testType", name: "testType" }],
          match: "testMatch",
          weighting: 0,
          status: { "@id": "testStatus", name: "testStatus" }
        }
      ]
    } as SearchResponse;
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
    advancedSearchSpy.mockResolvedValue(testData.SEARCH_RESULTS as any as SearchResponse);
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
    advancedSearchSpy.mockRejectedValue({ status: 400, message: "test fail" });
    const testInput = { searchRequest: {} as SearchRequest, controller: new AbortController() };
    await directoryStore.fetchSearchResults(testInput);
    await flushPromises();
    expect(advancedSearchSpy).toBeCalledTimes(1);
    expect(advancedSearchSpy).toBeCalledWith(testInput.searchRequest, testInput.controller);
    await flushPromises();
    expect(directoryStore.searchResults).toStrictEqual({} as SearchResponse);
  });
});

describe("mutations", () => {
  it("can updateConceptIri", () => {
    const directoryStore = useDirectoryStore();
    const testConceptIri = "http://www.endhealth.info/im#test";
    directoryStore.updateConceptIri(testConceptIri);
    expect(directoryStore.conceptIri).toEqual(testConceptIri);
  });
  it("can updateFocusHierarchy", () => {
    const directoryStore = useDirectoryStore();
    directoryStore.updateFocusHierarchy(true);
    expect(directoryStore.focusHierarchy).toBe(true);
  });
});
