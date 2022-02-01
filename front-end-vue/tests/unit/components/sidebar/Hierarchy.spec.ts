import { flushPromises, mount } from "@vue/test-utils";
import Hierarchy from "@/components/sidebar/Hierarchy.vue";
import Button from "primevue/button";
import Tree from "primevue/tree";
import ProgressSpinner from "primevue/progressspinner";
import OverlayPanel from "primevue/overlaypanel";
import EntityService from "@/services/EntityService";
import Tooltip from "primevue/tooltip";
import { IM } from "@/vocabulary/IM";

describe("Hierarchy.vue ___ DiscoveryOntology", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRouter: any;
  let mockRoute: any;
  let mockToast: any;
  let mockRef: any;

  const CONCEPT = {
    "@id": "http://endhealth.info/im#DiscoveryOntology",
    "http://www.w3.org/2000/01/rdf-schema#comment": "A folder of ontologies including information models, value sets, query sets and maps",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ "@id": "http://endhealth.info/im#Folder", name: "Folder" }],
    "http://www.w3.org/2000/01/rdf-schema#label": "Discovery ontology"
  };
  const CHILDREN = [
    {
      name: "Data model bound value sets",
      hasChildren: true,
      type: [{ name: "Value set", "@id": "http://endhealth.info/im#ValueSet" }],
      "@id": "http://endhealth.info/im#VSET_DataModel"
    },
    {
      name: "Emis terminology",
      hasChildren: false,
      type: [
        {
          name: "Legacy concept",
          "@id": "http://endhealth.info/im#LegacyConcept"
        }
      ],
      "@id": "http://endhealth.info/EMIS#EMISNHH2"
    },
    {
      name: "SNOMED CT Concept (SNOMED RT+CTV3)",
      hasChildren: true,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#138875005"
    }
  ];

  const HIERARCHY_SELECTED_FILTERS = [
    { iri: "http://endhealth.info/im#", prefix: "im", name: "Discovery namespace" },
    { iri: "http://snomed.info/sct#", prefix: "sn", name: "Snomed-CT namespace" }
  ];

  const SUMMARY = {
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
    match: "629792015"
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    EntityService.getPartialEntity = jest.fn().mockResolvedValue(CONCEPT);
    EntityService.getEntityParents = jest.fn().mockResolvedValue([]);
    EntityService.getEntityChildren = jest.fn().mockResolvedValue(CHILDREN);
    EntityService.getEntitySummary = jest.fn().mockResolvedValue(SUMMARY);

    mockStore = {
      state: {
        conceptIri: "http://endhealth.info/im#DiscoveryOntology",
        focusTree: false,
        treeLocked: false,
        sideNavHierarchyFocus: {
          name: "Ontology",
          iri: "http://endhealth.info/im#DiscoveryOntology"
        },
        resetTree: false,
        hierarchySelectedFilters: HIERARCHY_SELECTED_FILTERS
      },
      commit: jest.fn(),
      dispatch: jest.fn()
    };
    mockRoute = {
      fullPath: "/",
      name: "Dashboard"
    };
    mockRouter = {
      push: jest.fn()
    };
    mockToast = {
      add: jest.fn()
    };
    mockRef = { render: () => {}, methods: { show: jest.fn(), hide: jest.fn() } };

    wrapper = mount(Hierarchy, {
      props: { active: 5 },
      global: {
        components: { Button, Tree, ProgressSpinner, OverlayPanel },
        mocks: {
          $store: mockStore,
          $route: mockRoute,
          $router: mockRouter,
          $toast: mockToast
        },
        directives: { tooltip: Tooltip },
        stubs: { OverlayPanel: mockRef, FontAwesomeIcon: true }
      }
    });

    await flushPromises();
    jest.clearAllMocks();
  });

  it("hidesPopup on unMount", () => {
    wrapper.vm.hidePopup = jest.fn();
    wrapper.vm.overlayLocation = { 1: 1, 2: 2, 3: 3 };
    wrapper.unmount();
    expect(wrapper.vm.hidePopup).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.hidePopup).toHaveBeenCalledWith({ 1: 1, 2: 2, 3: 3 });
  });

  it("hidesPopup on unMount ___ no keys", () => {
    wrapper.vm.hidePopup = jest.fn();
    wrapper.vm.overlayLocation = {};
    wrapper.unmount();
    expect(wrapper.vm.hidePopup).not.toHaveBeenCalled();
  });

  it("handles conceptIri changes ___ tree locked ___ false", async () => {
    expect(wrapper.vm.treeLocked).toBe(false);
    wrapper.vm.getConceptAggregate = jest.fn();
    wrapper.vm.refreshTree = jest.fn();
    wrapper.vm.updateHistory = jest.fn();
    wrapper.vm.$options.watch.conceptIri.call(wrapper.vm, "http://endhealth.info/im#DiscoveryOntology");
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.getConceptAggregate).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.getConceptAggregate).toHaveBeenCalledWith("http://endhealth.info/im#DiscoveryOntology");
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.selectedKey).toStrictEqual({});
    expect(wrapper.vm.refreshTree).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.updateHistory).toHaveBeenCalledTimes(1);
  });

  it("handles sideNavHierarchyFocus changes ___ different", async () => {
    wrapper.vm.getConceptAggregate = jest.fn();
    wrapper.vm.refreshTree = jest.fn();
    wrapper.vm.updateHistory = jest.fn();
    wrapper.vm.$options.watch.sideNavHierarchyFocus.call(wrapper.vm, { iri: "testNew" }, { iri: "testOld" });
    await flushPromises();
    expect(wrapper.vm.getConceptAggregate).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.refreshTree).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.updateHistory).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.selectedKey).toStrictEqual({});
  });

  it("handles sideNavHierarchyFocus changes ___ same", async () => {
    wrapper.vm.getConceptAggregate = jest.fn();
    wrapper.vm.refreshTree = jest.fn();
    wrapper.vm.updateHistory = jest.fn();
    wrapper.vm.$options.watch.sideNavHierarchyFocus.call(wrapper.vm, { iri: "testSame" }, { iri: "testSame" });
    await flushPromises();
    expect(wrapper.vm.getConceptAggregate).not.toHaveBeenCalled();
    expect(wrapper.vm.refreshTree).not.toHaveBeenCalled();
    expect(wrapper.vm.updateHistory).not.toHaveBeenCalled();
    expect(wrapper.vm.selectedKey).not.toStrictEqual({});
  });

  it("handles active changes ___ refresh", async () => {
    wrapper.vm.refreshTree = jest.fn();
    wrapper.vm.$options.watch.active.call(wrapper.vm, 0, 1);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.refreshTree).toHaveBeenCalledTimes(1);
  });

  it("can resetConcept", async () => {
    wrapper.vm.createTree = jest.fn();
    wrapper.vm.getConceptAggregate = jest.fn();
    wrapper.vm.parentLabel = "Test label";
    wrapper.vm.selectedKey = { name: "test selected key" };
    wrapper.vm.$nextTick();
    expect(wrapper.vm.parentLabel).toBe("Test label");
    expect(wrapper.vm.selectedKey).toStrictEqual({ name: "test selected key" });
    expect(wrapper.vm.sideNavHierarchyFocus.iri).toEqual("http://endhealth.info/im#DiscoveryOntology");
    wrapper.vm.resetConcept();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.parentLabel).toBe("");
    expect(wrapper.vm.selectedKey).toStrictEqual({
      "Discovery ontology": true
    });
    expect(wrapper.emitted()["showTree"]).toBeTruthy();
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateConceptIri", "http://endhealth.info/im#DiscoveryOntology");
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "Dashboard" });
  });

  it("can resetConcept ___ InformationModel", async () => {
    wrapper.vm.refreshTree = jest.fn();
    wrapper.vm.getConceptAggregate = jest.fn();
    wrapper.vm.selectedKey = { name: "test selected key" };
    wrapper.vm.$nextTick();
    expect(wrapper.vm.selectedKey).toStrictEqual({ name: "test selected key" });
    wrapper.vm.resetConcept();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(wrapper.vm.selectedKey).toStrictEqual({});
    expect(wrapper.emitted()["showTree"]).toBeTruthy();
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateConceptIri", "http://endhealth.info/im#DiscoveryOntology");
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "Dashboard" });
  });

  it("can toggleTreeLocked", () => {
    wrapper.vm.toggleTreeLocked(true);
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateTreeLocked", true);
  });
});

