import { beforeEach, describe, vi } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import { useFilterStore } from "@/stores/filterStore";

describe("state", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.sessionStorage.clear();
    createTestingPinia({ stubActions: false });
  });

  afterAll(() => {
    window.sessionStorage.clear();
  });

  it("filter sharedStore should start with the correct values", () => {
    const filterStore = useFilterStore();
    expect(Object.keys(filterStore)).toEqual(
      expect.arrayContaining(["filterOptions", "defaultFilterOptions", "selectedFilterOptions", "hierarchySelectedFilters"])
    );
    expect(filterStore.selectedFilters).toEqual({});
    expect(filterStore.filterOptions).toStrictEqual({});
    expect(filterStore.quickFiltersStatus).toEqual(new Map());
    expect(filterStore.hierarchySelectedFilters).toStrictEqual([]);
  });
});

describe("mutations", () => {
  it("can updateSelectedFilters", () => {
    const filterStore = useFilterStore();
    const testFilter = {
      selectedStatus: ["testActive", "testDraft"],
      selectedSchemes: [{ iri: "http://endhealth.info/im#test" }],
      selectedTypes: ["testClass", "testProperty"]
    };
    filterStore.updateSelectedFilters(testFilter);
    expect(filterStore.selectedFilters).toEqual(testFilter);
  });

  it("can updateQuickFiltersStatus", () => {
    const filterStore = useFilterStore();
    const testfilters = new Map();
    testfilters.set("legacy", true);
    filterStore.updateQuickFiltersStatus({ key: "legacy", value: true });
    expect(filterStore.quickFiltersStatus).toEqual(testfilters);
  });

  it("can updateFilterOptions", () => {
    const filterStore = useFilterStore();
    const testFilter = {
      selectedStatus: ["testActive", "testDraft"],
      selectedSchemes: [{ iri: "http://endhealth.info/im#test" }],
      selectedTypes: ["testClass", "testProperty"]
    };
    filterStore.updateFilterOptions(testFilter);
    expect(filterStore.filterOptions).toEqual(testFilter);
  });
  it("can update hierarchySelectedFilters", () => {
    const filterStore = useFilterStore();
    filterStore.updateHierarchySelectedFilters(["testIri"]);
    expect(filterStore.hierarchySelectedFilters).toStrictEqual(["testIri"]);
  });
  it("can updateFilterDefaults", () => {
    const filterStore = useFilterStore();
    filterStore.updateFilterDefaults({ schemeOptions: ["testScheme"], statusOptions: ["testStatus"], typeOptions: ["testType"] });
    expect(filterStore.filterDefaults).toStrictEqual({ schemeOptions: ["testScheme"], statusOptions: ["testStatus"], typeOptions: ["testType"] });
  });
});
