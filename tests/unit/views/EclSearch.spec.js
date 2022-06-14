import ExpressionConstraintsSearch from "@/views/EclSearch.vue";
import { flushPromises, shallowMount } from "@vue/test-utils";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import axios from "axios";

describe("EclSearch.vue", () => {
  let wrapper;
  let mockStore;
  let mockToast;
  let mockSetService;
  let mockLoggerService;
  let docSpy;
  let windowSpy;

  const SEARCH_RESULTS = {
    page: 1,
    count: 3,
    entities: [
      {
        name: "Arthrotec 50 gastro-resistant tablets (Pfizer Ltd) 60 tablet 6 x 10 tablets",
        iri: "http://snomed.info/sct#3160311000001101",
        code: "3160311000001101",
        description: "Arthrotec 50 gastro-resistant tablets (Pfizer Ltd) 60 tablet 6 x 10 tablets (product)",
        status: {
          name: "Active",
          "@id": "http://endhealth.info/im#Active"
        },
        scheme: {
          name: "Snomed-CT namespace",
          "@id": "http://snomed.info/sct#"
        },
        entityType: [
          {
            name: "Concept",
            "@id": "http://endhealth.info/im#Concept"
          }
        ],
        isDescendentOf: [],
        match: "25663601000001112"
      },
      {
        name: "Gabapentin 100mg capsules (Zentiva Pharma UK Ltd) 100 capsule",
        iri: "http://snomed.info/sct#9557811000001109",
        code: "9557811000001109",
        description: "Gabapentin 100mg capsules (Zentiva Pharma UK Ltd) 100 capsule (product)",
        status: {
          name: "Active",
          "@id": "http://endhealth.info/im#Active"
        },
        scheme: {
          name: "Snomed-CT namespace",
          "@id": "http://snomed.info/sct#"
        },
        entityType: [
          {
            name: "Concept",
            "@id": "http://endhealth.info/im#Concept"
          }
        ],
        isDescendentOf: [],
        match: "1762201000001114"
      },
      {
        name: "Dermablend cover creme B12 (Vichy)",
        iri: "http://snomed.info/sct#10222311000001109",
        code: "10222311000001109",
        description: "Dermablend cover creme B12 (Vichy) (product)",
        status: {
          name: "Active",
          "@id": "http://endhealth.info/im#Active"
        },
        scheme: {
          name: "Snomed-CT namespace",
          "@id": "http://snomed.info/sct#"
        },
        entityType: [
          {
            name: "Concept",
            "@id": "http://endhealth.info/im#Concept"
          }
        ],
        isDescendentOf: [],
        match: "66209001000001114"
      }
    ]
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    mockStore = { state: { sidebarControlActivePanel: 0 } };
    mockToast = { add: vi.fn() };

    mockSetService = { ECLSearch: vi.fn().mockResolvedValue(SEARCH_RESULTS) };

    mockLoggerService = { error: vi.fn(), warn: vi.fn(), info: vi.fn(), success: vi.fn(), debug: vi.fn() };

    wrapper = shallowMount(ExpressionConstraintsSearch, {
      global: {
        components: { Textarea, Button },
        mocks: { $store: mockStore, $toast: mockToast, $setService: mockSetService, $loggerService: mockLoggerService },
        directives: { tooltip: vi.fn(), clipboard: { copy: vi.fn(), success: vi.fn(), error: vi.fn() } }
      }
    });

    await flushPromises();
    await wrapper.vm.$nextTick();
    vi.clearAllMocks();
  });

  it("mounts", () => {
    expect(wrapper.vm.queryString).toBe("");
    expect(wrapper.vm.showDialog).toBe(false);
    expect(wrapper.vm.searchResults).toStrictEqual([]);
    expect(wrapper.vm.totalCount).toBe(0);
    expect(wrapper.vm.eclError).toBe(false);
    expect(wrapper.vm.loading).toBe(false);
  });

  it("can watch queryString", () => {
    wrapper.vm.eclError = true;
    wrapper.vm.$options.watch.queryString.call(wrapper.vm, "any");
    expect(wrapper.vm.eclError).toBe(false);
  });

  it("can updateECL", () => {
    wrapper.vm.updateECL("<< 10363601000001109 |UK product| ");
    expect(wrapper.vm.queryString).toBe("<< 10363601000001109 |UK product| ");
    expect(wrapper.vm.showDialog).toBe(false);
  });

  it("can showBuilder", () => {
    wrapper.vm.showBuilder();
    expect(wrapper.vm.showDialog).toBe(true);
  });

  it("can search ___ no querystring", async () => {
    wrapper.vm.search();
    await flushPromises();
    expect(mockSetService.ECLSearch).not.toHaveBeenCalled();
  });

  it("can search ___ querystring ___ success", async () => {
    wrapper.vm.queryString = "<< 10363601000001109 |UK product| ";
    const token = axios.CancelToken.source().token;
    wrapper.vm.search();
    expect(wrapper.vm.loading).toBe(true);
    await flushPromises();
    expect(mockSetService.ECLSearch).toHaveBeenCalledTimes(1);
    expect(mockSetService.ECLSearch).toHaveBeenCalledWith("<< 10363601000001109 |UK product| ", false, 1000, token);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.searchResults).toStrictEqual(SEARCH_RESULTS.entities);
    expect(wrapper.vm.totalCount).toBe(3);
  });

  it("cancels existing requests on new search", async () => {
    wrapper.vm.queryString = "sco";
    wrapper.vm.search();
    await wrapper.vm.$nextTick();
    const spy = vi.spyOn(wrapper.vm.request, "cancel");
    wrapper.vm.queryString = "pul";
    wrapper.vm.search();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockReset();
  });

  it("can search ___ empty result", async () => {
    wrapper.vm.queryString = "sco";
    mockSetService.ECLSearch = vi.fn().mockResolvedValue({});
    wrapper.vm.search();
    await flushPromises();
    expect(wrapper.vm.eclError).toBe(true);
  });

  it("can toast onCopy", () => {
    wrapper.vm.onCopy();
    expect(mockToast.add).toHaveBeenCalledTimes(1);
  });

  it("can toast onCopyError", () => {
    wrapper.vm.onCopyError();
    expect(mockToast.add).toHaveBeenCalledTimes(1);
  });
});
