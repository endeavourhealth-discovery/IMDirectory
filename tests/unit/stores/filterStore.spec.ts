import { IM, RDF, RDFS } from "@endeavour/vue-library/enums";

import { createTestingPinia } from "@pinia/testing";
import { beforeEach, describe, expect, vi } from "vitest";

import { type FilterOptions, FilterOptionsSchema } from "@/models";
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
    const testFilter = FilterOptionsSchema.parse({
      status: [{ iri: IM.DRAFT }, { iri: IM.ACTIVE }],
      schemes: [{ iri: "http://endhealth.info/im#test" }],
      types: [{ iri: RDFS.CLASS }, { iri: RDF.PROPERTY }]
    });
    filterStore.updateSelectedFilterOptions(testFilter);
    expect(filterStore.selectedFilterOptions).toEqual(testFilter);
  });

  it("can updateFilterOptions", () => {
    const filterStore = useFilterStore();
    const testFilter = FilterOptionsSchema.parse({
      status: [{ iri: IM.DRAFT }, { iri: IM.ACTIVE }],
      schemes: [{ iri: "http://endhealth.info/im#test" }],
      types: [{ iri: RDFS.CLASS }, { iri: RDF.PROPERTY }]
    });
    filterStore.updateFilterOptions(testFilter);
    expect(filterStore.filterOptions).toEqual(testFilter);
  });
  it("can update hierarchyselectedFilterOptions", () => {
    const filterStore = useFilterStore();
    const testFilter = [{ iri: "http://endhealth.info/im#testIri", name: "testName", prefix: "testPrefix" }];
    filterStore.updateHierarchySelectedFilters(testFilter);
    expect(filterStore.hierarchySelectedFilters).toStrictEqual(testFilter);
  });
  it("can updateFilterDefaults", () => {
    const filterStore = useFilterStore();
    const testFilter = FilterOptionsSchema.parse({
      status: [{ iri: IM.DRAFT }, { iri: IM.ACTIVE }],
      schemes: [{ iri: "http://endhealth.info/im#test" }],
      types: [{ iri: RDFS.CLASS }, { iri: RDF.PROPERTY }]
    });
    filterStore.updateDefaultFilterOptions(testFilter);
    expect(filterStore.defaultFilterOptions).toStrictEqual(testFilter);
  });
});
