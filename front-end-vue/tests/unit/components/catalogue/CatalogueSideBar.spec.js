import CatalogueSideBar from "@/components/catalogue/CatalogueSideBar.vue";
import InputText from "primevue/inputtext";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import CatalogueService from "@/services/CatalogueService";
import { flushPromises, shallowMount } from "@vue/test-utils";
import axios from "axios";

describe("CatalogueSideBar.vue ___ no catalogueSearchResults", () => {
  let wrapper;
  let mockStore;
  let docSpy;
  let windowSpy;

  const SEARCH_RESULTS = [
    { iriType: { "@id": "Address (record type)" }, "@id": "http://loc.endhealth.info/im#8F779" },
    { name: "BARTS AND THE LONDON NHS TRUST", iriType: { "@id": "Organisation  (record type)" }, "@id": "http://org.endhealth.info/im#RNJ" },
    { name: "BARTS AND THE LONDON NHS TRUST", iriType: { "@id": "Organisation  (record type)" }, "@id": "http://org.endhealth.info/im#RNJ00" },
    { name: "BARTS AND THE LONDON OUTREACH CLINICS", iriType: { "@id": "Organisation  (record type)" }, "@id": "http://org.endhealth.info/im#R1H65" }
  ];

  const TYPE_OPTIONS = [
    { iri: "http://endhealth.info/im#Address", label: "Address (record type)", count: 267904 },
    { iri: "http://endhealth.info/im#Organisation", label: "Organisation  (record type)", count: 267904 }
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    jest.useFakeTimers();

    mockStore = { state: { catalogueSearchResults: [] }, commit: jest.fn() };

    CatalogueService.getSearchResult = jest.fn().mockResolvedValue(SEARCH_RESULTS);

    windowSpy = jest.spyOn(window, "getComputedStyle");
    windowSpy.mockReturnValue({ getPropertyValue: jest.fn().mockReturnValue("16px") });

    docSpy = jest.spyOn(document, "getElementById");
    docSpy.mockReturnValue(undefined);

    wrapper = shallowMount(CatalogueSideBar, {
      global: { components: { InputText, TabPanel, TabView }, mocks: { $store: mockStore } },
      props: { history: [], typeOptions: TYPE_OPTIONS }
    });

    await flushPromises();
    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  it("mounts", () => {
    expect(wrapper.vm.searchTerm).toBe("");
    expect(wrapper.vm.searchResults).toStrictEqual([]);
    expect(wrapper.vm.selectedTypes).toStrictEqual([]);
    expect(wrapper.vm.active).toBe(0);
    expect(wrapper.vm.debounce).toBe(0);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.request).toBeTruthy();
    expect(wrapper.vm.sideMenuHeight).toBe("");
  });

  it("adds event listener to setContentHeights on resize", async () => {
    const spy = jest.spyOn(wrapper.vm, "setContainerHeight");
    window.dispatchEvent(new Event("resize"));
    await wrapper.vm.$nextTick();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockReset();
  });

  it("can remove eventListener", () => {
    const spy = jest.spyOn(global, "removeEventListener");
    wrapper.unmount();
    expect(spy).toHaveBeenCalled();
    spy.mockReset();
  });

  it("can onResize", () => {
    wrapper.vm.setContainerHeight = jest.fn();
    wrapper.vm.onResize();
    expect(wrapper.vm.setContainerHeight).toHaveBeenCalledTimes(1);
  });

  it("only searches with 3 or more characters ___ 0", async () => {
    wrapper.vm.searchTerm = "";
    wrapper.vm.getSearchResult();
    await flushPromises();
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.searchResults).toStrictEqual([]);
    expect(mockStore.commit).not.toHaveBeenCalled();
  });

  it("only searches with 3 or more characters ___ 2", async () => {
    wrapper.vm.searchTerm = "we";
    wrapper.vm.getSearchResult();
    await flushPromises();
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.searchResults).toStrictEqual([]);
    expect(mockStore.commit).not.toHaveBeenCalled();
  });

  it("only searches with 3 or more characters ___ 3", async () => {
    const token = axios.CancelToken.source();
    wrapper.vm.searchTerm = "sco";
    wrapper.vm.getSearchResult();
    expect(wrapper.vm.loading).toBe(true);
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(CatalogueService.getSearchResult).toHaveBeenCalledTimes(1);
    expect(CatalogueService.getSearchResult).toHaveBeenCalledWith("sco", [], token.token);
    expect(mockStore.commit).toHaveBeenCalled();
    expect(mockStore.commit).toHaveBeenCalledWith("updateCatalogueSearchResults", SEARCH_RESULTS);
  });

  it("cancels existing requests on new search", async () => {
    wrapper.vm.searchTerm = "sco";
    wrapper.vm.getSearchResult();
    await wrapper.vm.$nextTick();
    const spy = jest.spyOn(wrapper.vm.request, "cancel");
    wrapper.vm.searchTerm = "pul";
    wrapper.vm.getSearchResult();
    await wrapper.vm.$nextTick();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockReset();
  });

  it("debounces", async () => {
    expect(wrapper.vm.debounce).toBe(0);
    const spy = jest.spyOn(wrapper.vm, "getSearchResult");
    wrapper.vm.debounceForSearch();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.debounce).toBeGreaterThan(0);
    expect(spy).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("can updateTypes", () => {
    wrapper.vm.selectedTypes = [];
    wrapper.vm.updateTypes(TYPE_OPTIONS);
    expect(wrapper.vm.selectedTypes).toStrictEqual(TYPE_OPTIONS);
  });

  it("can checkKey ___ enter", () => {
    wrapper.vm.getSearchResult = jest.fn();
    wrapper.vm.checkKey("Enter");
    expect(wrapper.vm.getSearchResult).toHaveBeenCalledTimes(1);
  });

  it("can checkKey ___ other", () => {
    wrapper.vm.getSearchResult = jest.fn();
    wrapper.vm.checkKey("Space");
    expect(wrapper.vm.getSearchResult).not.toHaveBeenCalled();
  });

  it("can updateHistory", () => {
    const historyItem = {
      name: "BARTS HEALTH - COMMUNITY HEART FAILURE NURSING",
      iriType: { "@id": "Organisation  (record type)" },
      "@id": "http://org.endhealth.info/im#X9V1R"
    };
    wrapper.vm.updateHistory(historyItem);
    expect(wrapper.emitted().updateHistory).toBeTruthy();
    expect(wrapper.emitted().updateHistory[0]).toStrictEqual([historyItem]);
  });

  it("can setContainerHeight", () => {
    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = jest.fn().mockReturnValue({ height: 100 });
    mockElement.getElementsByClassName = jest.fn().mockReturnValue([mockElement]);
    docSpy.mockReturnValue(mockElement);
    wrapper.vm.sideMenuHeight = "";
    wrapper.vm.setContainerHeight();
    expect(wrapper.vm.sideMenuHeight).not.toBe("");
  });
});

