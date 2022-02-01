import { flushPromises, shallowMount } from "@vue/test-utils";
import SidebarControl from "@/components/home/SidebarControl.vue";
import InputText from "primevue/inputtext";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import ProgressSpinner from "primevue/progressspinner";
import EntityService from "@/services/EntityService";
import ConfigService from "@/services/ConfigService";

describe("SidebarControl.vue", () => {
  let wrapper: any;
  let mockStore: any;
  let mockToast: any;
  jest.useFakeTimers();

  const CONFIG = {
    schemeOptions: ["http://endhealth.info/im#", "http://snomed.info/sct#"],
    statusOptions: ["http://endhealth.info/im#Active", "http://endhealth.info/im#Draft"],
    typeOptions: [
      "http://endhealth.info/im#Concept",
      "http://endhealth.info/im#ConceptSet",
      "http://endhealth.info/im#ConceptSetGroup",
      "http://endhealth.info/im#Folder",
      "http://www.w3.org/ns/shacl#NodeShape",
      "http://www.w3.org/2002/07/owl#ObjectProperty",
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property",
      "http://endhealth.info/im#QueryTemplate",
      "http://endhealth.info/im#ValueSet"
    ]
  };

  const NAMESPACES = [
    { iri: "http://endhealth.info/bc#", prefix: "bc", name: "Barts Cerner namespace" },
    { iri: "http://endhealth.info/ceg16#", prefix: "ceg13", name: "CEG ethnicity 16+ category" },
    { iri: "http://endhealth.info/im#", prefix: "im", name: "Discovery namespace" },
    { iri: "http://endhealth.info/emis#", prefix: "emis", name: "EMIS (inc. Read2 like) namespace" },
    { iri: "http://endhealth.info/icd10#", prefix: "icd10", name: "ICD10 namespace" },
    { iri: "http://endhealth.info/reports#", prefix: "reports", name: "IM internal reports" },
    { iri: "http://endhealth.info/kchapex#", prefix: "kchapex", name: "KCH Apex codes" },
    { iri: "http://endhealth.info/kchwinpath#", prefix: "kchwinpath", name: "KCH Winpath codes" },
    { iri: "http://endhealth.info/nhsethnic2001#", prefix: "nhse2001", name: "NHS Ethnicitity categories 2001 census" },
    { iri: "http://endhealth.info/ods#", prefix: "ods", name: "ODS code scheme" },
    { iri: "http://endhealth.info/opcs4#", prefix: "opcs4", name: "OPCS4 namespace" },
    { iri: "https://directory.spineservices.nhs.uk/STU3/CodeSystem/ODSAPI-OrganizationRole-1#", prefix: "orole", name: "OPS roles namespace" },
    { iri: "http://www.w3.org/2002/07/owl#", prefix: "owl", name: "OWL2 namespace" },
    { iri: "http://www.w3.org/ns/prov#", prefix: "prov", name: "PROV namespace" },
    { iri: "http://endhealth.info/prsb#", prefix: "prsb", name: "PRSB namespace" },
    { iri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#", prefix: "rdf", name: "RDF namespace" },
    { iri: "http://www.w3.org/2000/01/rdf-schema#", prefix: "rdfs", name: "RDFS namespace" },
    { iri: "http://www.w3.org/ns/shacl#", prefix: "sh", name: "SHACL namespace" },
    { iri: "http://snomed.info/sct#", prefix: "sn", name: "Snomed-CT namespace" },
    { iri: "http://endhealth.info/tpp#", prefix: "tpp", name: "TPP (inc.CTV3) namespace" },
    { iri: "http://endhealth.info/vision#", prefix: "vis", name: "Vision (incl. Read2) namespace" },
    { iri: "http://www.w3.org/2001/XMLSchema#", prefix: "xsd", name: "xsd namespace" }
  ];

  const STATUS = [
    {
      name: "Active",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://endhealth.info/im#Active"
    },
    {
      name: "Draft",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://endhealth.info/im#Draft"
    },
    {
      name: "Inactive",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://endhealth.info/im#Inactive"
    }
  ];

  const TYPES = [
    {
      name: "Concept",
      hasChildren: true,
      type: [
        { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
        { name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }
      ],
      "@id": "http://endhealth.info/im#Concept"
    },
    {
      name: "Concept Set",
      hasChildren: false,
      type: [
        { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
        { name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }
      ],
      "@id": "http://endhealth.info/im#ConceptSet"
    },
    {
      name: "Concept set group",
      hasChildren: false,
      type: [
        { name: "Organisation  (record type)", "@id": "http://endhealth.info/im#Organisation" },
        { name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }
      ],
      "@id": "http://endhealth.info/im#ConceptSetGroup"
    },
    {
      name: "Folder",
      hasChildren: false,
      type: [
        { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
        { name: "Concept", "@id": "http://endhealth.info/im#Concept" }
      ],
      "@id": "http://endhealth.info/im#Folder"
    },
    {
      name: "Node shape",
      hasChildren: false,
      type: [
        { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
        { name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }
      ],
      "@id": "http://www.w3.org/ns/shacl#NodeShape"
    },
    {
      name: "ObjectProperty",
      hasChildren: true,
      type: [
        { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
        { name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }
      ],
      "@id": "http://www.w3.org/2002/07/owl#ObjectProperty"
    },
    {
      name: "Property",
      hasChildren: true,
      type: [
        { name: "Organisation  (record type)", "@id": "http://endhealth.info/im#Organisation" },
        { name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }
      ],
      "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"
    },
    {
      name: "Query template",
      hasChildren: false,
      type: [
        { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
        { name: "Concept", "@id": "http://endhealth.info/im#Concept" }
      ],
      "@id": "http://endhealth.info/im#QueryTemplate"
    },
    {
      name: "Value set",
      hasChildren: false,
      type: [
        { name: "Concept", "@id": "http://endhealth.info/im#Concept" },
        { name: "Organisation  (record type)", "@id": "http://endhealth.info/im#Organisation" }
      ],
      "@id": "http://endhealth.info/im#ValueSet"
    }
  ];

  beforeEach(async () => {
    jest.clearAllMocks();
    mockStore = {
      state: {
        selectedFilters: {
          status: [
            {
              name: "Active",
              hasChildren: false,
              type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
              "@id": "http://endhealth.info/im#Active"
            },
            {
              name: "Draft",
              hasChildren: false,
              type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
              "@id": "http://endhealth.info/im#Draft"
            }
          ],
          schemes: [
            { iri: "http://endhealth.info/im#", prefix: "im", name: "Discovery namespace" },
            { iri: "http://snomed.info/sct#", prefix: "sn", name: "Snomed-CT namespace" }
          ],
          types: [
            { "@id": "http://www.w3.org/2002/07/owl#Class", name: "Class" },
            { "@id": "http://endhealth.info/im#Folder", name: "Folder" },
            { "@id": "http://www.w3.org/ns/shacl#NodeShape", name: "Node shape" },
            { "@id": "http://www.w3.org/2002/07/owl#ObjectProperty", name: "ObjectProperty" },
            { "@id": "http://endhealth.info/im#QueryTemplate", name: "Query template" },
            { "@id": "http://endhealth.info/im#RecordType", name: "Record type" },
            { "@id": "http://endhealth.info/im#ValueSet", name: "Value set" }
          ]
        },
        filterOptions: {
          status: STATUS,
          schemes: NAMESPACES,
          types: TYPES
        },
        focusHierarchy: false,
        sidebarControlActivePanel: 0,
        searchResults: []
      },
      commit: jest.fn(),
      dispatch: jest.fn().mockResolvedValue("true")
    };
    mockToast = {
      add: jest.fn()
    };

    ConfigService.getFilterDefaults = jest.fn().mockResolvedValue(CONFIG);

    EntityService.getNamespaces = jest.fn().mockResolvedValue(NAMESPACES);

    EntityService.getEntityChildren = jest
      .fn()
      .mockResolvedValueOnce(STATUS)
      .mockResolvedValueOnce(TYPES);

    wrapper = shallowMount(SidebarControl, {
      global: {
        components: { InputText, TabPanel, TabView, ProgressSpinner },
        mocks: { $store: mockStore, $toast: mockToast }
      },
      props: { focusHierarchy: false }
    });

    await flushPromises();
    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it("can init", async () => {
    wrapper.vm.filtersLoaded = false;
    wrapper.vm.getConfigs = jest.fn();
    wrapper.vm.setFilterOptions = jest.fn();
    wrapper.vm.setContainerHeights = jest.fn();
    wrapper.vm.init();
    await flushPromises();
    expect(wrapper.vm.getConfigs).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.setFilterOptions).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.setContainerHeights).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.filtersLoaded).toBe(true);
  });

  it("can getConfigs", async () => {
    wrapper.vm.getConfigs();
    await flushPromises();
    expect(ConfigService.getFilterDefaults).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateFilterDefaults", CONFIG);
  });

  it("can setFilterOptions", async () => {
    EntityService.getEntityChildren = jest
      .fn()
      .mockResolvedValueOnce(STATUS)
      .mockResolvedValueOnce(TYPES);
    wrapper.vm.setFilterOptions();
    await flushPromises();
    expect(EntityService.getNamespaces).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityChildren).toHaveBeenCalledTimes(2);
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateFilterOptions", { status: STATUS, schemes: NAMESPACES, types: TYPES });
  });

  it("can setFilterDefaults", async () => {
    wrapper.vm.setFilterDefaults();
    await flushPromises();
    expect(mockStore.commit).toHaveBeenCalledTimes(2);
    expect(mockStore.commit).toHaveBeenNthCalledWith(1, "updateSelectedFilters", {
      status: [
        {
          "@id": "http://endhealth.info/im#Active",
          hasChildren: false,
          name: "Active",
          type: [
            {
              "@id": "http://www.w3.org/2002/07/owl#Class",
              name: "Class"
            }
          ]
        },
        {
          "@id": "http://endhealth.info/im#Draft",
          hasChildren: false,
          name: "Draft",
          type: [
            {
              "@id": "http://www.w3.org/2002/07/owl#Class",
              name: "Class"
            }
          ]
        }
      ],
      schemes: [
        {
          iri: "http://endhealth.info/im#",
          name: "Discovery namespace",
          prefix: "im"
        },
        {
          iri: "http://snomed.info/sct#",
          name: "Snomed-CT namespace",
          prefix: "sn"
        }
      ],
      types: [
        {
          name: "Concept",
          hasChildren: true,
          type: [
            { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
            { name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }
          ],
          "@id": "http://endhealth.info/im#Concept"
        },
        {
          name: "Concept Set",
          hasChildren: false,
          type: [
            { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
            { name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }
          ],
          "@id": "http://endhealth.info/im#ConceptSet"
        },
        {
          name: "Concept set group",
          hasChildren: false,
          type: [
            { name: "Organisation  (record type)", "@id": "http://endhealth.info/im#Organisation" },
            { name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }
          ],
          "@id": "http://endhealth.info/im#ConceptSetGroup"
        },
        {
          name: "Folder",
          hasChildren: false,
          type: [
            { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
            { name: "Concept", "@id": "http://endhealth.info/im#Concept" }
          ],
          "@id": "http://endhealth.info/im#Folder"
        },
        {
          name: "Node shape",
          hasChildren: false,
          type: [
            { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
            { name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }
          ],
          "@id": "http://www.w3.org/ns/shacl#NodeShape"
        },
        {
          name: "ObjectProperty",
          hasChildren: true,
          type: [
            { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
            { name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }
          ],
          "@id": "http://www.w3.org/2002/07/owl#ObjectProperty"
        },
        {
          name: "Property",
          hasChildren: true,
          type: [
            { name: "Organisation  (record type)", "@id": "http://endhealth.info/im#Organisation" },
            { name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }
          ],
          "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"
        },
        {
          name: "Query template",
          hasChildren: false,
          type: [
            { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
            { name: "Concept", "@id": "http://endhealth.info/im#Concept" }
          ],
          "@id": "http://endhealth.info/im#QueryTemplate"
        },
        {
          name: "Value set",
          hasChildren: false,
          type: [
            { name: "Concept", "@id": "http://endhealth.info/im#Concept" },
            { name: "Organisation  (record type)", "@id": "http://endhealth.info/im#Organisation" }
          ],
          "@id": "http://endhealth.info/im#ValueSet"
        }
      ]
    });
    expect(mockStore.commit).toHaveBeenNthCalledWith(2, "updateHierarchySelectedFilters", [
      {
        iri: "http://endhealth.info/im#",
        name: "Discovery namespace",
        prefix: "im"
      },
      {
        iri: "http://snomed.info/sct#",
        name: "Snomed-CT namespace",
        prefix: "sn"
      }
    ]);
  });

  it("adds event listener to setsContainerHeights on resize", async () => {
    const spy1 = jest.spyOn(wrapper.vm, "setContainerHeights");
    window.dispatchEvent(new Event("resize"));
    await wrapper.vm.$nextTick();
    expect(spy1).toHaveBeenCalledTimes(1);
    spy1.mockReset();
  });

  it("can update on focusHierarchy ___ true", async () => {
    wrapper.vm.$options.watch.focusHierarchy.call(wrapper.vm, true);
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).toHaveBeenCalledWith("updateFocusHierarchy", false);
  });

  it("can update on focusHierarchy ___ false", async () => {
    wrapper.vm.$options.watch.focusHierarchy.call(wrapper.vm, false);
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).not.toHaveBeenCalled();
  });

  it("can update active on sidebarControlActivePanel change", async () => {
    wrapper.vm.$options.watch.sidebarControlActivePanel.call(wrapper.vm, 3);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.active).toBe(3);
  });

  it("can tabChange", () => {
    wrapper.vm.tabChange({ index: 4 });
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateSidebarControlActivePanel", 4);
  });

  it("cancels existing requests on new search", async () => {
    wrapper.vm.searchTerm = "sco";
    wrapper.vm.search();
    await wrapper.vm.$nextTick();
    const spy = jest.spyOn(wrapper.vm.request, "cancel");
    wrapper.vm.searchTerm = "pul";
    wrapper.vm.search();
    await wrapper.vm.$nextTick();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockReset();
  });

  it("updated loading on dispatch success", async () => {
    wrapper.vm.searchTerm = "sco";
    wrapper.vm.search();
    expect(wrapper.vm.loading).toBe(true);
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(mockStore.dispatch).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.loading).toBe(false);
  });

  it("debounces", async () => {
    const spy = jest.spyOn(wrapper.vm, "search");
    wrapper.vm.debounceForSearch();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.debounce).toBeGreaterThan(0);
    expect(spy).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("sets container size", async () => {
    let docSpy: any;
    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = jest.fn().mockReturnValue({ height: 100 });
    mockElement.getElementsByClassName = jest.fn().mockReturnValue([undefined]);
    docSpy = jest.spyOn(document, "getElementById");
    docSpy.mockReturnValue(mockElement);
    wrapper.vm.setContainerHeights();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.sideMenuHeight).not.toBe("");
  });

  it("can remove eventListener", () => {
    const spy = jest.spyOn(global, "removeEventListener");
    wrapper.unmount();
    expect(spy).toHaveBeenCalled();
    spy.mockReset();
  });
});
