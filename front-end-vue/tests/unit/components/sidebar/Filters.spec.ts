import { flushPromises, shallowMount } from "@vue/test-utils";
import Filters from "@/components/sidebar/Filters.vue";
import MultiSelect from "primevue/multiselect";
import InputSwitch from "primevue/inputswitch";
import Tooltip from "primevue/tooltip";
import Button from "primevue/button";

describe("Filters.vue ___ empty store", () => {
  let wrapper: any;
  let mockStore: any;
  let mockToast: any;

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
    mockStore = {
      state: {
        selectedFilters: {
          status: [],
          schemes: [],
          types: []
        },
        filterOptions: {
          status: STATUS,
          schemes: NAMESPACES,
          types: TYPES
        },
        quickFiltersStatus: {
          includeLegacy: false
        },
        filterDefaults: CONFIG
      },
      commit: jest.fn()
    };

    mockToast = { add: jest.fn() };

    const warn = console.warn;
    console.warn = jest.fn();

    wrapper = shallowMount(Filters, {
      props: { search: jest.fn() },
      global: {
        components: { MultiSelect, InputSwitch, Button },
        directives: { Tooltip: Tooltip },
        mocks: { $store: mockStore, $toast: mockToast }
      }
    });

    console.warn = warn;

    await flushPromises();
    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });
  it("sets data on mount", () => {
    expect(wrapper.vm.selectedStatus).toStrictEqual([
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
    ]);
    expect(wrapper.vm.selectedSchemes).toStrictEqual([
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
    expect(wrapper.vm.selectedTypes).toStrictEqual([
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
    ]);
    expect(wrapper.vm.includeLegacy).toBe(false);
  });

  it("can check for search", () => {
    wrapper.vm.checkForSearch();
    expect(wrapper.vm.search).toHaveBeenCalled();
  });

  it("calls setLegacy on includeLegacy change", () => {
    wrapper.vm.setLegacy = jest.fn();
    wrapper.vm.$options.watch.includeLegacy.call(wrapper.vm, true);
    expect(wrapper.vm.setLegacy).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.setLegacy).toHaveBeenCalledWith(true);
  });

  it("calls updateStoreSelectedFilters on selectedStatus change", () => {
    wrapper.vm.updateStoreSelectedFilters = jest.fn();
    wrapper.vm.$options.watch.selectedStatus.call(wrapper.vm, [true]);
    expect(wrapper.vm.updateStoreSelectedFilters).toHaveBeenCalledTimes(1);
  });

  it("calls updateStoreSelectedFilters on selectedSchemes change", () => {
    wrapper.vm.updateStoreSelectedFilters = jest.fn();
    wrapper.vm.$options.watch.selectedSchemes.call(wrapper.vm, [true]);
    expect(wrapper.vm.updateStoreSelectedFilters).toHaveBeenCalledTimes(1);
  });

  it("calls updateStoreSelectedFilters on selectedTypes change", () => {
    wrapper.vm.updateStoreSelectedFilters = jest.fn();
    wrapper.vm.$options.watch.selectedTypes.call(wrapper.vm, [true]);
    expect(wrapper.vm.updateStoreSelectedFilters).toHaveBeenCalledTimes(1);
  });

  it("can set defaults", () => {
    wrapper.vm.selectedStatus = [];
    wrapper.vm.selectedSchemes = [];
    wrapper.vm.selectedTypes = [];
    wrapper.vm.setDefaults();
    expect(wrapper.vm.selectedStatus).toStrictEqual([
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
    ]);
    expect(wrapper.vm.selectedSchemes).toStrictEqual([
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
    expect(wrapper.vm.selectedTypes).toStrictEqual([
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
    ]);
  });

  it("can updateStoreSelectedFilters", () => {
    wrapper.vm.updateStoreSelectedFilters();
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateSelectedFilters", {
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
  });

  it("can setLegacy ___ false ___ no emis", () => {
    wrapper.vm.setLegacy(false);
    expect(wrapper.vm.selectedSchemes).toStrictEqual([
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
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateQuickFiltersStatus", { key: "includeLegacy", value: false });
  });

  it("can setLegacy ___ false ___ emis", () => {
    wrapper.vm.selectedSchemes = [
      {
        iri: "http://endhealth.info/im#",
        name: "Discovery namespace",
        prefix: "im"
      },
      {
        iri: "http://snomed.info/sct#",
        name: "Snomed-CT namespace",
        prefix: "sn"
      },
      {
        iri: "http://endhealth.info/emis#",
        name: "EMIS (inc. Read2 like) namespace",
        prefix: "emis"
      }
    ];
    wrapper.vm.setLegacy(false);
    expect(wrapper.vm.selectedSchemes).toStrictEqual([
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
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateQuickFiltersStatus", { key: "includeLegacy", value: false });
  });

  it("can setLegacy ___ true ___ no emis", () => {
    wrapper.vm.setLegacy(true);
    expect(wrapper.vm.selectedSchemes).toStrictEqual([
      {
        iri: "http://endhealth.info/im#",
        name: "Discovery namespace",
        prefix: "im"
      },
      {
        iri: "http://snomed.info/sct#",
        name: "Snomed-CT namespace",
        prefix: "sn"
      },
      {
        iri: "http://endhealth.info/emis#",
        name: "EMIS (inc. Read2 like) namespace",
        prefix: "emis"
      }
    ]);
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateQuickFiltersStatus", { key: "includeLegacy", value: true });
  });

  it("can setLegacy ___ true ___ emis", () => {
    wrapper.vm.selectedSchemes = [
      {
        iri: "http://endhealth.info/im#",
        name: "Discovery namespace",
        prefix: "im"
      },
      {
        iri: "http://snomed.info/sct#",
        name: "Snomed-CT namespace",
        prefix: "sn"
      },
      {
        iri: "http://endhealth.info/emis#",
        name: "EMIS (inc. Read2 like) namespace",
        prefix: "emis"
      }
    ];
    wrapper.vm.setLegacy(true);
    expect(wrapper.vm.selectedSchemes).toStrictEqual([
      {
        iri: "http://endhealth.info/im#",
        name: "Discovery namespace",
        prefix: "im"
      },
      {
        iri: "http://snomed.info/sct#",
        name: "Snomed-CT namespace",
        prefix: "sn"
      },
      {
        iri: "http://endhealth.info/emis#",
        name: "EMIS (inc. Read2 like) namespace",
        prefix: "emis"
      }
    ]);
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateQuickFiltersStatus", { key: "includeLegacy", value: true });
  });
});

describe("Filters.vue ___ full store", () => {
  let wrapper: any;
  let mockStore: any;
  let mockToast: any;

  const CONFIG = {
    schemeOptions: ["Discovery namespace", "Snomed-CT namespace"],
    statusOptions: ["Active", "Draft"],
    typeOptions: ["Class", "Concept Set", "Folder", "Node shape", "ObjectProperty", "Property", "Query template", "Record type", "Value set"]
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

  beforeEach(async () => {
    mockStore = {
      state: {
        selectedFilters: {
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
            }
          ],
          schemes: [
            {
              iri: "http://endhealth.info/im#",
              name: "Discovery namespace",
              prefix: "im"
            }
          ],
          types: [
            {
              "@id": "http://endhealth.info/im#ConceptSet",
              hasChildren: false,
              name: "Concept Set",
              type: [
                {
                  "@id": "http://www.w3.org/2002/07/owl#Class",
                  name: "Class"
                }
              ]
            }
          ]
        },
        filterOptions: {
          status: STATUS,
          schemes: NAMESPACES,
          types: TYPES
        },
        quickFiltersStatus: { includeLegacy: true },
        filterDefaults: CONFIG
      },
      commit: jest.fn()
    };

    mockToast = { add: jest.fn() };

    const warn = console.warn;
    console.warn = jest.fn();

    wrapper = shallowMount(Filters, {
      props: { search: jest.fn() },
      global: {
        components: { MultiSelect, InputSwitch, Button },
        directives: { Tooltip: Tooltip },
        mocks: { $store: mockStore, $toast: mockToast }
      }
    });

    console.warn = warn;

    await flushPromises();
    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  it("can set defaults ___ existing filters", async () => {
    mockStore.state.selectedFilters.schemes = [
      {
        iri: "http://endhealth.info/im#",
        name: "Discovery namespace",
        prefix: "im"
      }
    ];
    wrapper.vm.setLegacy = jest.fn();
    wrapper.vm.selectedStatus = [];
    wrapper.vm.selectedSchemes = [];
    wrapper.vm.selectedTypes = [];
    wrapper.vm.includeLegacy = false;
    await wrapper.vm.$nextTick();
    wrapper.vm.setDefaults();
    expect(wrapper.vm.selectedStatus).toStrictEqual([
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
      }
    ]);
    expect(wrapper.vm.selectedSchemes).toStrictEqual([
      {
        iri: "http://endhealth.info/im#",
        name: "Discovery namespace",
        prefix: "im"
      }
    ]);
    expect(wrapper.vm.selectedTypes).toStrictEqual([
      {
        "@id": "http://endhealth.info/im#ConceptSet",
        hasChildren: false,
        name: "Concept Set",
        type: [
          {
            "@id": "http://www.w3.org/2002/07/owl#Class",
            name: "Class"
          }
        ]
      }
    ]);
    expect(wrapper.vm.includeLegacy).toBe(true);
  });
});

describe("Filters.vue ___ no emis in options", () => {
  let wrapper: any;
  let mockStore: any;
  let mockToast: any;

  const CONFIG = {
    schemeOptions: ["Discovery namespace", "Snomed-CT namespace"],
    statusOptions: ["Active", "Draft"],
    typeOptions: ["Class", "Concept Set", "Folder", "Node shape", "ObjectProperty", "Property", "Query template", "Record type", "Value set"]
  };

  const NAMESPACES = [
    { iri: "http://endhealth.info/bc#", prefix: "bc", name: "Barts Cerner namespace" },
    { iri: "http://endhealth.info/ceg16#", prefix: "ceg13", name: "CEG ethnicity 16+ category" },
    { iri: "http://endhealth.info/im#", prefix: "im", name: "Discovery namespace" },
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

  beforeEach(async () => {
    mockStore = {
      state: {
        selectedFilters: {
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
            }
          ],
          schemes: [
            {
              iri: "http://endhealth.info/im#",
              name: "Discovery namespace",
              prefix: "im"
            }
          ],
          types: [
            {
              "@id": "http://endhealth.info/im#ConceptSet",
              hasChildren: false,
              name: "Concept Set",
              type: [
                {
                  "@id": "http://www.w3.org/2002/07/owl#Class",
                  name: "Class"
                }
              ]
            }
          ]
        },
        filterOptions: {
          status: STATUS,
          schemes: NAMESPACES,
          types: TYPES
        },
        quickFiltersStatus: { includeLegacy: true },
        filterDefaults: CONFIG
      },
      commit: jest.fn()
    };

    mockToast = { add: jest.fn() };

    const warn = console.warn;
    console.warn = jest.fn();

    wrapper = shallowMount(Filters, {
      props: { search: jest.fn() },
      global: {
        components: { MultiSelect, InputSwitch, Button },
        directives: { Tooltip: Tooltip },
        mocks: { $store: mockStore, $toast: mockToast }
      }
    });

    console.warn = warn;

    await flushPromises();
    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  it("can setLegacy ___ true ___ no emis ___ not found", () => {
    wrapper.vm.selectedSchemes = [
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
    ];
    wrapper.vm.setLegacy(true);
    expect(wrapper.vm.selectedSchemes).toStrictEqual([
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
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateQuickFiltersStatus", { key: "includeLegacy", value: true });
  });
});
