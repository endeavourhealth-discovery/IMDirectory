import store from "@/store/index";
import { flushPromises } from "@vue/test-utils";
import AuthService from "@/services/AuthService";
import { Config, Models, Services } from "im-library";
import { beforeEach, describe, vi } from "vitest";
import { setupServer } from "msw/node";
import testData from "./index.testData";
const { User, CustomAlert } = Models;
const { EntityService, LoggerService } = Services;

describe("state", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.sessionStorage.clear();
  });

  afterAll(() => {
    window.sessionStorage.clear();
  });

  it("should start with the correct values", () => {
    expect(Object.keys(store.state)).toEqual(
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
    expect(store.state.conceptIri).toBe("http://endhealth.info/im#DiscoveryOntology");

    expect(store.state.searchResults).toEqual([]);
    expect(store.state.currentUser).toEqual({});
    expect(store.state.isLoggedIn).toBeFalsy();
    expect(store.state.snomedLicenseAccepted).toBeNull();

    expect(store.state.selectedFilters).toEqual({
      status: [],
      schemes: [],
      types: [],
      sortDirection: "",
      sortField: ""
    });
    expect(store.state.filterOptions).toStrictEqual({
      status: [],
      schemes: [],
      types: [],
      sortDirections: [],
      sortFields: []
    });
    expect(store.state.quickFiltersStatus).toEqual(new Map());
    expect(store.state.focusHierarchy).toBe(false);
    expect(store.state.hierarchySelectedFilters).toStrictEqual([]);
  });
});

describe("mutations", () => {
  it("can updateConceptIri", () => {
    const testConceptIri = "http://www.endhealth.info/im#test";
    store.commit("updateConceptIri", testConceptIri);
    expect(store.state.conceptIri).toEqual(testConceptIri);
  });

  it("can updateSearchResults", () => {
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
    store.commit("updateSearchResults", testResult);
    expect(store.state.searchResults).toEqual(testResult);
  });

  it("can updateCurrentUser", () => {
    const testUser = new User("testUser", "John", "Doe", "john.doe@ergosoft.co.uk", "", "colour/003-man.png");
    store.commit("updateCurrentUser", testUser);
    expect(store.state.currentUser).toEqual(testUser);
  });

  it("can updateIsLoggedIn", () => {
    const testBool = true;
    store.commit("updateIsLoggedIn", testBool);
    expect(store.state.isLoggedIn).toBe(true);
  });

  it("can updateSnomedLicenseAccepted", () => {
    const testBool = "true";
    store.commit("updateSnomedLicenseAccepted", testBool);
    expect(store.state.snomedLicenseAccepted).toBe("true");
  });

  it("can updateSelectedFilters", () => {
    const testFilter = {
      selectedStatus: ["testActive", "testDraft"],
      selectedSchemes: [{ iri: "http://endhealth.info/im#test" }],
      selectedTypes: ["testClass", "testProperty"]
    };
    store.commit("updateSelectedFilters", testFilter);
    expect(store.state.selectedFilters).toEqual(testFilter);
  });

  it("can updateQuickFiltersStatus", () => {
    const testfilters = new Map();
    testfilters.set("legacy", true);
    store.commit("updateQuickFiltersStatus", { key: "legacy", value: true });
    expect(store.state.quickFiltersStatus).toEqual(testfilters);
  });

  it("can updateFilterOptions", () => {
    const testFilter = {
      selectedStatus: ["testActive", "testDraft"],
      selectedSchemes: [{ iri: "http://endhealth.info/im#test" }],
      selectedTypes: ["testClass", "testProperty"]
    };
    store.commit("updateFilterOptions", testFilter);
    expect(store.state.filterOptions).toEqual(testFilter);
  });

  it("can updateFocusHierarchy", () => {
    store.commit("updateFocusHierarchy", true);
    expect(store.state.focusHierarchy).toBe(true);
  });

  it("can updateSidebarControlActivePanel", () => {
    store.commit("updateSidebarControlActivePanel", 4);
    expect(store.state.sidebarControlActivePanel).toBe(4);
  });

  it("can update hierarchySelectedFilters", () => {
    store.commit("updateHierarchySelectedFilters", ["testIri"]);
    expect(store.state.hierarchySelectedFilters).toStrictEqual(["testIri"]);
  });

  it("can updateFilterDefaults", () => {
    store.commit("updateFilterDefaults", { schemeOptions: ["testScheme"], statusOptions: ["testStatus"], typeOptions: ["testType"] });
    expect(store.state.filterDefaults).toStrictEqual({ schemeOptions: ["testScheme"], statusOptions: ["testStatus"], typeOptions: ["testType"] });
  });
});

