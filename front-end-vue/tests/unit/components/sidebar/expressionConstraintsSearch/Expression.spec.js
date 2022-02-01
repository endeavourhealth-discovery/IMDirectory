import Expression from "@/components/sidebar/expressionConstraintsSearch/Expression.vue";
import { flushPromises, shallowMount } from "@vue/test-utils";
import InputText from "primevue/inputtext";
import OverlayPanel from "primevue/overlaypanel";
import EntityService from "@/services/EntityService";
import axios from "axios";
import { ECLType } from "@/models/expressionConstraintsLanguage/ECLType";
import { ECLComponent } from "@/models/expressionConstraintsLanguage/ECLComponent";

const FILTER_OPTIONS = {
  status: [
    {
      name: "Active",
      hasChildren: false,
      type: [
        { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
        { name: "Concept", "@id": "http://endhealth.info/im#Concept" }
      ],
      "@id": "http://endhealth.info/im#Active"
    },
    {
      name: "Draft",
      hasChildren: false,
      type: [
        { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
        { name: "Concept", "@id": "http://endhealth.info/im#Concept" }
      ],
      "@id": "http://endhealth.info/im#Draft"
    },
    {
      name: "Inactive",
      hasChildren: false,
      type: [
        { name: "Concept", "@id": "http://endhealth.info/im#Concept" },
        { name: "Organisation  (record type)", "@id": "http://endhealth.info/im#Organisation" }
      ],
      "@id": "http://endhealth.info/im#Inactive"
    }
  ],
  scheme: [
    { iri: "http://endhealth.info/bc#", prefix: "bc", name: "Barts Cerner namespace" },
    { iri: "http://endhealth.info/ceg16#", prefix: "ceg13", name: "CEG ethnicity 16+ category" },
    { iri: "http://endhealth.info/im#", prefix: "im", name: "Discovery namespace" },
    { iri: "http://endhealth.info/imq#", prefix: "imq", name: "Discovery query namespace" },
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
  ],
  type: [
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
};

const SELECTED_FILTERS = {
  status: [
    {
      name: "Active",
      hasChildren: false,
      type: [
        { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
        { name: "Concept", "@id": "http://endhealth.info/im#Concept" }
      ],
      "@id": "http://endhealth.info/im#Active"
    },
    {
      name: "Draft",
      hasChildren: false,
      type: [
        { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
        { name: "Concept", "@id": "http://endhealth.info/im#Concept" }
      ],
      "@id": "http://endhealth.info/im#Draft"
    }
  ],
  schemes: [
    { iri: "http://endhealth.info/im#", prefix: "im", name: "Discovery namespace" },
    { iri: "http://snomed.info/sct#", prefix: "sn", name: "Snomed-CT namespace" }
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
};

describe("Expression.vue ___ value", () => {
  let wrapper;
  let mockStore;
  let mockRef;

  const EXPRESSION = {
    code: "",
    name: "ANY",
    iri: "",
    isDescendentOf: [],
    weighting: 0,
    scheme: {},
    status: {},
    match: "ANY",
    entityType: [{ "@id": "http://endhealth.info/im#Concept", name: "Concept" }]
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.useFakeTimers();

    EntityService.advancedSearch = jest.fn().mockResolvedValue([
      {
        iri: "http://snomed.info/sct#29741004",
        name: "Treponema scoliodontum",
        code: "29741004",
        scheme: {
          name: "Snomed-CT",
          "@id": "http://snomed.info/sct#"
        },
        entityType: [
          {
            name: "Address (record type)",
            "@id": "http://endhealth.info/im#Address"
          },
          {
            name: "Ontological Concept",
            "@id": "http://endhealth.info/im#Concept"
          }
        ],
        status: {
          name: "Active",
          "@id": "http://endhealth.info/im#Active"
        }
      },
      {
        iri: "http://snomed.info/sct#54914001",
        name: "Scoliotic pelvis",
        code: "54914001",
        scheme: {
          name: "Snomed-CT",
          "@id": "http://snomed.info/sct#"
        },
        entityType: [
          {
            name: "Ontological Concept",
            "@id": "http://endhealth.info/im#Concept"
          },
          {
            name: "Organisation  (record type)",
            "@id": "http://endhealth.info/im#Organisation"
          }
        ],
        status: {
          name: "Active",
          "@id": "http://endhealth.info/im#Active"
        }
      }
    ]);

    mockStore = { commit: jest.fn(), state: { filterOptions: FILTER_OPTIONS, selectedFilters: SELECTED_FILTERS } };

    mockRef = { render: () => {}, methods: { hide: jest.fn(), show: jest.fn() } };

    wrapper = shallowMount(Expression, {
      props: { id: "focusConcept_0expression", position: 1, value: EXPRESSION },
      global: { components: { InputText, OverlayPanel }, stubs: { OverlayPanel: mockRef }, mocks: { $store: mockStore } }
    });

    jest.clearAllMocks();
    await flushPromises();
    await wrapper.vm.$nextTick();
  });

  it("mounts", () => {
    expect(wrapper.vm.id).toBe("focusConcept_0expression");
    expect(wrapper.vm.position).toBe(1);
    expect(wrapper.vm.value).toStrictEqual(EXPRESSION);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.debounce).toBe(0);
    expect(wrapper.vm.selectedResult).toStrictEqual({
      code: "",
      entityType: [
        {
          "@id": "http://endhealth.info/im#Concept",
          name: "Concept"
        }
      ],
      iri: "",
      isDescendentOf: [],
      match: "ANY",
      name: "ANY",
      scheme: {},
      status: {},
      weighting: 0
    });
    expect(wrapper.vm.request).toStrictEqual({});
    expect(wrapper.vm.anyModel).toStrictEqual(EXPRESSION);
    expect(wrapper.vm.searchTerm).toBe("ANY");
    expect(wrapper.vm.searchResults).toStrictEqual([]);
  });

  // it("debounces for search", async () => {
  //   const spy = jest.spyOn(wrapper.vm, "search");
  //   wrapper.vm.debounceForSearch();
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.vm.debounce).toBeGreaterThan(0);
  //   expect(spy).not.toHaveBeenCalled();
  //   jest.runAllTimers();
  //   expect(spy).toHaveBeenCalledTimes(1);
  // });

  // it("can checkKey ___ enter", () => {
  //   wrapper.vm.search = jest.fn();
  //   wrapper.vm.checkKey({ code: "Enter" });
  //   expect(wrapper.vm.search).toHaveBeenCalled();
  // });

  // it("can checkKey ___ other", () => {
  //   wrapper.vm.search = jest.fn();
  //   wrapper.vm.checkKey({ code: "Space" });
  //   expect(wrapper.vm.search).not.toHaveBeenCalled();
  // });

  it("can search ___ ANY", () => {
    wrapper.vm.fetchSearchResults = jest.fn();
    wrapper.vm.searchTerm = "ANY";
    wrapper.vm.search();
    expect(wrapper.vm.searchResults).toStrictEqual([
      {
        code: "",
        entityType: [
          {
            "@id": "http://endhealth.info/im#Concept",
            name: "Concept"
          }
        ],
        iri: "",
        isDescendentOf: [],
        match: "ANY",
        name: "ANY",
        scheme: {},
        status: {},
        weighting: 0
      }
    ]);
    expect(wrapper.vm.fetchSearchResults).not.toHaveBeenCalled();
  });

  it("searches when not empty ___ 0", async () => {
    wrapper.vm.fetchSearchResults = jest.fn();
    wrapper.vm.searchTerm = "";
    wrapper.vm.search();
    expect(wrapper.vm.loading).toBe(false);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.fetchSearchResults).not.toHaveBeenCalled();
  });

  it("searches when not empty ___ 3", async () => {
    const axiosSource = axios.CancelToken.source();
    wrapper.vm.fetchSearchResults = jest.fn();
    wrapper.vm.searchTerm = "sco";
    wrapper.vm.search();
    expect(wrapper.vm.loading).toBe(true);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.fetchSearchResults).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.fetchSearchResults).toHaveBeenCalledWith(
      {
        descendentFilter: undefined,
        markIfDescendentOf: undefined,
        page: 1,
        schemeFilter: ["http://endhealth.info/im#", "http://snomed.info/sct#"],
        size: 100,
        sortBy: 0,
        statusFilter: ["http://endhealth.info/im#Active", "http://endhealth.info/im#Draft"],
        termFilter: "sco",
        typeFilter: [
          "http://endhealth.info/im#Concept",
          "http://endhealth.info/im#ConceptSet",
          "http://endhealth.info/im#Folder",
          "http://www.w3.org/ns/shacl#NodeShape",
          "http://www.w3.org/2002/07/owl#ObjectProperty",
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property",
          "http://endhealth.info/im#QueryTemplate",
          "http://endhealth.info/im#ValueSet"
        ]
      },
      axiosSource.token
    );
    await flushPromises();
    expect(wrapper.vm.loading).toBe(false);
  });

  it("can cancel existing request", () => {
    wrapper.vm.request = { cancel: jest.fn(), msg: "testMsg" };
    wrapper.vm.fetchSearchResults = jest.fn();
    wrapper.vm.searchTerm = "sco";
    wrapper.vm.search();
    expect(wrapper.vm.request.cancel).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.request.cancel).toHaveBeenCalledWith({ status: 499, message: "Search cancelled by user" });
  });

  it("can fetchSearchResults ___ success", async () => {
    const axiosSource = axios.CancelToken.source();
    wrapper.vm.fetchSearchResults(
      {
        descendentFilter: undefined,
        markIfDescendentOf: undefined,
        page: 1,
        schemeFilter: ["http://endhealth.info/im#", "http://snomed.info/sct#"],
        size: 100,
        sortBy: 0,
        statusFilter: ["http://endhealth.info/im#Active", "http://endhealth.info/im#Draft"],
        termFilter: "sco",
        typeFilter: [
          "http://endhealth.info/im#Concept",
          "http://endhealth.info/im#ConceptSet",
          "http://endhealth.info/im#Folder",
          "http://www.w3.org/ns/shacl#NodeShape",
          "http://www.w3.org/2002/07/owl#ObjectProperty",
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property",
          "http://endhealth.info/im#QueryTemplate",
          "http://endhealth.info/im#ValueSet"
        ]
      },
      axiosSource.token
    );
    await flushPromises();
    expect(wrapper.vm.searchResults).toStrictEqual([
      {
        iri: "http://snomed.info/sct#29741004",
        name: "Treponema scoliodontum",
        code: "29741004",
        scheme: {
          name: "Snomed-CT",
          "@id": "http://snomed.info/sct#"
        },
        entityType: [
          {
            name: "Address (record type)",
            "@id": "http://endhealth.info/im#Address"
          },
          {
            name: "Ontological Concept",
            "@id": "http://endhealth.info/im#Concept"
          }
        ],
        status: {
          name: "Active",
          "@id": "http://endhealth.info/im#Active"
        }
      },
      {
        iri: "http://snomed.info/sct#54914001",
        name: "Scoliotic pelvis",
        code: "54914001",
        scheme: {
          name: "Snomed-CT",
          "@id": "http://snomed.info/sct#"
        },
        entityType: [
          {
            name: "Ontological Concept",
            "@id": "http://endhealth.info/im#Concept"
          },
          {
            name: "Organisation  (record type)",
            "@id": "http://endhealth.info/im#Organisation"
          }
        ],
        status: {
          name: "Active",
          "@id": "http://endhealth.info/im#Active"
        }
      }
    ]);
  });

  it("can fetchSearchResults ___ success", async () => {
    EntityService.advancedSearch = jest.fn().mockResolvedValue({});
    const axiosSource = axios.CancelToken.source();
    wrapper.vm.fetchSearchResults(
      {
        descendentFilter: undefined,
        markIfDescendentOf: undefined,
        page: 1,
        schemeFilter: ["http://endhealth.info/im#", "http://snomed.info/sct#"],
        size: 100,
        sortBy: 0,
        statusFilter: ["http://endhealth.info/im#Active", "http://endhealth.info/im#Draft"],
        termFilter: "sco",
        typeFilter: [
          "http://endhealth.info/im#Concept",
          "http://endhealth.info/im#ConceptSet",
          "http://endhealth.info/im#Folder",
          "http://www.w3.org/ns/shacl#NodeShape",
          "http://www.w3.org/2002/07/owl#ObjectProperty",
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property",
          "http://endhealth.info/im#QueryTemplate",
          "http://endhealth.info/im#ValueSet"
        ]
      },
      axiosSource.token
    );
    await flushPromises();
    expect(wrapper.vm.searchResults).toStrictEqual([]);
  });

  it("can hideOverlay", () => {
    wrapper.vm.hideOverlay();
    expect(mockRef.methods.hide).toHaveBeenCalledTimes(1);
  });

  it("can showOverlay", () => {
    wrapper.vm.showOverlay({ target: "testTarget" });
    expect(mockRef.methods.show).toHaveBeenCalledTimes(1);
    expect(mockRef.methods.show).toHaveBeenCalledWith({ target: "testTarget" }, "testTarget");
  });

  it("can updateSelectedResult", async () => {
    wrapper.vm.createExpression = jest.fn().mockReturnValue({
      value: {
        name: "Acquired scoliosis",
        iri: "http://snomed.info/sct#111266001",
        code: "111266001",
        description: "Acquired scoliosis (disorder)",
        status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
        scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
        entityType: [
          { name: "Concept", "@id": "http://endhealth.info/im#Concept" },
          { name: "Organisation  (record type)", "@id": "http://endhealth.info/im#Organisation" }
        ],
        isDescendentOf: [],
        weighting: 11,
        match: "Acquired scoliosis"
      },
      id: "focusConcept_0expression",
      position: 1,
      type: ECLType.EXPRESSION,
      label: "testLabel",
      component: ECLComponent.EXPRESSION
    });
    wrapper.vm.hideOverlay = jest.fn();
    expect(wrapper.vm.selectedResult).toStrictEqual({
      code: "",
      entityType: [
        {
          "@id": "http://endhealth.info/im#Concept",
          name: "Concept"
        }
      ],
      iri: "",
      isDescendentOf: [],
      match: "ANY",
      name: "ANY",
      scheme: {},
      status: {},
      weighting: 0
    });
    expect(wrapper.vm.searchTerm).toBe("ANY");
    wrapper.vm.updateSelectedResult({
      name: "Acquired scoliosis",
      iri: "http://snomed.info/sct#111266001",
      code: "111266001",
      description: "Acquired scoliosis (disorder)",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
      entityType: [
        { name: "Concept", "@id": "http://endhealth.info/im#Concept" },
        { name: "Organisation  (record type)", "@id": "http://endhealth.info/im#Organisation" }
      ],
      isDescendentOf: [],
      weighting: 11,
      match: "Acquired scoliosis"
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.selectedResult).toStrictEqual({
      name: "Acquired scoliosis",
      iri: "http://snomed.info/sct#111266001",
      code: "111266001",
      description: "Acquired scoliosis (disorder)",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
      entityType: [
        { name: "Concept", "@id": "http://endhealth.info/im#Concept" },
        { name: "Organisation  (record type)", "@id": "http://endhealth.info/im#Organisation" }
      ],
      isDescendentOf: [],
      weighting: 11,
      match: "Acquired scoliosis"
    });
    expect(wrapper.vm.searchTerm).toBe("Acquired scoliosis");
    expect(wrapper.emitted().updateClicked).toBeTruthy();
    expect(wrapper.emitted().updateClicked[1]).toStrictEqual([
      {
        value: {
          name: "Acquired scoliosis",
          iri: "http://snomed.info/sct#111266001",
          code: "111266001",
          description: "Acquired scoliosis (disorder)",
          status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
          scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
          entityType: [
            { name: "Concept", "@id": "http://endhealth.info/im#Concept" },
            { name: "Organisation  (record type)", "@id": "http://endhealth.info/im#Organisation" }
          ],
          isDescendentOf: [],
          weighting: 11,
          match: "Acquired scoliosis"
        },
        id: "focusConcept_0expression",
        position: 1,
        type: ECLType.EXPRESSION,
        label: "testLabel",
        component: ECLComponent.EXPRESSION
      }
    ]);
    expect(wrapper.vm.hideOverlay).toHaveBeenCalledTimes(1);
  });

  it("can handle editClicked", () => {
    wrapper.vm.showOverlay = jest.fn();
    wrapper.vm.editClicked("testEvent");
    expect(wrapper.vm.showOverlay).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.showOverlay).toHaveBeenCalledWith("testEvent");
  });

  it("can createExpression ___ any", () => {
    expect(wrapper.vm.createExpression()).toStrictEqual({
      component: "Expression",
      id: "focusConcept_0expression",
      label: "*",
      position: 1,
      type: "expression",
      value: {
        code: "",
        entityType: [
          {
            "@id": "http://endhealth.info/im#Concept",
            name: "Concept"
          }
        ],
        iri: "",
        isDescendentOf: [],
        match: "ANY",
        name: "ANY",
        scheme: {},
        status: {},
        weighting: 0
      }
    });
  });

  it("can createExpression ___ result", () => {
    wrapper.vm.selectedResult = {
      name: "Acquired scoliosis",
      iri: "http://snomed.info/sct#111266001",
      code: "111266001",
      description: "Acquired scoliosis (disorder)",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
      entityType: [
        { name: "Concept", "@id": "http://endhealth.info/im#Concept" },
        { name: "Organisation  (record type)", "@id": "http://endhealth.info/im#Organisation" }
      ],
      isDescendentOf: [],
      weighting: 11,
      match: "Acquired scoliosis"
    };
    expect(wrapper.vm.createExpression()).toStrictEqual({
      component: "Expression",
      id: "focusConcept_0expression",
      label: "111266001 |Acquired scoliosis|",
      position: 1,
      type: "expression",
      value: {
        code: "111266001",
        description: "Acquired scoliosis (disorder)",
        entityType: [
          {
            "@id": "http://endhealth.info/im#Concept",
            name: "Concept"
          },
          {
            "@id": "http://endhealth.info/im#Organisation",
            name: "Organisation  (record type)"
          }
        ],
        iri: "http://snomed.info/sct#111266001",
        isDescendentOf: [],
        match: "Acquired scoliosis",
        name: "Acquired scoliosis",
        scheme: {
          "@id": "http://snomed.info/sct#",
          name: "Snomed-CT namespace"
        },
        status: {
          "@id": "http://endhealth.info/im#Active",
          name: "Active"
        },
        weighting: 11
      }
    });
  });
});

