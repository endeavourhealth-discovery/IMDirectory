import { User } from "@/models/user/User";
import store from "@/store/index";
import EntityService from "@/services/EntityService";
import { flushPromises } from "@vue/test-utils";
import LoggerService from "@/services/LoggerService";
import { SearchRequest } from "@/models/search/SearchRequest";
import AuthService from "@/services/AuthService";
import { CustomAlert } from "@/models/user/CustomAlert";
import { IM } from "@/vocabulary/IM";
import ConfigService from "@/services/ConfigService";

describe("state", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    window.sessionStorage.clear();
  });

  afterAll(() => {
    window.sessionStorage.clear();
  });

  it("should start with the correct values", () => {
    expect(Object.keys(store.state)).toStrictEqual([
      "conceptIri",
      "history",
      "searchResults",
      "currentUser",
      "registeredUsername",
      "isLoggedIn",
      "snomedLicenseAccepted",
      "historyCount",
      "focusTree",
      "treeLocked",
      "resetTree",
      "blockedIris",
      "sideNavHierarchyFocus",
      "selectedEntityType",
      "filterOptions",
      "selectedFilters",
      "quickFiltersStatus",
      "moduleSelectedEntities",
      "activeModule",
      "conceptActivePanel",
      "focusHierarchy",
      "instanceIri",
      "sidebarControlActivePanel",
      "catalogueSearchResults",
      "hierarchySelectedFilters",
      "filterDefaults"
    ]);
    expect(store.state.conceptIri).toBe("http://endhealth.info/im#DiscoveryOntology");
    expect(store.state.history).toEqual([]);
    expect(store.state.searchResults).toEqual([]);
    expect(store.state.currentUser).toEqual({});
    expect(store.state.registeredUsername).toBe("");
    expect(store.state.isLoggedIn).toBeFalsy();
    expect(store.state.snomedLicenseAccepted).toBeNull();
    expect(store.state.historyCount).toBe(0);
    expect(store.state.focusTree).toBe(false);
    expect(store.state.treeLocked).toBe(true);
    expect(store.state.resetTree).toBe(false);
    expect(store.state.blockedIris).toStrictEqual([]);
    expect(store.state.sideNavHierarchyFocus).toStrictEqual({
      name: "Ontology",
      fullName: "Ontologies",
      iri: "http://endhealth.info/im#DiscoveryOntology",
      route: "Dashboard"
    });
    expect(store.state.selectedEntityType).toBe("");
    expect(store.state.selectedFilters).toEqual({
      status: [],
      schemes: [],
      types: []
    });
    expect(store.state.filterOptions).toStrictEqual({ status: [], schemes: [], types: [] });
    expect(store.state.quickFiltersStatus).toEqual(new Map<string, boolean>());
    expect(store.state.moduleSelectedEntities).toStrictEqual(
      new Map([
        ["Ontology", IM.MODULE_ONTOLOGY],
        ["Sets", IM.MODULE_SETS],
        ["DataModel", IM.MODULE_DATA_MODEL],
        ["Catalogue", IM.MODULE_CATALOGUE],
        ["Queries", IM.MODULE_QUERIES]
      ])
    );
    expect(store.state.activeModule).toBe("default");
    expect(store.state.conceptActivePanel).toBe(0);
    expect(store.state.focusHierarchy).toBe(false);
    expect(store.state.catalogueSearchResults).toStrictEqual([]);
    expect(store.state.instanceIri).toBe("");
    expect(store.state.hierarchySelectedFilters).toStrictEqual([]);
    expect(store.state.filterDefaults).toStrictEqual({});
  });
});