describe("actions", () => {
  let iriExistsSpy = vi.spyOn(EntityService.prototype, "iriExists");
  let getFilterOptionsSpy = vi.spyOn(EntityService.prototype, "getFilterOptions");
  let advancedSearchSpy = vi.spyOn(EntityService.prototype, "advancedSearch");

  beforeEach(() => {
    vi.resetAllMocks();
    iriExistsSpy.mockResolvedValue(true);
    getFilterOptionsSpy.mockResolvedValue(testData.FILTER_OPTIONS);
    advancedSearchSpy.mockResolvedValue(testData.SEARCH_RESULTS);
  });

  it("can fetchSearchResults ___ pass", async () => {
    const testInput = { searchRequest: {}, controller: new AbortController() };
    await store.dispatch("fetchSearchResults", testInput);
    await flushPromises();
    expect(advancedSearchSpy).toBeCalledTimes(1);
    expect(advancedSearchSpy).toBeCalledWith(testInput.searchRequest, testInput.controller);
    await flushPromises();
    expect(store.state.searchResults).toEqual(testData.SEARCH_RESULTS);
  });

  it("can fetchSearchResults ___ failed", async () => {
    advancedSearchSpy.mockResolvedValue({ status: 400, message: "test fail" });
    const testInput = { searchRequest: {}, controller: new AbortController() };
    await store.dispatch("fetchSearchResults", testInput);
    await flushPromises();
    expect(advancedSearchSpy).toBeCalledTimes(1);
    expect(advancedSearchSpy).toBeCalledWith(testInput.searchRequest, testInput.controller);
    await flushPromises();
    expect(store.state.searchResults).toStrictEqual([]);
  });

  it("can logoutCurrentUser ___ 200", async () => {
    AuthService.signOut = vi.fn().mockResolvedValue(new CustomAlert(200, "logout successful"));
    let result = false;
    await store.dispatch("logoutCurrentUser").then(res => (result = res));
    await flushPromises();
    expect(AuthService.signOut).toBeCalledTimes(1);
    await flushPromises();
    expect(store.state.currentUser).toBe(null);
    expect(store.state.isLoggedIn).toBe(false);
    expect(result).toEqual(new CustomAlert(200, "logout successful"));
  });

  it("can logoutCurrentUser ___ 400", async () => {
    AuthService.signOut = vi.fn().mockResolvedValue(new CustomAlert(400, "logout failed 400"));
    let result = false;
    await store.dispatch("logoutCurrentUser").then(res => (result = res));
    await flushPromises();
    expect(AuthService.signOut).toBeCalledTimes(1);
    await flushPromises();
    expect(result).toEqual(new CustomAlert(400, "logout failed 400"));
  });

  it("can authenticateCurrentUser___ 200 ___ avatar", async () => {
    let testUser = new User("testUser", "John", "Doe", "john.doe@ergosoft.co.uk", "", "colour/003-man.png");
    testUser.setId("8901-test");
    AuthService.getCurrentAuthenticatedUser = vi.fn().mockResolvedValue(new CustomAlert(200, "user authenticated", undefined, testUser));
    let result = { authenticated: false };
    await store.dispatch("authenticateCurrentUser").then(res => (result = res));
    await flushPromises();
    expect(AuthService.getCurrentAuthenticatedUser).toBeCalledTimes(1);
    await flushPromises();
    expect(store.state.isLoggedIn).toBe(true);
    expect(store.state.currentUser).toEqual(testUser);
    expect(result.authenticated).toBe(true);
  });

  it("can authenticateCurrentUser___ 200 ___ no avatar", async () => {
    let testUser = new User("testUser", "John", "Doe", "john.doe@ergosoft.co.uk", "", "http://testimage.jpg");
    testUser.setId("8901-test");
    AuthService.getCurrentAuthenticatedUser = vi.fn().mockResolvedValue(new CustomAlert(200, "user authenticated", undefined, testUser));
    let result = { authenticated: false };
    await store.dispatch("authenticateCurrentUser").then(res => (result = res));
    await flushPromises();
    expect(AuthService.getCurrentAuthenticatedUser).toBeCalledTimes(1);
    await flushPromises();
    expect(store.state.isLoggedIn).toBe(true);
    testUser.avatar = "colour/001-man.png";
    expect(store.state.currentUser).toEqual(testUser);
    expect(result.authenticated).toBe(true);
  });

  it("can authenticateCurrentUser___ 403 ___ logout 200", async () => {
    AuthService.getCurrentAuthenticatedUser = vi.fn().mockResolvedValue(new CustomAlert(403, "user authenticated"));
    AuthService.signOut = vi.fn().mockResolvedValue(new CustomAlert(200, "logout successful"));
    LoggerService.info = vi.fn();
    let result = { authenticated: false };
    await store.dispatch("authenticateCurrentUser").then(res => (result = res));
    await flushPromises();
    expect(AuthService.getCurrentAuthenticatedUser).toBeCalledTimes(1);
    await flushPromises();
    expect(AuthService.signOut).toBeCalledTimes(1);
    await flushPromises();
    expect(store.state.isLoggedIn).toBe(false);
    expect(store.state.currentUser).toBe(null);
    expect(result.authenticated).toBe(false);
    expect(LoggerService.info).toBeCalledTimes(1);
    expect(LoggerService.info).toBeCalledWith(undefined, "Force logout successful");
  });

  it("can authenticateCurrentUser___ 403 ___ logout 200", async () => {
    AuthService.getCurrentAuthenticatedUser = vi.fn().mockResolvedValue(new CustomAlert(403, "user authenticated"));
    AuthService.signOut = vi.fn().mockResolvedValue(new CustomAlert(400, "logout failed"));
    LoggerService.error = vi.fn();
    let result = { authenticated: false };
    await store.dispatch("authenticateCurrentUser").then(res => (result = res));
    await flushPromises();
    expect(AuthService.getCurrentAuthenticatedUser).toBeCalledTimes(1);
    await flushPromises();
    expect(AuthService.signOut).toBeCalledTimes(1);
    await flushPromises();
    expect(store.state.isLoggedIn).toBe(false);
    expect(store.state.currentUser).toBe(null);
    expect(result.authenticated).toBe(false);
    expect(LoggerService.error).toBeCalledTimes(1);
    expect(LoggerService.error).toBeCalledWith(undefined, "Force logout failed");
  });
});
