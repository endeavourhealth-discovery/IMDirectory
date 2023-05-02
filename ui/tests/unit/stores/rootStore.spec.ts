import { flushPromises } from "@vue/test-utils";
import { EntityService } from "@/services";
import { beforeEach, describe, vi } from "vitest";
import testData from "./rootStore.testData";
import { createTestingPinia } from "@pinia/testing";
import { useRootStore } from "@/stores/rootStore";
import { SearchRequest } from "@im-library/interfaces/AutoGen";
import { FilterOptions, ConceptSummary } from "@im-library/interfaces";

describe("state", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.sessionStorage.clear();
    createTestingPinia({ stubActions: false });
  });

  afterAll(() => {
    window.sessionStorage.clear();
  });

  it("root rootStore should start with the correct values", () => {
    const rootStore = useRootStore();
    expect(Object.keys(rootStore)).toEqual(
      expect.arrayContaining([
        "conceptIri",
        "favourites",
        "history",
        "searchResults",
        "searchLoading",
        "recentLocalActivity",
        "snomedLicenseAccepted",
        "authReturnUrl",
        "filterOptions",
        "selectedFilters",
        "quickFiltersStatus",
        "focusHierarchy",
        "sidebarControlActivePanel",
        "hierarchySelectedFilters",
        "filterDefaults",
        "arrayObjectNameListboxWithLabelStartExpanded",
        "tagSeverityMatches",
        "textDefinitionStartExpanded",
        "activeProfile"
      ])
    );
    expect(rootStore.conceptIri).toBe("http://endhealth.info/im#DiscoveryOntology");

    expect(rootStore.searchResults).toEqual([]);
    expect(rootStore.snomedLicenseAccepted).toBe(false);

    expect(rootStore.selectedFilters).toEqual({});
    expect(rootStore.filterOptions).toStrictEqual({});
    expect(rootStore.quickFiltersStatus).toEqual(new Map());
    expect(rootStore.focusHierarchy).toBe(false);
    expect(rootStore.hierarchySelectedFilters).toStrictEqual([]);
  });
});

describe("mutations", () => {
  it("can updateConceptIri", () => {
    const rootStore = useRootStore();
    const testConceptIri = "http://www.endhealth.info/im#test";
    rootStore.updateConceptIri(testConceptIri);
    expect(rootStore.conceptIri).toEqual(testConceptIri);
  });

  it("can updateSearchResults", () => {
    const rootStore = useRootStore();

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
    rootStore.updateSearchResults(testResult);
    expect(rootStore.searchResults).toEqual(testResult);
  });

  it("can updateSnomedLicenseAccepted", () => {
    const rootStore = useRootStore();

    const testBool = true;
    rootStore.updateSnomedLicenseAccepted(testBool);
    expect(rootStore.snomedLicenseAccepted).toBe(true);
  });

  it("can updateSelectedFilters", () => {
    const rootStore = useRootStore();
    const testFilter = {
      selectedStatus: ["testActive", "testDraft"],
      selectedSchemes: [{ iri: "http://endhealth.info/im#test" }],
      selectedTypes: ["testClass", "testProperty"]
    };
    rootStore.updateSelectedFilters(testFilter);
    expect(rootStore.selectedFilters).toEqual(testFilter);
  });

  it("can updateQuickFiltersStatus", () => {
    const rootStore = useRootStore();
    const testfilters = new Map();
    testfilters.set("legacy", true);
    rootStore.updateQuickFiltersStatus({ key: "legacy", value: true });
    expect(rootStore.quickFiltersStatus).toEqual(testfilters);
  });

  it("can updateFilterOptions", () => {
    const rootStore = useRootStore();
    const testFilter = {
      selectedStatus: ["testActive", "testDraft"],
      selectedSchemes: [{ iri: "http://endhealth.info/im#test" }],
      selectedTypes: ["testClass", "testProperty"]
    };
    rootStore.updateFilterOptions(testFilter);
    expect(rootStore.filterOptions).toEqual(testFilter);
  });

  it("can updateFocusHierarchy", () => {
    const rootStore = useRootStore();
    rootStore.updateFocusHierarchy(true);
    expect(rootStore.focusHierarchy).toBe(true);
  });

  it("can updateSidebarControlActivePanel", () => {
    const rootStore = useRootStore();
    rootStore.updateSidebarControlActivePanel(4);
    expect(rootStore.sidebarControlActivePanel).toBe(4);
  });

  it("can update hierarchySelectedFilters", () => {
    const rootStore = useRootStore();
    rootStore.updateHierarchySelectedFilters(["testIri"]);
    expect(rootStore.hierarchySelectedFilters).toStrictEqual(["testIri"]);
  });

  it("can updateFilterDefaults", () => {
    const rootStore = useRootStore();
    rootStore.updateFilterDefaults({ schemeOptions: ["testScheme"], statusOptions: ["testStatus"], typeOptions: ["testType"] });
    expect(rootStore.filterDefaults).toStrictEqual({ schemeOptions: ["testScheme"], statusOptions: ["testStatus"], typeOptions: ["testType"] });
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
    const rootStore = useRootStore();
    const testInput = { searchRequest: {} as SearchRequest, controller: new AbortController() };
    await rootStore.fetchSearchResults(testInput);
    await flushPromises();
    expect(advancedSearchSpy).toBeCalledTimes(1);
    expect(advancedSearchSpy).toBeCalledWith(testInput.searchRequest, testInput.controller);
    await flushPromises();
    expect(rootStore.searchResults).toEqual(testData.SEARCH_RESULTS);
  });

  it("can fetchSearchResults ___ failed", async () => {
    const rootStore = useRootStore();
    advancedSearchSpy.mockResolvedValue({ status: 400, message: "test fail" } as any as ConceptSummary[]);
    const testInput = { searchRequest: {} as SearchRequest, controller: new AbortController() };
    await rootStore.fetchSearchResults(testInput);
    await flushPromises();
    expect(advancedSearchSpy).toBeCalledTimes(1);
    expect(advancedSearchSpy).toBeCalledWith(testInput.searchRequest, testInput.controller);
    await flushPromises();
    expect(rootStore.searchResults).toStrictEqual([]);
  });
});
