import { flushPromises, shallowMount } from "@vue/test-utils";
import SearchResults from "@/components/sidebar/SearchResults.vue";
import DataTable from "primevue/datatable";
import ProgressSpinner from "primevue/progressspinner";
import Column from "primevue/column";
import OverlayPanel from "primevue/overlaypanel";
import Tooltip from "primevue/tooltip";
import ContextMenu from "primevue/contextmenu";
import VueClipboard from "vue3-clipboard";
import Button from "primevue/button";
import LoggerService from "@/services/LoggerService";
import ConfigService from "@/services/ConfigService";

Object.assign(navigator, {
  clipboard: {
    writeText: () => {}
  }
});

describe("SearchResults.vue", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRouter: any;
  let mockToast: any;
  let mockRef: any;
  let clipboardSpy: any;
  let docSpy: any;

  const BLOCKED_IRIS = [
    "http://www.w3.org/2001/XMLSchema#string",
    "http://www.w3.org/2001/XMLSchema#boolean",
    "http://www.w3.org/2001/XMLSchema#float",
    "http://www.w3.org/2001/XMLSchema#double",
    "http://www.w3.org/2001/XMLSchema#decimal",
    "http://www.w3.org/2001/XMLSchema#dateTime",
    "http://www.w3.org/2001/XMLSchema#duration",
    "http://www.w3.org/2001/XMLSchema#hexBinary",
    "http://www.w3.org/2001/XMLSchema#base64Binary",
    "http://www.w3.org/2001/XMLSchema#anyURI",
    "http://www.w3.org/2001/XMLSchema#ID",
    "http://www.w3.org/2001/XMLSchema#IDREF",
    "http://www.w3.org/2001/XMLSchema#ENTITY",
    "http://www.w3.org/2001/XMLSchema#NOTATION",
    "http://www.w3.org/2001/XMLSchema#normalizedString",
    "http://www.w3.org/2001/XMLSchema#token",
    "http://www.w3.org/2001/XMLSchema#language",
    "http://www.w3.org/2001/XMLSchema#IDREFS",
    "http://www.w3.org/2001/XMLSchema#ENTITIES",
    "http://www.w3.org/2001/XMLSchema#NMTOKEN",
    "http://www.w3.org/2001/XMLSchema#NMTOKENS",
    "http://www.w3.org/2001/XMLSchema#Name",
    "http://www.w3.org/2001/XMLSchema#QName",
    "http://www.w3.org/2001/XMLSchema#NCName",
    "http://www.w3.org/2001/XMLSchema#integer",
    "http://www.w3.org/2001/XMLSchema#nonNegativeInteger",
    "http://www.w3.org/2001/XMLSchema#positiveInteger",
    "http://www.w3.org/2001/XMLSchema#nonPositiveInteger",
    "http://www.w3.org/2001/XMLSchema#negativeInteger",
    "http://www.w3.org/2001/XMLSchema#byte",
    "http://www.w3.org/2001/XMLSchema#int",
    "http://www.w3.org/2001/XMLSchema#long",
    "http://www.w3.org/2001/XMLSchema#short",
    "http://www.w3.org/2001/XMLSchema#unsignedByte",
    "http://www.w3.org/2001/XMLSchema#unsignedInt",
    "http://www.w3.org/2001/XMLSchema#unsignedLong",
    "http://www.w3.org/2001/XMLSchema#unsignedShort",
    "http://www.w3.org/2001/XMLSchema#date",
    "http://www.w3.org/2001/XMLSchema#time",
    "http://www.w3.org/2001/XMLSchema#gYearMonth",
    "http://www.w3.org/2001/XMLSchema#gYear",
    "http://www.w3.org/2001/XMLSchema#gMonthDay",
    "http://www.w3.org/2001/XMLSchema#gDay",
    "http://www.w3.org/2001/XMLSchema#gMonth"
  ];

  const SEARCH_RESULTS = [
    {
      name: "Scoliosis deformity of spine (disorder)",
      iri: "http://snomed.info/sct#298382003",
      code: "298382003",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code", "@id": "http://endhealth.info/im#SnomedCodeScheme" },
      entityType: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      isDescendentOf: [],
      weighting: 0,
      match: "Scoliosis"
    }
  ];

  const DEFAULT_PREDICATES = {
    "http://endhealth.info/im#roleGroup": "Where",
    "http://www.w3.org/2002/07/owl#onProperty": "On property",
    "http://www.w3.org/2002/07/owl#intersectionOf": "Combination of",
    "http://www.w3.org/2002/07/owl#someValuesFrom": "With a value",
    "http://www.w3.org/2002/07/owl#equivalentClass": "Is equivalent to",
    "http://www.w3.org/2000/01/rdf-schema#subClassOf": "Is subclass of"
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    clipboardSpy = jest.spyOn(navigator.clipboard, "writeText");
    mockRouter = {
      push: jest.fn()
    };
    mockStore = {
      state: {
        blockedIris: BLOCKED_IRIS
      }
    };
    mockToast = {
      add: jest.fn()
    };
    mockRef = { render: () => {}, methods: { show: jest.fn(), hide: jest.fn() } };
    docSpy = jest.spyOn(document, "getElementById");
    docSpy.mockReturnValue(undefined);

    ConfigService.getDefaultPredicateNames = jest.fn().mockResolvedValue(DEFAULT_PREDICATES);

    wrapper = shallowMount(SearchResults, {
      global: {
        components: { DataTable, ProgressSpinner, Column, OverlayPanel, ContextMenu, Button },
        mocks: { $store: mockStore, $router: mockRouter, $toast: mockToast },
        directives: { tooltip: Tooltip, clipboard: VueClipboard },
        stubs: { OverlayPanel: mockRef, ContextMenu: mockRef, FontAwesomeIcon: true }
      },
      props: { searchResults: SEARCH_RESULTS, loading: false }
    });

    await flushPromises();
    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("mounts", () => {
    expect(wrapper.vm.results).toEqual({});
    expect(wrapper.vm.selectedResult).toStrictEqual({});
    expect(wrapper.vm.hoveredResult).toStrictEqual({});
    expect(wrapper.vm.searchResults).toStrictEqual(SEARCH_RESULTS);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.defaultPredicates).toStrictEqual(DEFAULT_PREDICATES);
  });

  it("can get perspective by concept type", () => {
    const testConceptType = [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }];
    expect(wrapper.vm.getPerspectiveByConceptType(testConceptType)).toStrictEqual(["far", "lightbulb"]);
  });

  it("can get colour by concept type", () => {
    const testConceptType = [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }];
    expect(wrapper.vm.getColorByConceptType(testConceptType)).toBe("color:#e39a3688");
  });

  it("reroutes on node select", async () => {
    wrapper.vm.selectedResult = {
      name: "Scoliosis deformity of spine (disorder)",
      iri: "http://snomed.info/sct#298382003",
      code: "298382003",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code", "@id": "http://endhealth.info/im#SnomedCodeScheme" },
      conceptType: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      isDescendentOf: [],
      weighting: 0,
      match: "Scoliosis"
    };
    await wrapper.vm.$nextTick();
    wrapper.vm.onNodeSelect();
    await wrapper.vm.$nextTick();
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: "Concept",
      params: { selectedIri: "http://snomed.info/sct#298382003" }
    });
  });

  it("can get concept types from concept", () => {
    const testConcept = {
      name: "Scoliosis deformity of spine (disorder)",
      iri: "http://snomed.info/sct#298382003",
      code: "298382003",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code", "@id": "http://endhealth.info/im#SnomedCodeScheme" },
      entityType: [
        { name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" },
        { name: "Instance", "@id": "" }
      ],
      isDescendentOf: [],
      weighting: 0,
      match: "Scoliosis"
    };
    expect(wrapper.vm.getConceptTypes(testConcept)).toBe("Class, Instance");
  });

  it("can get concept types from concept ___ fail", () => {
    const testConcept = {};
    expect(wrapper.vm.getConceptTypes(testConcept)).toBe("None");
  });

  it("updates results on store update", async () => {
    const testResult = {
      name: "Acquired scoliosis (disorder)",
      iri: "http://snomed.info/sct#111266001",
      code: "111266001",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code", "@id": "http://endhealth.info/im#SnomedCodeScheme" },
      conceptType: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      isDescendentOf: [],
      weighting: 9,
      match: "Acquired scoliosis"
    };
    wrapper.vm.$options.watch.searchResults.call(wrapper.vm, testResult);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.results).toStrictEqual(testResult);
  });

  it("can fire toast on copy", () => {
    wrapper.vm.onCopy();
    expect(mockToast.add).toHaveBeenCalledTimes(1);
    expect(mockToast.add).toHaveBeenCalledWith(LoggerService.success("Value copied to clipboard"));
  });

  it("can fire toast on copy error", () => {
    wrapper.vm.onCopyError();
    expect(mockToast.add).toHaveBeenCalledTimes(1);
    expect(mockToast.add).toHaveBeenCalledWith(LoggerService.error("Failed to copy value to clipboard"));
  });

  it("can set copy menu items", () => {
    wrapper.vm.hoveredResult = {
      name: "Scoliosis deformity of spine (disorder)",
      iri: "http://snomed.info/sct#298382003",
      code: "298382003",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code", "@id": "http://endhealth.info/im#SnomedCodeScheme" },
      entityType: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      isDescendentOf: [],
      weighting: 0,
      match: "Scoliosis"
    };
    wrapper.vm.copyMenuItems = [];
    expect(wrapper.vm.copyMenuItems).toStrictEqual([]);
    wrapper.vm.setCopyMenuItems();
    expect(wrapper.vm.copyMenuItems).toHaveLength(11);
    expect(wrapper.vm.copyMenuItems[0]).toStrictEqual({
      label: "Copy",
      disabled: true
    });
    expect(wrapper.vm.copyMenuItems[1]).toStrictEqual({
      separator: true
    });
    expect(Object.keys(wrapper.vm.copyMenuItems[2])).toStrictEqual(["label", "command"]);
    expect(wrapper.vm.copyMenuItems[2].label).toBe("All");
    expect(Object.keys(wrapper.vm.copyMenuItems[3])).toStrictEqual(["label", "command"]);
    expect(wrapper.vm.copyMenuItems[3].label).toBe("name");
    expect(Object.keys(wrapper.vm.copyMenuItems[4])).toStrictEqual(["label", "command"]);
    expect(wrapper.vm.copyMenuItems[4].label).toBe("iri");
    expect(Object.keys(wrapper.vm.copyMenuItems[5])).toStrictEqual(["label", "command"]);
    expect(wrapper.vm.copyMenuItems[5].label).toBe("code");
    expect(Object.keys(wrapper.vm.copyMenuItems[6])).toStrictEqual(["label", "command"]);
    expect(wrapper.vm.copyMenuItems[6].label).toBe("status");
    expect(Object.keys(wrapper.vm.copyMenuItems[7])).toStrictEqual(["label", "command"]);
    expect(wrapper.vm.copyMenuItems[7].label).toBe("scheme");
    expect(Object.keys(wrapper.vm.copyMenuItems[8])).toStrictEqual(["label", "command"]);
    expect(wrapper.vm.copyMenuItems[8].label).toBe("entityType");
    expect(Object.keys(wrapper.vm.copyMenuItems[9])).toStrictEqual(["label", "command"]);
    expect(wrapper.vm.copyMenuItems[9].label).toBe("weighting");
    expect(Object.keys(wrapper.vm.copyMenuItems[10])).toStrictEqual(["label", "command"]);
    expect(wrapper.vm.copyMenuItems[10].label).toBe("match");
  });

  it("can run commands from copymenuItems ___ pass", async () => {
    clipboardSpy.mockResolvedValue(true);
    wrapper.vm.hoveredResult = {
      name: "Scoliosis deformity of spine (disorder)",
      iri: "http://snomed.info/sct#298382003",
      code: "298382003",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code", "@id": "http://endhealth.info/im#SnomedCodeScheme" },
      entityType: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      isDescendentOf: [],
      weighting: 0,
      match: "Scoliosis"
    };
    wrapper.vm.setCopyMenuItems();
    await wrapper.vm.$nextTick();

    wrapper.vm.copyMenuItems[2].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith(
      "name: Scoliosis deformity of spine (disorder),\niri: http://snomed.info/sct#298382003,\ncode: 298382003,\nstatus: Active,\nscheme: Snomed-CT code,\nentityType: [\n\tClass\n],\nweighting: 0,\nmatch: Scoliosis"
    );
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.success("Concept copied to clipboard"));

    wrapper.vm.copyMenuItems[3].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("name: Scoliosis deformity of spine (disorder)");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.success("name copied to clipboard"));

    wrapper.vm.copyMenuItems[4].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("iri: http://snomed.info/sct#298382003");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.success("iri copied to clipboard"));

    wrapper.vm.copyMenuItems[5].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("code: 298382003");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.success("code copied to clipboard"));

    wrapper.vm.copyMenuItems[6].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("status: Active");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.success("status copied to clipboard"));

    wrapper.vm.copyMenuItems[7].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("scheme: Snomed-CT code");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.success("scheme copied to clipboard"));

    wrapper.vm.copyMenuItems[8].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("entityType: [\n\tClass\n]");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.success("entityType copied to clipboard"));

    wrapper.vm.copyMenuItems[9].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("weighting: 0");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.success("weighting copied to clipboard"));

    wrapper.vm.copyMenuItems[10].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("match: Scoliosis");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.success("match copied to clipboard"));
  });

  it("can run commands from copymenuItems ___ fail", async () => {
    clipboardSpy.mockRejectedValue(false);
    wrapper.vm.hoveredResult = {
      name: "Scoliosis deformity of spine (disorder)",
      iri: "http://snomed.info/sct#298382003",
      code: "298382003",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT code", "@id": "http://endhealth.info/im#SnomedCodeScheme" },
      entityType: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      isDescendentOf: [],
      weighting: 0,
      match: "Scoliosis"
    };
    wrapper.vm.setCopyMenuItems();
    await wrapper.vm.$nextTick();

    wrapper.vm.copyMenuItems[2].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith(
      "name: Scoliosis deformity of spine (disorder),\niri: http://snomed.info/sct#298382003,\ncode: 298382003,\nstatus: Active,\nscheme: Snomed-CT code,\nentityType: [\n\tClass\n],\nweighting: 0,\nmatch: Scoliosis"
    );
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.error("Failed to copy concept to clipboard"));

    wrapper.vm.copyMenuItems[3].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("name: Scoliosis deformity of spine (disorder)");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.error("Failed to copy name to clipboard"));

    wrapper.vm.copyMenuItems[4].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("iri: http://snomed.info/sct#298382003");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.error("Failed to copy iri to clipboard"));

    wrapper.vm.copyMenuItems[5].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("code: 298382003");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.error("Failed to copy code to clipboard"));

    wrapper.vm.copyMenuItems[6].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("status: Active");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.error("Failed to copy status to clipboard"));

    wrapper.vm.copyMenuItems[7].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("scheme: Snomed-CT code");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.error("Failed to copy scheme to clipboard"));

    wrapper.vm.copyMenuItems[8].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("entityType: [\n\tClass\n]");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.error("Failed to copy entityType to clipboard"));

    wrapper.vm.copyMenuItems[9].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("weighting: 0");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.error("Failed to copy weighting to clipboard"));

    wrapper.vm.copyMenuItems[10].command();
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("match: Scoliosis");
    expect(mockToast.add).toHaveBeenLastCalledWith(LoggerService.error("Failed to copy match to clipboard"));
  });

  it("can scroll to top", () => {
    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = jest.fn().mockReturnValue({ height: 100 });
    mockElement.scrollTop = 100;
    mockElement.getElementsByClassName = jest.fn().mockReturnValue([mockElement]);
    docSpy.mockReturnValue(mockElement);
    wrapper.vm.scrollToTop();
    expect(mockElement.scrollTop).toBe(0);
  });

  it("can scroll to top ___ container fail", () => {
    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = jest.fn().mockReturnValue({ height: 100 });
    mockElement.scrollTop = 100;
    mockElement.getElementsByClassName = jest.fn().mockReturnValue([undefined]);
    docSpy.mockReturnValue(undefined);
    wrapper.vm.scrollToTop();
    expect(mockElement.scrollTop).toBe(100);
  });

  it("can wrap copyConceptToClipboard", () => {
    const testData = {
      name: "Scoliosis deformity of spine",
      iri: "http://snomed.info/sct#298382003",
      code: "298382003",
      description: "Scoliosis deformity of spine (disorder)",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
      entityType: [
        { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
        { name: "Concept", "@id": "http://endhealth.info/im#Concept" }
      ],
      isDescendentOf: [],
      weighting: 2,
      match: "Scoliosis"
    };
    expect(wrapper.vm.copyConceptToClipboardVueWrapper(testData)).toStrictEqual(
      "name: Scoliosis deformity of spine,\niri: http://snomed.info/sct#298382003,\ncode: 298382003,\ndescription: Scoliosis deformity of spine (disorder),\nstatus: Active,\nscheme: Snomed-CT namespace,\nentityType: [\n\tAddress (record type),\n\tConcept\n]"
    );
  });

  it("can hideOverlay", () => {
    wrapper.vm.hideOverlay();
    expect(mockRef.methods.hide).toHaveBeenCalledTimes(1);
  });

  it("can showOverlay", () => {
    const DATA = {
      name: "Acquired scoliosis",
      iri: "http://snomed.info/sct#111266001",
      code: "111266001",
      description: "Acquired scoliosis (disorder)",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
      entityType: [
        { name: "Ontological Concept", "@id": "http://endhealth.info/im#Concept" },
        { name: "Organisation  (record type)", "@id": "http://endhealth.info/im#Organisation" }
      ],
      isDescendentOf: [],
      weighting: 11,
      match: "Acquired scoliosis"
    };
    wrapper.vm.setCopyMenuItems = jest.fn();
    wrapper.vm.showOverlay({ target: "testTarget" }, DATA);
    expect(wrapper.vm.hoveredResult).toStrictEqual(DATA);
    expect(wrapper.vm.setCopyMenuItems).toHaveBeenCalledTimes(1);
    expect(mockRef.methods.show).toHaveBeenCalledTimes(1);
    expect(mockRef.methods.show).toHaveBeenCalledWith({ target: "testTarget" }, "testTarget");
  });

  it("can show onCopyRightClick", () => {
    wrapper.vm.onCopyRightClick("testEvent");
    expect(mockRef.methods.show).toHaveBeenCalledTimes(1);
    expect(mockRef.methods.show).toHaveBeenCalledWith("testEvent");
  });
});
