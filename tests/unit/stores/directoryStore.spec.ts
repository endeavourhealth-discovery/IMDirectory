import { beforeEach, describe, expect, vi } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import { SearchResponse } from "@/interfaces/AutoGen";
import { useDirectoryStore } from "@/stores/directoryStore";
import { it } from "vitest";
import { afterAll } from "vitest";

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
        "findInTreeBoolean",
        "searchLoading",
        "sidebarControlActivePanel",
        "splitterRightSize",
        "focusHierarchy",
        "textDefinitionStartExpanded",
        "arrayObjectNameListboxWithLabelStartExpanded"
      ])
    );
    expect(directoryStore.conceptIri).toBe("http://endhealth.info/im#DiscoveryOntology");
    expect(directoryStore.searchResults).toEqual(undefined);
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
