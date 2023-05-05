import { beforeEach, describe, vi } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import { useRootStore } from "@/stores/rootStore";

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
        "snomedLicenseAccepted",
        "showSnomedLicense",
        "focusHierarchy",
        "arrayObjectNameListboxWithLabelStartExpanded",
        "tagSeverityMatches",
        "textDefinitionStartExpanded",
        "activeProfile"
      ])
    );
    expect(rootStore.conceptIri).toBe("http://endhealth.info/im#DiscoveryOntology");
    expect(rootStore.snomedLicenseAccepted).toBe(false);
    expect(rootStore.focusHierarchy).toBe(false);
  });
});

describe("mutations", () => {
  it("can updateConceptIri", () => {
    const rootStore = useRootStore();
    const testConceptIri = "http://www.endhealth.info/im#test";
    rootStore.updateConceptIri(testConceptIri);
    expect(rootStore.conceptIri).toEqual(testConceptIri);
  });

  it("can updateSnomedLicenseAccepted", () => {
    const rootStore = useRootStore();

    const testBool = true;
    rootStore.updateSnomedLicenseAccepted(testBool);
    expect(rootStore.snomedLicenseAccepted).toBe(true);
  });
  it("can updateFocusHierarchy", () => {
    const rootStore = useRootStore();
    rootStore.updateFocusHierarchy(true);
    expect(rootStore.focusHierarchy).toBe(true);
  });
});