describe("Hierarchy.vue ___ Concept", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRouter: any;
  let mockRoute: any;
  let mockToast: any;
  let mockRef: any;

  const CONCEPT = {
    "@id": "http://snomed.info/sct#298382003",
    "http://endhealth.info/im#isA": [
      {
        "@id": "http://snomed.info/sct#64217002",
        name: "Curvature of spine (disorder)"
      },
      {
        "@id": "http://snomed.info/sct#928000",
        name: "Disorder of musculoskeletal system (disorder)"
      },
      {
        "@id": "http://snomed.info/sct#699699005",
        name: "Disorder of vertebral column (disorder)"
      }
    ],
    "http://endhealth.info/im#status": {
      "@id": "http://endhealth.info/im#Active",
      name: "Active"
    },
    "http://endhealth.info/im#code": "298382003",
    "http://endhealth.info/im#roleGroup": [
      {
        "http://endhealth.info/im#groupNumber": {
          "@value": 1,
          "@type": "http://www.w3.org/2001/XMLSchema#integer"
        },
        "http://www.w3.org/2002/07/owl#someValuesFrom": {
          "@id": "http://snomed.info/sct#31739005",
          name: "Lateral abnormal curvature (morphologic abnormality)"
        },
        "http://www.w3.org/2002/07/owl#onProperty": {
          "@id": "http://snomed.info/sct#116676008",
          name: "Associated morphology (attribute)"
        },
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": {
          "@id": "http://www.w3.org/2002/07/owl#Restriction",
          name: "Restriction"
        }
      }
    ],
    "http://endhealth.info/im#hasMap": [
      {
        "http://endhealth.info/im#oneOf": [
          {
            "http://endhealth.info/im#matchedTo": {
              "@id": "http://endhealth.info/ICD10#M419",
              name: "Scoliosis, unspecified"
            },
            "http://endhealth.info/im#mapAdvice": "ALWAYS M41.9 | FIFTH CHARACTER POSSIBLE",
            "http://endhealth.info/im#mapPriority": {
              "@value": 3,
              "@type": "http://www.w3.org/2001/XMLSchema#integer"
            },
            "http://endhealth.info/im#assuranceLevel": {
              "@id": "http://endhealth.info/im#NationallyAssuredUK",
              name: "Nationally assured UK level"
            }
          },
          {
            "http://endhealth.info/im#matchedTo": {
              "@id": "http://endhealth.info/ICD10#M418",
              name: "Other forms of scoliosis"
            },
            "http://endhealth.info/im#mapAdvice": "ALWAYS M41.8 | FIFTH CHARACTER POSSIBLE",
            "http://endhealth.info/im#mapPriority": {
              "@value": 2,
              "@type": "http://www.w3.org/2001/XMLSchema#integer"
            },
            "http://endhealth.info/im#assuranceLevel": {
              "@id": "http://endhealth.info/im#NationallyAssuredUK",
              name: "Nationally assured UK level"
            }
          },
          {
            "http://endhealth.info/im#matchedTo": {
              "@id": "http://endhealth.info/ICD10#Q675",
              name: "Congenital deformity of spine"
            },
            "http://endhealth.info/im#mapAdvice": "ALWAYS Q67.5",
            "http://endhealth.info/im#mapPriority": {
              "@value": 1,
              "@type": "http://www.w3.org/2001/XMLSchema#integer"
            },
            "http://endhealth.info/im#assuranceLevel": {
              "@id": "http://endhealth.info/im#NationallyAssuredUK",
              name: "Nationally assured UK level"
            }
          }
        ]
      }
    ],
    "http://endhealth.info/im#scheme": {
      "@id": "http://endhealth.info/im#SnomedCodeScheme",
      name: "Snomed-CT code"
    },
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ "@id": "http://www.w3.org/2002/07/owl#Class", name: "Class" }],
    "http://www.w3.org/2000/01/rdf-schema#label": "Scoliosis deformity of spine (disorder)",
    "http://www.w3.org/2002/07/owl#equivalentClass": [
      {
        "http://www.w3.org/2002/07/owl#intersectionOf": [
          {
            "@id": "http://snomed.info/sct#64572001",
            name: "Disease (disorder)"
          },
          {
            "http://www.w3.org/2002/07/owl#someValuesFrom": {
              "http://www.w3.org/2002/07/owl#intersectionOf": [
                {
                  "http://www.w3.org/2002/07/owl#someValuesFrom": {
                    "@id": "http://snomed.info/sct#31739005",
                    name: "Lateral abnormal curvature (morphologic abnormality)"
                  },
                  "http://www.w3.org/2002/07/owl#onProperty": {
                    "@id": "http://snomed.info/sct#116676008",
                    name: "Associated morphology (attribute)"
                  },
                  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": {
                    "@id": "http://www.w3.org/2002/07/owl#Restriction",
                    name: "Restriction"
                  }
                },
                {
                  "http://www.w3.org/2002/07/owl#someValuesFrom": {
                    "@id": "http://snomed.info/sct#289959001",
                    name: "Musculoskeletal structure of spine (body structure)"
                  },
                  "http://www.w3.org/2002/07/owl#onProperty": {
                    "@id": "http://snomed.info/sct#363698007",
                    name: "Finding site (attribute)"
                  },
                  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": {
                    "@id": "http://www.w3.org/2002/07/owl#Restriction",
                    name: "Restriction"
                  }
                }
              ]
            },
            "http://www.w3.org/2002/07/owl#onProperty": {
              "@id": "http://endhealth.info/im#roleGroup",
              name: "role group"
            },
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": {
              "@id": "http://www.w3.org/2002/07/owl#Restriction",
              name: "Restriction"
            }
          }
        ]
      }
    ]
  };
  const PARENTS = [
    {
      name: "Curvature of spine (disorder)",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#64217002"
    },
    {
      name: "Disorder of musculoskeletal system (disorder)",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#928000"
    },
    {
      name: "Disorder of vertebral column (disorder)",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#699699005"
    }
  ];
  const CHILDREN = [
    {
      name: "Acquired scoliosis (disorder)",
      hasChildren: true,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#111266001"
    },
    {
      name: "Acrodysplasia scoliosis (disorder)",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#773773006"
    },
    {
      name: "Congenital scoliosis due to bony malformation (disorder)",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#205045003"
    },
    {
      name: "Distal arthrogryposis type 4 (disorder)",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#715575001"
    },
    {
      name: "Duane anomaly, myopathy, scoliosis syndrome (disorder)",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#722432000"
    },
    {
      name: "Horizontal gaze palsy with progressive scoliosis (disorder)",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#702381007"
    },
    {
      name: "Idiopathic scoliosis (disorder)",
      hasChildren: true,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#203639008"
    },
    {
      name: "Idiopathic scoliosis AND/OR kyphoscoliosis (disorder)",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#30611007"
    },
    {
      name: "Kyphoscoliosis and scoliosis (disorder)",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#203638000"
    },
    {
      name: "Kyphoscoliosis deformity of spine (disorder)",
      hasChildren: true,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#405773007"
    },
    {
      name: "Lordoscoliosis (disorder)",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#111268000"
    },
    {
      name: "Neuromuscular scoliosis (disorder)",
      hasChildren: true,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#203662005"
    },
    {
      name: "Postural scoliosis (disorder)",
      hasChildren: true,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#203645000"
    },
    {
      name: "Radioulnar synostosis with microcephaly and scoliosis syndrome (disorder)",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#719162001"
    },
    {
      name: "Scoliosis in connective tissue anomalies (disorder)",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#203664006"
    },
    {
      name: "Scoliosis in neurofibromatosis (disorder)",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#203663000"
    },
    {
      name: "Scoliosis in skeletal dysplasia (disorder)",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#203661003"
    },
    {
      name: "Scoliosis of cervical spine (disorder)",
      hasChildren: true,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#298392006"
    },
    {
      name: "Scoliosis of lumbar spine (disorder)",
      hasChildren: true,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#298591003"
    },
    {
      name: "Scoliosis of thoracic spine (disorder)",
      hasChildren: true,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#298494008"
    }
  ];

  const ROOT = [
    {
      children: [
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#111266001",
          key: "Acquired scoliosis (disorder)",
          label: "Acquired scoliosis (disorder)",
          leaf: false,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#773773006",
          key: "Acrodysplasia scoliosis (disorder)",
          label: "Acrodysplasia scoliosis (disorder)",
          leaf: true,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#205045003",
          key: "Congenital scoliosis due to bony malformation (disorder)",
          label: "Congenital scoliosis due to bony malformation (disorder)",
          leaf: true,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#715575001",
          key: "Distal arthrogryposis type 4 (disorder)",
          label: "Distal arthrogryposis type 4 (disorder)",
          leaf: true,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#722432000",
          key: "Duane anomaly, myopathy, scoliosis syndrome (disorder)",
          label: "Duane anomaly, myopathy, scoliosis syndrome (disorder)",
          leaf: true,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#702381007",
          key: "Horizontal gaze palsy with progressive scoliosis (disorder)",
          label: "Horizontal gaze palsy with progressive scoliosis (disorder)",
          leaf: true,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#203639008",
          key: "Idiopathic scoliosis (disorder)",
          label: "Idiopathic scoliosis (disorder)",
          leaf: false,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#30611007",
          key: "Idiopathic scoliosis AND/OR kyphoscoliosis (disorder)",
          label: "Idiopathic scoliosis AND/OR kyphoscoliosis (disorder)",
          leaf: true,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#203638000",
          key: "Kyphoscoliosis and scoliosis (disorder)",
          label: "Kyphoscoliosis and scoliosis (disorder)",
          leaf: true,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#405773007",
          key: "Kyphoscoliosis deformity of spine (disorder)",
          label: "Kyphoscoliosis deformity of spine (disorder)",
          leaf: false,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#111268000",
          key: "Lordoscoliosis (disorder)",
          label: "Lordoscoliosis (disorder)",
          leaf: true,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#203662005",
          key: "Neuromuscular scoliosis (disorder)",
          label: "Neuromuscular scoliosis (disorder)",
          leaf: false,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#203645000",
          key: "Postural scoliosis (disorder)",
          label: "Postural scoliosis (disorder)",
          leaf: false,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#719162001",
          key: "Radioulnar synostosis with microcephaly and scoliosis syndrome (disorder)",
          label: "Radioulnar synostosis with microcephaly and scoliosis syndrome (disorder)",
          leaf: true,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#203664006",
          key: "Scoliosis in connective tissue anomalies (disorder)",
          label: "Scoliosis in connective tissue anomalies (disorder)",
          leaf: true,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#203663000",
          key: "Scoliosis in neurofibromatosis (disorder)",
          label: "Scoliosis in neurofibromatosis (disorder)",
          leaf: true,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#203661003",
          key: "Scoliosis in skeletal dysplasia (disorder)",
          label: "Scoliosis in skeletal dysplasia (disorder)",
          leaf: true,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#298392006",
          key: "Scoliosis of cervical spine (disorder)",
          label: "Scoliosis of cervical spine (disorder)",
          leaf: false,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#298591003",
          key: "Scoliosis of lumbar spine (disorder)",
          label: "Scoliosis of lumbar spine (disorder)",
          leaf: false,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#298494008",
          key: "Scoliosis of thoracic spine (disorder)",
          label: "Scoliosis of thoracic spine (disorder)",
          leaf: false,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        }
      ],
      color: "#e39a3688",
      data: "http://snomed.info/sct#298382003",
      key: "Scoliosis deformity of spine (disorder)",
      label: "Scoliosis deformity of spine (disorder)",
      leaf: true,
      loading: false,
      typeIcon: ["far", "lightbulb"]
    }
  ];

  const HIERARCHY_SELECTED_FILTERS = [
    { iri: "http://endhealth.info/im#", prefix: "im", name: "Discovery namespace" },
    { iri: "http://snomed.info/sct#", prefix: "sn", name: "Snomed-CT namespace" }
  ];

  const SUMMARY = {
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
    match: "629792015"
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    EntityService.getPartialEntity = jest.fn().mockResolvedValue(CONCEPT);
    EntityService.getEntityParents = jest.fn().mockResolvedValue(PARENTS);
    EntityService.getEntityChildren = jest.fn().mockResolvedValue(CHILDREN);
    EntityService.getEntitySummary = jest.fn().mockResolvedValue(SUMMARY);

    mockStore = {
      state: {
        conceptIri: "http://snomed.info/sct#298382003",
        focusTree: false,
        treeLocked: true,
        sideNavHierarchyFocus: {
          name: "Ontology",
          iri: "http://endhealth.info/im#DiscoveryOntology"
        },
        resetTree: false,
        hierarchySelectedFilters: HIERARCHY_SELECTED_FILTERS
      },
      commit: jest.fn(),
      dispatch: jest.fn()
    };
    mockRoute = {
      fullPath: "/concept/http:%2F%2Fsnomed.info%2Fsct%23298382003",
      name: "Concept"
    };
    mockRouter = {
      push: jest.fn()
    };
    mockToast = {
      add: jest.fn()
    };
    mockRef = { render: () => {}, methods: { show: jest.fn(), hide: jest.fn() } };

    wrapper = mount(Hierarchy, {
      props: { active: 5 },
      global: {
        components: { Button, Tree, ProgressSpinner, OverlayPanel },
        mocks: {
          $store: mockStore,
          $route: mockRoute,
          $router: mockRouter,
          $toast: mockToast
        },
        directives: { tooltip: Tooltip },
        stubs: { OverlayPanel: mockRef, FontAwesomeIcon: true }
      }
    });

    await flushPromises();
    jest.clearAllMocks();
  });

  it("mounts", async () => {
    expect(wrapper.vm.conceptAggregate).toStrictEqual({
      children: CHILDREN,
      concept: CONCEPT,
      parents: PARENTS
    });
    expect(wrapper.vm.searchResult).toBe("");
    expect(wrapper.vm.root).toStrictEqual(ROOT);
    expect(wrapper.vm.expandedKeys).toStrictEqual({ "Scoliosis deformity of spine (disorder)": true });
    expect(wrapper.vm.selectedKey).toStrictEqual({ "Scoliosis deformity of spine (disorder)": true });
    expect(wrapper.vm.parentLabel).toBe("Curvature of spine (disorder)");
  });

  it("handles conceptIri changes ___ tree locked ___ true", async () => {
    jest.clearAllMocks();
    expect(wrapper.vm.treeLocked).toBe(true);
    wrapper.vm.getConceptAggregate = jest.fn();
    wrapper.vm.refreshTree = jest.fn();
    wrapper.vm.updateHistory = jest.fn();
    wrapper.vm.$options.watch.conceptIri.call(wrapper.vm, "http://endhealth.info/im#DiscoveryOntology");
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.getConceptAggregate).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.getConceptAggregate).toHaveBeenCalledWith("http://endhealth.info/im#DiscoveryOntology");
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.selectedKey).toStrictEqual({
      "Scoliosis deformity of spine (disorder)": true
    });
    expect(wrapper.vm.refreshTree).toHaveBeenCalledTimes(0);
    expect(wrapper.vm.updateHistory).toHaveBeenCalledTimes(1);
  });

  it("handles hierarchySelectedFilters changes", async () => {
    wrapper.vm.getConceptAggregate = jest.fn();
    wrapper.vm.refreshTree = jest.fn();
    wrapper.vm.updateHistory = jest.fn();
    wrapper.vm.$options.watch.hierarchySelectedFilters.handler.call(wrapper.vm, true);
    await flushPromises();
    expect(wrapper.vm.getConceptAggregate).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.getConceptAggregate).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(wrapper.vm.selectedKey).toStrictEqual({});
    expect(wrapper.vm.refreshTree).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.updateHistory).toHaveBeenCalledTimes(1);
  });

  it("handles focusTree changes ___ true", async () => {
    wrapper.vm.refreshTree = jest.fn();
    wrapper.vm.getConceptAggregate = jest.fn();
    wrapper.vm.$options.watch.focusTree.call(wrapper.vm, true);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.refreshTree).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.getConceptAggregate).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateFocusTree", false);
    expect(wrapper.emitted().showTree).toBeTruthy();
  });

  it("handles focusTree changes ___ false", async () => {
    wrapper.vm.refreshTree = jest.fn();
    wrapper.vm.getConceptAggregate = jest.fn();
    wrapper.vm.$options.watch.focusTree.call(wrapper.vm, false);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.refreshTree).not.toHaveBeenCalled();
    expect(wrapper.vm.getConceptAggregate).not.toHaveBeenCalled();
    expect(wrapper.emitted().showTree).toBeFalsy();
  });

  it("handles active changes ___ no refresh", async () => {
    wrapper.vm.refreshTree = jest.fn();
    wrapper.vm.$options.watch.active.call(wrapper.vm, 1, 0);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.refreshTree).not.toHaveBeenCalled();
  });

  it("handles treeLocked changes ___ refresh", async () => {
    wrapper.vm.refreshTree = jest.fn();
    wrapper.vm.getConceptAggregate = jest.fn();
    wrapper.vm.$options.watch.treeLocked.call(wrapper.vm, false);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.refreshTree).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.getConceptAggregate).toHaveBeenCalledTimes(1);
  });

  it("handles treeLocked changes ___ no refresh", async () => {
    wrapper.vm.refreshTree = jest.fn();
    wrapper.vm.getConceptAggregate = jest.fn();
    wrapper.vm.$options.watch.treeLocked.call(wrapper.vm, true);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.refreshTree).not.toHaveBeenCalled();
    expect(wrapper.vm.getConceptAggregate).not.toHaveBeenCalled();
  });

  it("handles resetTree ___ true", async () => {
    wrapper.vm.getConceptAggregate = jest.fn();
    wrapper.vm.refreshTree = jest.fn();
    wrapper.vm.$options.watch.resetTree.call(wrapper.vm, true);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.getConceptAggregate).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.getConceptAggregate).toHaveBeenCalledWith(IM.MODULE_ONTOLOGY);
    expect(wrapper.vm.refreshTree).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.selectedKey).toStrictEqual({});
    expect(wrapper.vm.parentLabel).toBe("");
    expect(wrapper.vm.expandedKeys).toStrictEqual({});
    expect(mockStore.commit).toHaveBeenCalledTimes(1);
    expect(mockStore.commit).toHaveBeenCalledWith("updateResetTree", false);
  });

  it("handles resetTree ___ false", async () => {
    wrapper.vm.getConceptAggregate = jest.fn();
    wrapper.vm.refreshTree = jest.fn();
    wrapper.vm.$options.watch.resetTree.call(wrapper.vm, false);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.getConceptAggregate).not.toHaveBeenCalled();
    expect(wrapper.vm.refreshTree).not.toHaveBeenCalled();
    expect(mockStore.commit).not.toHaveBeenCalled();
  });

  it("createsTree ___ no root", () => {
    wrapper.vm.refreshTree = jest.fn();
    wrapper.vm.refreshTree(EntityService.getPartialEntity, EntityService.getEntityParents, EntityService.getEntityChildren);
    expect(wrapper.vm.refreshTree).toHaveBeenCalledTimes(1);
  });

  it("createsTree ___ concept", () => {
    wrapper.vm.refreshTree = jest.fn();
    wrapper.vm.root = [1];
    wrapper.vm.refreshTree({ "@id": "http://endhealth.info/im#InformationModel" }, EntityService.getEntityParents, EntityService.getEntityChildren);
    expect(wrapper.vm.refreshTree).toHaveBeenCalledTimes(1);
  });

  it("routes onNodeSelect ___ Concept", () => {
    wrapper.vm.onNodeSelect({ data: "http://endhealth.info/im#TestConcept" });
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: "Concept",
      params: { selectedIri: "http://endhealth.info/im#TestConcept" }
    });
  });

  it("routes onNodeSelect ___ MODULE_IRI", () => {
    wrapper.vm.onNodeSelect({ data: IM.MODULE_DATA_MODEL });
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: "Dashboard"
    });
  });

  it("can expand children", async () => {
    const testNode = {
      data: "http://endhealth.info/im#TestConcept",
      key: "http://endhealth.info/im#TestConcept",
      loading: false,
      children: [1]
    };
    await wrapper.vm.expandChildren(testNode);
    await wrapper.vm.$nextTick();
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(EntityService.getEntityChildren).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityChildren).toHaveBeenCalledWith("http://endhealth.info/im#TestConcept", {
      schemes: ["http://endhealth.info/im#", "http://snomed.info/sct#"],
      status: [],
      types: []
    });
    expect(testNode.children).toHaveLength(20);
  });

  it("can expand children ___ containsChildTrue", async () => {
    const testNode = {
      data: "http://endhealth.info/im#TestConcept",
      key: "http://endhealth.info/im#TestConcept",
      loading: false,
      children: []
    };
    await wrapper.vm.expandChildren(testNode);
    await wrapper.vm.$nextTick();
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(EntityService.getEntityChildren).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityChildren).toHaveBeenCalledWith("http://endhealth.info/im#TestConcept", {
      schemes: ["http://endhealth.info/im#", "http://snomed.info/sct#"],
      status: [],
      types: []
    });
    expect(testNode.children).toHaveLength(20);
  });

  it("can getSelectedNodeRecursively ___ result", () => {
    wrapper.vm.selectedKey = { "Acquired scoliosis (disorder)": true };
    expect(wrapper.vm.getSelectedNodeRecursively()).toStrictEqual({
      children: [],
      color: "#e39a3688",
      data: "http://snomed.info/sct#111266001",
      key: "Acquired scoliosis (disorder)",
      label: "Acquired scoliosis (disorder)",
      leaf: false,
      loading: false,
      typeIcon: ["far", "lightbulb"]
    });
  });

  it("can getSelectedNodeRecursively ___ no result", () => {
    wrapper.vm.recursiveSearchForNode = jest.fn().mockReturnValue(false);
    expect(wrapper.vm.getSelectedNodeRecursively()).toStrictEqual(ROOT[0]);
  });

  it("can getNodeToExpand ___ found", () => {
    wrapper.vm.selectedKey = { "Scoliosis deformity of spine (disorder)": true };
    expect(wrapper.vm.getNodeToExpand()).toStrictEqual(ROOT[0]);
  });

  it("can getNodeToExpand ___ not found", () => {
    expect(wrapper.vm.getNodeToExpand()).toStrictEqual(ROOT[0]);
  });

  it("can recursiveSearchForNode", () => {
    let expandedRoot = [
      {
        key: "Scoliosis deformity of spine",
        label: "Scoliosis deformity of spine",
        typeIcon: "far fa-fw fa-lightbulb",
        color: "#e39a3688",
        data: "http://snomed.info/sct#298382003",
        leaf: true,
        loading: false,
        children: [
          {
            key: "Acquired scoliosis",
            label: "Acquired scoliosis",
            typeIcon: "far fa-fw fa-lightbulb",
            color: "#e39a3688",
            data: "http://snomed.info/sct#111266001",
            leaf: false,
            loading: false,
            children: [
              {
                key: "Acquired kyphoscoliosis (disorder)",
                label: "Acquired kyphoscoliosis (disorder)",
                typeIcon: "far fa-fw fa-lightbulb",
                color: "#e39a3688",
                data: "http://snomed.info/sct#405771009",
                leaf: false,
                loading: false,
                children: []
              },
              {
                key: "Adolescent idiopathic scoliosis",
                label: "Adolescent idiopathic scoliosis",
                typeIcon: "far fa-fw fa-lightbulb",
                color: "#e39a3688",
                data: "http://snomed.info/sct#203646004",
                leaf: false,
                loading: false,
                children: []
              }
            ]
          }
        ]
      }
    ];
    let result = [] as any[];
    wrapper.vm.recursiveSearchForNode("Adolescent idiopathic scoliosis", expandedRoot, result);
    expect(result).toStrictEqual([
      {
        key: "Adolescent idiopathic scoliosis",
        label: "Adolescent idiopathic scoliosis",
        typeIcon: "far fa-fw fa-lightbulb",
        color: "#e39a3688",
        data: "http://snomed.info/sct#203646004",
        leaf: false,
        loading: false,
        children: []
      }
    ]);
  });

  it("can check nodeIsChildOf ___ true", () => {
    expect(
      wrapper.vm.nodeIsChildOf(
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#719162001",
          key: "Radioulnar synostosis with microcephaly and scoliosis syndrome (disorder)",
          label: "Radioulnar synostosis with microcephaly and scoliosis syndrome (disorder)",
          leaf: true,
          loading: false,
          typeIcon: "far fa-fw fa-lightbulb"
        },
        ROOT[0]
      )
    ).toBe(true);
  });

  it("can expand parents __ api pass", async () => {
    wrapper.vm.root = [
      {
        data: "http://snomed.info/sct#298382003",
        key: "Scoliosis deformity of spine (disorder)"
      }
    ];
    await wrapper.vm.expandParents();
    expect(EntityService.getEntityParents).toHaveBeenCalledTimes(2);
    expect(EntityService.getEntityParents).toHaveBeenNthCalledWith(1, "http://snomed.info/sct#298382003", {
      schemes: ["http://endhealth.info/im#", "http://snomed.info/sct#"],
      status: [],
      types: []
    });
    expect(EntityService.getEntityParents).toHaveBeenLastCalledWith("http://snomed.info/sct#64217002", {
      schemes: ["http://endhealth.info/im#", "http://snomed.info/sct#"],
      status: [],
      types: []
    });
  });

  it("can expand parents __ api 2 no data", async () => {
    wrapper.vm.root = [
      {
        data: "http://snomed.info/sct#298382003",
        key: "Scoliosis deformity of spine (disorder)"
      }
    ];
    EntityService.getEntityParents = jest
      .fn()
      .mockResolvedValueOnce([
        {
          name: "Curvature of spine (disorder)",
          hasChildren: false,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://snomed.info/sct#64217002"
        },
        {
          name: "Disorder of musculoskeletal system (disorder)",
          hasChildren: false,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://snomed.info/sct#928000"
        },
        {
          name: "Disorder of vertebral column (disorder)",
          hasChildren: false,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://snomed.info/sct#699699005"
        }
      ])
      .mockResolvedValueOnce([]);
    await wrapper.vm.expandParents();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(EntityService.getEntityParents).toHaveBeenCalledTimes(2);
    expect(EntityService.getEntityParents).toHaveBeenNthCalledWith(1, "http://snomed.info/sct#298382003", {
      schemes: ["http://endhealth.info/im#", "http://snomed.info/sct#"],
      status: [],
      types: []
    });
    expect(EntityService.getEntityParents).toHaveBeenLastCalledWith("http://snomed.info/sct#64217002", {
      schemes: ["http://endhealth.info/im#", "http://snomed.info/sct#"],
      status: [],
      types: []
    });
    expect(wrapper.vm.parentLabel).toBe("");
  });

  it("can get concept types", () => {
    expect(
      wrapper.vm.getConceptTypes([
        { name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" },
        { name: "NodeShape", "@id": "hppt://www.w3.org/2002/07/owl#NodeShape" }
      ])
    ).toBe("Class, NodeShape");
  });

  it("can showPopup", async () => {
    wrapper.vm.showPopup("testEvent", "http://snomed.info/sct#111266001");
    await flushPromises();
    expect(mockRef.methods.show).toHaveBeenCalledTimes(1);
    expect(mockRef.methods.show).toHaveBeenCalledWith("testEvent");
    expect(wrapper.vm.overlayLocation).toBe("testEvent");
    expect(wrapper.vm.hoveredResult).toStrictEqual({
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
      match: "629792015"
    });
    expect(EntityService.getEntitySummary).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntitySummary).toHaveBeenCalledWith("http://snomed.info/sct#111266001");
  });

  it("can hidePopup", () => {
    wrapper.vm.hidePopup("testEvent");
    expect(mockRef.methods.hide).toHaveBeenCalledTimes(1);
    expect(mockRef.methods.hide).toHaveBeenCalledWith("testEvent");
    expect(wrapper.vm.overlayLocation).toStrictEqual({});
  });
});