describe("Expression.vue ___ no value", () => {
  let wrapper;
  let mockStore;
  let mockRef;

  const EXPRESSION = {
    code: "",
    name: "ANY",
    iri: "",
    isDescendentOf: [],
    weighting: 0,
    scheme: {},
    status: {},
    match: "ANY",
    entityType: [{ "@id": "http://endhealth.info/im#Concept", name: "Concept" }]
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    EntityService.advancedSearch = jest.fn().mockResolvedValue([
      {
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
      },
      {
        name: "Acquired scoliosis",
        iri: "http://snomed.info/sct#111266001",
        code: "111266001",
        description: "Acquired scoliosis (disorder)",
        status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
        scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
        entityType: [
          { name: "Concept", "@id": "http://endhealth.info/im#Concept" },
          { name: "Organisation  (record type)", "@id": "http://endhealth.info/im#Organisation" }
        ],
        isDescendentOf: [],
        weighting: 11,
        match: "Acquired scoliosis"
      }
    ]);

    mockStore = { commit: jest.fn(), state: { filterOptions: FILTER_OPTIONS, selectedFilters: SELECTED_FILTERS } };

    mockRef = { render: () => {}, methods: { hide: jest.fn(), show: jest.fn() } };

    wrapper = shallowMount(Expression, {
      props: { id: "focusConcept_0expression", position: 1, value: {} },
      global: { components: { InputText, OverlayPanel }, stubs: { OverlayPanel: mockRef }, mocks: { $store: mockStore } }
    });

    await flushPromises();
    await wrapper.vm.$nextTick();
  });

  it("mounts", () => {
    expect(wrapper.vm.id).toBe("focusConcept_0expression");
    expect(wrapper.vm.position).toBe(1);
    expect(wrapper.vm.value).toStrictEqual({});
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.debounce).toBe(0);
    expect(wrapper.vm.selectedResult).toStrictEqual({
      code: "",
      entityType: [
        {
          "@id": "http://endhealth.info/im#Concept",
          name: "Concept"
        }
      ],
      iri: "",
      isDescendentOf: [],
      match: "ANY",
      name: "ANY",
      scheme: {},
      status: {},
      weighting: 0
    });
    expect(wrapper.vm.request).toStrictEqual({});
    expect(wrapper.vm.anyModel).toStrictEqual(EXPRESSION);
    expect(wrapper.vm.searchTerm).toBe("ANY");
    expect(wrapper.vm.searchResults).toStrictEqual([]);
  });
});
