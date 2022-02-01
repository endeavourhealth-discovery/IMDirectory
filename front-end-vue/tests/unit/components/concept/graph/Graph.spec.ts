import Graph from "@/components/concept/graph/Graph.vue";
import EntityService from "@/services/EntityService";
import { flushPromises, shallowMount } from "@vue/test-utils";
import ProgressSpinner from "primevue/progressspinner";
import MultiSelect from "primevue/multiselect";
import * as GraphTranslator from "@/helpers/GraphTranslator";
import ConfigService from "@/services/ConfigService";

describe("Graph.vue", () => {
  let wrapper: any;
  let translatorSpy: any;
  const TRANSLATED = {
    name: "Scoliosis deformity of spine",
    iri: "http://snomed.info/sct#298382003",
    relToParent: "",
    children: [
      {
        name: "Necessary and sufficient",
        iri: "http://endhealth.info/im#1251000252106",
        relToParent: "",
        children: [],
        _children: []
      },
      { name: "Curvature of spine", iri: "http://snomed.info/sct#64217002", relToParent: "subClassOf", children: [], _children: [] },
      { name: "Disorder of musculoskeletal system", iri: "http://snomed.info/sct#928000", relToParent: "subClassOf", children: [], _children: [] },
      { name: "Disorder of vertebral column", iri: "http://snomed.info/sct#699699005", relToParent: "subClassOf", children: [], _children: [] },
      { name: "298382003", iri: "", relToParent: "code", children: [], _children: [] },
      { name: "", iri: "", relToParent: "role group", children: [], _children: [] },
      { name: "", iri: "", relToParent: "has map", children: [], _children: [] }
    ],
    _children: []
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    ConfigService.getGraphExcludePredicates = jest
      .fn()
      .mockResolvedValue([
        "http://endhealth.info/im#matchedTo",
        "http://www.w3.org/2000/01/rdf-schema#label",
        "http://endhealth.info/im#status",
        "http://endhealth.info/im#Status",
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        "http://www.w3.org/2000/01/rdf-schema#comment",
        "http://endhealth.info/im#isChildOf",
        "http://endhealth.info/im#hasChildren",
        "http://endhealth.info/im#definition",
        "http://endhealth.info/im#usageStats",
        "http://endhealth.info/im#isA"
      ]);

    EntityService.getPartialEntityBundle = jest.fn().mockResolvedValue({
      entity: {
        "@id": "http://snomed.info/sct#298382003",
        "http://endhealth.info/im#definitionalStatus": {
          "@id": "http://endhealth.info/im#1251000252106",
          name: "Necessary and sufficient"
        },
        "http://endhealth.info/im#status": {
          "@id": "http://endhealth.info/im#Active",
          name: "Active"
        },
        "http://www.w3.org/2000/01/rdf-schema#subClassOf": [
          {
            "@id": "http://snomed.info/sct#64217002",
            name: "Curvature of spine"
          },
          {
            "@id": "http://snomed.info/sct#928000",
            name: "Disorder of musculoskeletal system"
          },
          {
            "@id": "http://snomed.info/sct#699699005",
            name: "Disorder of vertebral column"
          }
        ],
        "http://endhealth.info/im#matchedTo": [
          {
            "@id": "http://endhealth.info/emis#Nyu55",
            name: "Scoliosis deformity of spine"
          },
          {
            "@id": "http://endhealth.info/emis#^ESCTSC585225",
            name: "Scoliosis"
          },
          {
            "@id": "http://endhealth.info/tpp#Xa6vS",
            name: "Scoliosis deformity of spine"
          },
          {
            "@id": "http://endhealth.info/vis#Nyu55",
            name: "[X]Other forms of scoliosis"
          }
        ],
        "http://endhealth.info/im#code": "298382003",
        "http://www.w3.org/2000/01/rdf-schema#comment": "Scoliosis deformity of spine (disorder)",
        "http://endhealth.info/im#roleGroup": [
          {
            "http://snomed.info/sct#116676008": {
              "@id": "http://snomed.info/sct#31739005",
              name: "Lateral abnormal curvature"
            },
            "http://snomed.info/sct#363698007": {
              "@id": "http://snomed.info/sct#289959001",
              name: "Musculoskeletal structure of spine"
            }
          }
        ],
        "http://endhealth.info/im#Status": {
          "@id": "http://endhealth.info/im#Active",
          name: "Active"
        },
        "http://endhealth.info/im#hasMap": [
          {
            "http://endhealth.info/im#someOf": [
              {
                "http://endhealth.info/im#mapAdvice": "ALWAYS M41.9 | FIFTH CHARACTER POSSIBLE",
                "http://endhealth.info/im#mapPriority": 3,
                "http://endhealth.info/im#mappedTo": {
                  "@id": "http://endhealth.info/icd10#M419",
                  name: "Scoliosis, unspecified"
                },
                "http://endhealth.info/im#assuranceLevel": {
                  "@id": "http://endhealth.info/im#NationallyAssuredUK",
                  name: "Nationally assured UK level"
                }
              },
              {
                "http://endhealth.info/im#mapAdvice": "ALWAYS M41.8 | FIFTH CHARACTER POSSIBLE",
                "http://endhealth.info/im#mapPriority": 2,
                "http://endhealth.info/im#mappedTo": {
                  "@id": "http://endhealth.info/icd10#M418",
                  name: "Other forms of scoliosis"
                },
                "http://endhealth.info/im#assuranceLevel": {
                  "@id": "http://endhealth.info/im#NationallyAssuredUK",
                  name: "Nationally assured UK level"
                }
              },
              {
                "http://endhealth.info/im#mapAdvice": "ALWAYS Q67.5",
                "http://endhealth.info/im#mapPriority": 1,
                "http://endhealth.info/im#mappedTo": {
                  "@id": "http://endhealth.info/icd10#Q675",
                  name: "Congenital deformity of spine"
                },
                "http://endhealth.info/im#assuranceLevel": {
                  "@id": "http://endhealth.info/im#NationallyAssuredUK",
                  name: "Nationally assured UK level"
                }
              }
            ]
          }
        ],
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [
          {
            "@id": "http://endhealth.info/im#Concept",
            name: "Concept"
          }
        ],
        "http://www.w3.org/2000/01/rdf-schema#label": "Scoliosis deformity of spine"
      },
      predicates: {
        "http://endhealth.info/im#code": "code",
        "http://endhealth.info/im#roleGroup": "role group",
        "http://snomed.info/sct#116676008": "Associated morphology",
        "http://snomed.info/sct#363698007": "Finding site",
        "http://endhealth.info/im#Status": "Activity status",
        "http://endhealth.info/im#mapAdvice": "mapping advice",
        "http://endhealth.info/im#hasMap": "has map",
        "http://endhealth.info/im#mapPriority": "mapPriority",
        "http://endhealth.info/im#matchedTo": "matched To",
        "http://endhealth.info/im#assuranceLevel": "assurance level",
        "http://endhealth.info/im#status": "status",
        "http://www.w3.org/2000/01/rdf-schema#subClassOf": "subClassOf",
        "http://www.w3.org/2000/01/rdf-schema#comment": "comment",
        "http://www.w3.org/2000/01/rdf-schema#label": "label",
        "http://endhealth.info/im#someOf": "some of",
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "type"
      }
    });

    translatorSpy = jest.spyOn(GraphTranslator, "translateFromEntityBundle").mockReturnValue(TRANSLATED);

    const warn = console.warn;
    console.warn = jest.fn();

    wrapper = shallowMount(Graph, {
      global: { components: { ProgressSpinner, MultiSelect } },
      props: { conceptIri: "http://snomed.info/sct#298382003" }
    });

    console.warn = warn;

    await flushPromises();
    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  it("mounts", () => {
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.data).toStrictEqual(TRANSLATED);
  });

  it("watches conceptIri", async () => {
    wrapper.vm.getEntityBundle = jest.fn();
    wrapper.vm.$options.watch.conceptIri.call(wrapper.vm, "http://snomed.info/sct#203639008");
    await flushPromises();
    expect(wrapper.vm.getEntityBundle).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.getEntityBundle).toHaveBeenCalledWith("http://snomed.info/sct#203639008");
  });

  it("can getEntityBundle", async () => {
    jest.clearAllMocks();
    wrapper.vm.getEntityBundle("http://snomed.info/sct#203639008");
    expect(wrapper.vm.loading).toBe(true);
    expect(EntityService.getPartialEntityBundle).toHaveBeenCalledTimes(1);
    expect(EntityService.getPartialEntityBundle).toHaveBeenCalledWith("http://snomed.info/sct#203639008", []);
    await flushPromises();
    expect(wrapper.vm.data).toStrictEqual(TRANSLATED);
    expect(wrapper.vm.loading).toBe(false);
  });
});