describe("CatalogueSideBar.vue ___ catalogueSearchResults", () => {
  let wrapper;
  let mockStore;
  let docSpy;
  let windowSpy;

  const SEARCH_RESULTS = [
    { iriType: { "@id": "Address (record type)" }, "@id": "http://loc.endhealth.info/im#8F779" },
    { name: "BARTS AND THE LONDON NHS TRUST", iriType: { "@id": "Organisation  (record type)" }, "@id": "http://org.endhealth.info/im#RNJ" },
    { name: "BARTS AND THE LONDON NHS TRUST", iriType: { "@id": "Organisation  (record type)" }, "@id": "http://org.endhealth.info/im#RNJ00" },
    { name: "BARTS AND THE LONDON OUTREACH CLINICS", iriType: { "@id": "Organisation  (record type)" }, "@id": "http://org.endhealth.info/im#R1H65" }
  ];

  const TYPE_OPTIONS = [
    { iri: "http://endhealth.info/im#Address", label: "Address (record type)", count: 267904 },
    { iri: "http://endhealth.info/im#Organisation", label: "Organisation  (record type)", count: 267904 }
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    jest.useFakeTimers();

    mockStore = { state: { catalogueSearchResults: SEARCH_RESULTS }, commit: jest.fn() };

    CatalogueService.getSearchResult = jest.fn().mockResolvedValue(SEARCH_RESULTS);

    windowSpy = jest.spyOn(window, "getComputedStyle");
    windowSpy.mockReturnValue({ getPropertyValue: jest.fn().mockReturnValue("16px") });

    docSpy = jest.spyOn(document, "getElementById");
    docSpy.mockReturnValue(undefined);

    wrapper = shallowMount(CatalogueSideBar, {
      global: { components: { InputText, TabPanel, TabView }, mocks: { $store: mockStore } },
      props: { history: [], typeOptions: TYPE_OPTIONS }
    });

    await flushPromises();
    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  it("mounts", () => {
    expect(wrapper.vm.searchTerm).toBe("");
    expect(wrapper.vm.searchResults).toStrictEqual(SEARCH_RESULTS);
    expect(wrapper.vm.selectedTypes).toStrictEqual([]);
    expect(wrapper.vm.active).toBe(0);
    expect(wrapper.vm.debounce).toBe(0);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.request).toBeTruthy();
    expect(wrapper.vm.sideMenuHeight).toBe("");
  });
});