describe("mutations", () => {
  it("can updateConceptIri", () => {
    const testConceptIri = "http://www.endhealth.info/im#test";
    store.commit("updateConceptIri", testConceptIri);
    expect(store.state.conceptIri).toEqual(testConceptIri);
  });

  it("can updateHistory", () => {
    const testHistory = { url: "testUrl", conceptName: "testName", view: "testVuew" };
    store.commit("updateHistory", testHistory);
    expect(store.state.history).toEqual([testHistory]);
  });

  it("can updateHistory ___ duplicate", () => {
    const testHistory = { url: "testUrl", conceptName: "testName", view: "testVuew" };
    store.commit("updateHistory", testHistory);
    store.commit("updateHistory", testHistory);
    expect(store.state.history).toEqual([testHistory]);
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

  it("can updateRegisteredUsername", () => {
    const testUsername = "devTest";
    store.commit("updateRegisteredUsername", "devTest");
    expect(store.state.registeredUsername).toBe(testUsername);
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

  it("can updateHistoryCount", () => {
    const testCount = 5;
    store.commit("updateHistoryCount", testCount);
    expect(store.state.historyCount).toBe(5);
  });

  it("can update focusTree", () => {
    const testBool = true;
    store.commit("updateFocusTree", testBool);
    expect(store.state.focusTree).toBe(true);
  });

  it("can update treeLocked", () => {
    const testBool = false;
    store.commit("updateTreeLocked", testBool);
    expect(store.state.treeLocked).toBe(false);
  });

  it("can update resetTree", () => {
    const testBool = true;
    store.commit("updateResetTree", testBool);
    expect(store.state.resetTree).toBe(true);
  });

  it("can update blockedIris", () => {
    const testIris = ["iri1", "iri2", "iri3"];
    store.commit("updateBlockedIris", testIris);
    expect(store.state.blockedIris).toStrictEqual(testIris);
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
    const testfilters = new Map<string, boolean>();
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

  it("can updateSideNavHierarchyFocus", () => {
    store.commit("updateSideNavHierarchyFocus", true);
    expect(store.state.sideNavHierarchyFocus).toBe(true);
  });

  it("can updateSelectedEntityType", () => {
    store.commit("updateSelectedEntityType", "class");
    expect(store.state.selectedEntityType).toBe("class");
  });

  it("can updateModuleSelectedEntities", () => {
    store.commit("updateModuleSelectedEntities", { module: "DataModel", iri: "testIri" });
    expect(store.state.moduleSelectedEntities).toStrictEqual(
      new Map([
        ["Ontology", IM.MODULE_ONTOLOGY],
        ["Sets", IM.MODULE_SETS],
        ["DataModel", "testIri"],
        ["Catalogue", IM.MODULE_CATALOGUE],
        ["Queries", IM.MODULE_QUERIES]
      ])
    );
  });

  it("can updateConceptActivePanel", () => {
    store.commit("updateConceptActivePanel", 3);
    expect(store.state.conceptActivePanel).toBe(3);
  });

  it("can updateActiveModule", () => {
    store.commit("updateActiveModule", "sets");
    expect(store.state.activeModule).toBe("sets");
  });

  it("can updateFocusHierarchy", () => {
    store.commit("updateFocusHierarchy", true);
    expect(store.state.focusHierarchy).toBe(true);
  });

  it("can updateCatalogueSearchResults", () => {
    store.commit("updateCatalogueSearchResults", ["testTermString"]);
    expect(store.state.catalogueSearchResults).toStrictEqual(["testTermString"]);
  });

  it("can updateInstanceIri", () => {
    store.commit("updateInstanceIri", "testIriString");
    expect(store.state.instanceIri).toBe("testIriString");
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

  it("can fetchBlockedIris", async () => {
    const iris = ["http://www.w3.org/2001/XMLSchema#string", "http://www.w3.org/2001/XMLSchema#boolean"];
    ConfigService.getXmlSchemaDataTypes = jest.fn().mockResolvedValue(iris);
    store.dispatch("fetchBlockedIris");
    await flushPromises();
    expect(ConfigService.getXmlSchemaDataTypes).toHaveBeenCalledTimes(1);
    expect(store.state.blockedIris).toStrictEqual(iris);
  });

  it("can fetchSearchResults ___ pass", async () => {
    EntityService.advancedSearch = jest.fn().mockResolvedValue({ entities: [{ iri: "testResult" }] });
    LoggerService.info = jest.fn();
    const testInput = { searchRequest: new SearchRequest(), cancelToken: "testCancelToken" };
    await store.dispatch("fetchSearchResults", testInput);
    await flushPromises();
    expect(EntityService.advancedSearch).toBeCalledTimes(1);
    expect(EntityService.advancedSearch).toBeCalledWith(testInput.searchRequest, testInput.cancelToken);
    await flushPromises();
    expect(store.state.searchResults).toEqual([]);
  });

  it("can fetchSearchResults ___ failed", async () => {
    EntityService.advancedSearch = jest.fn().mockResolvedValue({ status: 400, message: "test fail" });
    LoggerService.error = jest.fn();
    const testInput = { searchRequest: new SearchRequest(), cancelToken: "testCancelToken" };
    await store.dispatch("fetchSearchResults", testInput);
    await flushPromises();
    expect(EntityService.advancedSearch).toBeCalledTimes(1);
    expect(EntityService.advancedSearch).toBeCalledWith(testInput.searchRequest, testInput.cancelToken);
    await flushPromises();
    expect(store.state.searchResults).toStrictEqual([]);
  });

  it("can logoutCurrentUser ___ 200", async () => {
    AuthService.signOut = jest.fn().mockResolvedValue(new CustomAlert(200, "logout successful"));
    LoggerService.error = jest.fn();
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
    AuthService.signOut = jest.fn().mockResolvedValue(new CustomAlert(400, "logout failed 400"));
    LoggerService.error = jest.fn();
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
    AuthService.getCurrentAuthenticatedUser = jest.fn().mockResolvedValue(new CustomAlert(200, "user authenticated", undefined, testUser));
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
    AuthService.getCurrentAuthenticatedUser = jest.fn().mockResolvedValue(new CustomAlert(200, "user authenticated", undefined, testUser));
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
    AuthService.getCurrentAuthenticatedUser = jest.fn().mockResolvedValue(new CustomAlert(403, "user authenticated"));
    AuthService.signOut = jest.fn().mockResolvedValue(new CustomAlert(200, "logout successful"));
    LoggerService.info = jest.fn();
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
    AuthService.getCurrentAuthenticatedUser = jest.fn().mockResolvedValue(new CustomAlert(403, "user authenticated"));
    AuthService.signOut = jest.fn().mockResolvedValue(new CustomAlert(400, "logout failed"));
    LoggerService.error = jest.fn();
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
