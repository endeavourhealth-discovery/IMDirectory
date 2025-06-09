import { beforeEach, describe, vi, expect } from "vitest";
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
        "showCookieConsent",
        "showSnomedLicense",
        "tagSeverityMatches",
        "showReleaseNotes",
        "showReleaseBanner",
        "showDevBanner",
        "activeProfile",
        "isDevMode"
      ])
    );
    expect(userStore.snomedLicenseAccepted).toBe(false);
  });
});

describe("mutations", () => {
  it("can updateSnomedLicenseAccepted", () => {
    const userStore = useUserStore();
    const testBool = true;
    userStore.updateSnomedLicenseAccepted(testBool);
    expect(userStore.snomedLicenseAccepted).toBe(true);
  });
});
