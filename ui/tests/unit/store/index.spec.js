import { flushPromises } from "@vue/test-utils";
import { AuthService } from "@/services";
import { EntityService } from "@/services";
import { beforeEach, describe, vi } from "vitest";
import testData from "./index.testData";
import { createTestingPinia } from "@pinia/testing";
import { useRootStore } from "@/stores/root";

describe("state", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.sessionStorage.clear();
    createTestingPinia({ stubActions: false});
  });

  afterAll(() => {
    window.sessionStorage.clear();
  });

  it("should start with the correct values", () => {
    const store = useRootStore();
    expect(Object.keys(store)).toEqual(
      expect.arrayContaining([
        "conceptIri",
        "favourites",
        "history",
        "searchResults",
        "searchLoading",
        "currentUser",
        "isLoggedIn",
        "recentLocalActivity",
        "snomedLicenseAccepted",
        "snomedReturnUrl",
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
    expect(store.conceptIri).toBe("http://endhealth.info/im#DiscoveryOntology");

    expect(store.searchResults).toEqual([]);
    expect(store.currentUser).toEqual({});
    expect(store.isLoggedIn).toBeFalsy();
    expect(store.snomedLicenseAccepted).toBe(false);

    expect(store.selectedFilters).toEqual({});
    expect(store.filterOptions).toStrictEqual({});
    expect(store.quickFiltersStatus).toEqual(new Map());
    expect(store.focusHierarchy).toBe(false);
    expect(store.hierarchySelectedFilters).toStrictEqual([]);
  });
});

describe("mutations", () => {
  it("can updateConceptIri", () => {
    const store = useRootStore();
    const testConceptIri = "http://www.endhealth.info/im#test";
    store.updateConceptIri(testConceptIri);
    expect(store.conceptIri).toEqual(testConceptIri);
  });

  it("can updateSearchResults", () => {
    const store = useRootStore();

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
    store.updateSearchResults(testResult);
    expect(store.searchResults).toEqual(testResult);
  });

  it("can updateCurrentUser", () => {
    const store = useRootStore();

    const testUser = {
      username: "testUser",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@ergosoft.co.uk",
      password: "",
      avatar: "colour/003-man.png",
      roles: []
    };
    store.updateCurrentUser(testUser);
    expect(store.currentUser).toEqual(testUser);
  });

  it("can updateIsLoggedIn", () => {
    const store = useRootStore();

    const testBool = true;
    store.updateIsLoggedIn(testBool);
    expect(store.isLoggedIn).toBe(true);
  });

  it("can updateSnomedLicenseAccepted", () => {
    const store = useRootStore();

    const testBool = true;
    store.updateSnomedLicenseAccepted(testBool);
    expect(store.snomedLicenseAccepted).toBe(true);
  });

  it("can updateSelectedFilters", () => {
    const store = useRootStore();
    const testFilter = {
      selectedStatus: ["testActive", "testDraft"],
      selectedSchemes: [{ iri: "http://endhealth.info/im#test" }],
      selectedTypes: ["testClass", "testProperty"]
    };
    store.updateSelectedFilters(testFilter);
    expect(store.selectedFilters).toEqual(testFilter);
  });

  it("can updateQuickFiltersStatus", () => {
    const store = useRootStore();
    const testfilters = new Map();
    testfilters.set("legacy", true);
    store.updateQuickFiltersStatus({ key: "legacy", value: true });
    expect(store.quickFiltersStatus).toEqual(testfilters);
  });

  it("can updateFilterOptions", () => {
    const store = useRootStore();
    const testFilter = {
      selectedStatus: ["testActive", "testDraft"],
      selectedSchemes: [{ iri: "http://endhealth.info/im#test" }],
      selectedTypes: ["testClass", "testProperty"]
    };
    store.updateFilterOptions(testFilter);
    expect(store.filterOptions).toEqual(testFilter);
  });

  it("can updateFocusHierarchy", () => {
    const store = useRootStore();
    store.updateFocusHierarchy(true);
    expect(store.focusHierarchy).toBe(true);
  });

  it("can updateSidebarControlActivePanel", () => {
    const store = useRootStore();
    store.updateSidebarControlActivePanel(4);
    expect(store.sidebarControlActivePanel).toBe(4);
  });

  it("can update hierarchySelectedFilters", () => {
    const store = useRootStore();
    store.updateHierarchySelectedFilters(["testIri"]);
    expect(store.hierarchySelectedFilters).toStrictEqual(["testIri"]);
  });

  it("can updateFilterDefaults", () => {
    const store = useRootStore();
    store.updateFilterDefaults({ schemeOptions: ["testScheme"], statusOptions: ["testStatus"], typeOptions: ["testType"] });
    expect(store.filterDefaults).toStrictEqual({ schemeOptions: ["testScheme"], statusOptions: ["testStatus"], typeOptions: ["testType"] });
  });
});

describe("actions", () => {
  let iriExistsSpy = vi.spyOn(EntityService, "iriExists");
  let getFilterOptionsSpy = vi.spyOn(EntityService, "getFilterOptions");
  let advancedSearchSpy = vi.spyOn(EntityService, "advancedSearch");

  beforeEach(() => {
    vi.resetAllMocks();
    createTestingPinia({stubActions: false});
    iriExistsSpy.mockResolvedValue(true);
    getFilterOptionsSpy.mockResolvedValue(testData.FILTER_OPTIONS);
    advancedSearchSpy.mockResolvedValue(testData.SEARCH_RESULTS);
  });

  it("can fetchSearchResults ___ pass", async () => {
    const store = useRootStore();
    const testInput = { searchRequest: {}, controller: new AbortController() };
    await store.fetchSearchResults(testInput);
    await flushPromises();
    expect(advancedSearchSpy).toBeCalledTimes(1);
    expect(advancedSearchSpy).toBeCalledWith(testInput.searchRequest, testInput.controller);
    await flushPromises();
    expect(store.searchResults).toEqual(testData.SEARCH_RESULTS);
  });

  it("can fetchSearchResults ___ failed", async () => {
    const store = useRootStore();
    advancedSearchSpy.mockResolvedValue({ status: 400, message: "test fail" });
    const testInput = { searchRequest: {}, controller: new AbortController() };
    await store.fetchSearchResults(testInput);
    await flushPromises();
    expect(advancedSearchSpy).toBeCalledTimes(1);
    expect(advancedSearchSpy).toBeCalledWith(testInput.searchRequest, testInput.controller);
    await flushPromises();
    expect(store.searchResults).toStrictEqual([]);
  });

  it("can logoutCurrentUser ___ 200", async () => {
    const store = useRootStore();
    AuthService.signOut = vi.fn().mockResolvedValue({ status: 200, message: "logout successful" });
    let result = false;
    await store.logoutCurrentUser().then(res => (result = res));
    await flushPromises();
    expect(AuthService.signOut).toBeCalledTimes(1);
    await flushPromises();
    expect(store.currentUser).toBe(null);
    expect(store.isLoggedIn).toBe(false);
    expect(result).toEqual({ status: 200, message: "logout successful" });
  });

  it("can logoutCurrentUser ___ 400", async () => {
    const store = useRootStore();
    AuthService.signOut = vi.fn().mockResolvedValue({ status: 400, message: "logout failed 400" });
    let result = false;
    await store.logoutCurrentUser().then(res => (result = res));
    await flushPromises();
    expect(AuthService.signOut).toBeCalledTimes(1);
    await flushPromises();
    expect(result).toEqual({ status: 400, message: "logout failed 400" });
  });

  it("can authenticateCurrentUser___ 200 ___ avatar", async () => {
    const store = useRootStore();
    let testUser = {
      id: "8901-test",
      username: "testUser",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@ergosoft.co.uk",
      password: "",
      avatar: "colour/003-man.png",
      roles: []
    };
    AuthService.getCurrentAuthenticatedUser = vi.fn().mockResolvedValue({ status: 200, message: "user authenticated", error: undefined, user: testUser });
    let result = { authenticated: false };
    await store.authenticateCurrentUser().then(res => (result = res));
    await flushPromises();
    expect(AuthService.getCurrentAuthenticatedUser).toBeCalledTimes(1);
    await flushPromises();
    expect(store.isLoggedIn).toBe(true);
    expect(store.currentUser).toEqual(testUser);
    expect(result.authenticated).toBe(true);
  });

  it("can authenticateCurrentUser___ 200 ___ no avatar", async () => {
    const store = useRootStore();
    let testUser = {
      id: "8901-test",
      username: "testUser",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@ergosoft.co.uk",
      password: "",
      avatar: "http://testimage.jpg",
      roles: []
    };

    AuthService.getCurrentAuthenticatedUser = vi.fn().mockResolvedValue({ status: 200, message: "user authenticated", error: undefined, user: testUser });
    let result = { authenticated: false };
    await store.authenticateCurrentUser().then(res => (result = res));
    await flushPromises();
    expect(AuthService.getCurrentAuthenticatedUser).toBeCalledTimes(1);
    await flushPromises();
    expect(store.isLoggedIn).toBe(true);
    testUser.avatar = "colour/001-man.png";
    expect(store.currentUser).toEqual(testUser);
    expect(result.authenticated).toBe(true);
  });

  it("can authenticateCurrentUser___ 403 ___ logout 200", async () => {
    const store = useRootStore();
    AuthService.getCurrentAuthenticatedUser = vi.fn().mockResolvedValue({ status: 403, message: "user authenticated" });
    AuthService.signOut = vi.fn().mockResolvedValue({ status: 200, message: "logout successful" });
    let result = { authenticated: false };
    await store.authenticateCurrentUser().then(res => (result = res));
    await flushPromises();
    expect(AuthService.getCurrentAuthenticatedUser).toBeCalledTimes(1);
    await flushPromises();
    expect(AuthService.signOut).toBeCalledTimes(1);
    await flushPromises();
    expect(store.isLoggedIn).toBe(false);
    expect(store.currentUser).toBe(null);
    expect(result.authenticated).toBe(false);
  });

  it("can authenticateCurrentUser___ 403 ___ logout 400", async () => {
    const store = useRootStore();
    AuthService.getCurrentAuthenticatedUser = vi.fn().mockResolvedValue({ status: 403, message: "user authenticated" });
    AuthService.signOut = vi.fn().mockResolvedValue({ status: 400, message: "logout failed" });
    let result = { authenticated: false };
    await store.authenticateCurrentUser().then(res => (result = res));
    await flushPromises();
    expect(AuthService.getCurrentAuthenticatedUser).toBeCalledTimes(1);
    await flushPromises();
    expect(AuthService.signOut).toBeCalledTimes(1);
    await flushPromises();
    expect(store.isLoggedIn).toBe(false);
    expect(store.currentUser).toStrictEqual({});
    expect(result.authenticated).toBe(false);
  });
});
