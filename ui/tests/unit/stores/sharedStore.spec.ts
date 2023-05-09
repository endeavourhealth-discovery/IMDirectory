import { beforeEach, describe, vi } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import { useSharedStore } from "@/stores/sharedStore";
import { useUserStore } from "@/stores/userStore";

describe("state", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.sessionStorage.clear();
    createTestingPinia({ stubActions: false });
  });

  afterAll(() => {
    window.sessionStorage.clear();
  });

  it("root sharedStore should start with the correct values", () => {
    const sharedStore = useSharedStore();
    const userStore = useUserStore();
    expect(Object.keys(sharedStore)).toEqual(
      expect.arrayContaining([
        "conceptIri",
        "showCookieConsent",
        "fontAwesomePro",
        "showSnomedLicense",
        "focusHierarchy",
        "arrayObjectNameListboxWithLabelStartExpanded",
        "tagSeverityMatches",
        "textDefinitionStartExpanded",
        "activeProfile"
      ])
    );
    expect(sharedStore.conceptIri).toBe("http://endhealth.info/im#DiscoveryOntology");
    expect(userStore.snomedLicenseAccepted).toBe(false);
    expect(sharedStore.focusHierarchy).toBe(false);
  });
});

describe("mutations", () => {
  it("can updateConceptIri", () => {
    const sharedStore = useSharedStore();
    const testConceptIri = "http://www.endhealth.info/im#test";
    sharedStore.updateConceptIri(testConceptIri);
    expect(sharedStore.conceptIri).toEqual(testConceptIri);
  });

  it("can updateSnomedLicenseAccepted", () => {
    const userStore = useUserStore();
    const testBool = true;
    userStore.updateSnomedLicenseAccepted(testBool);
    expect(userStore.snomedLicenseAccepted).toBe(true);
  });
  it("can updateFocusHierarchy", () => {
    const sharedStore = useSharedStore();
    sharedStore.updateFocusHierarchy(true);
    expect(sharedStore.focusHierarchy).toBe(true);
  });
});
