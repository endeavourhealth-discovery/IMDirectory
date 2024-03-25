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
    expect(filterStore.selectedFilterOptions).toEqual({});
    expect(filterStore.filterOptions).toStrictEqual({});
    expect(filterStore.hierarchySelectedFilters).toStrictEqual([]);
  });
});

describe("mutations", () => {
  it("can updateselectedFilterOptions", () => {
    const filterStore = useFilterStore();
    const testFilter = {
      selectedStatus: ["testActive", "testDraft"],
      selectedSchemes: [{ iri: "http://endhealth.info/im#test" }],
      selectedTypes: ["testClass", "testProperty"]
    };
    filterStore.updateSelectedFilterOptions(testFilter);
    expect(filterStore.selectedFilterOptions).toEqual(testFilter);
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
  it("can update hierarchyselectedFilterOptions", () => {
    const filterStore = useFilterStore();
    filterStore.updateHierarchySelectedFilters(["testIri"]);
    expect(filterStore.hierarchySelectedFilters).toStrictEqual(["testIri"]);
  });
  it("can updateFilterDefaults", () => {
    const filterStore = useFilterStore();
    filterStore.updateDefaultFilterOptions({ schemeOptions: ["testScheme"], statusOptions: ["testStatus"], typeOptions: ["testType"] });
    expect(filterStore.defaultFilterOptions).toStrictEqual({ schemeOptions: ["testScheme"], statusOptions: ["testStatus"], typeOptions: ["testType"] });
  });
});
