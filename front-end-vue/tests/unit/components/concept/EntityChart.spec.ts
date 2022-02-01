import { flushPromises, shallowMount } from "@vue/test-utils";
import EntityChart from "@/components/concept/EntityChart.vue";
import ProgressSpinner from "primevue/progressspinner";
import OrganizationChart from "primevue/organizationchart";
import EntityService from "@/services/EntityService";

describe("Graph.vue", () => {
  let wrapper: any;
  let mockRoute: any;
  let mockRouter: any;
  let mockToast: any;
  const GRAPH = {
    key: "0",
    name: "Accident and emergency encounter (record type)",
    iri: "http://endhealth.info/im#AccidentAndEmergencyEncounter",
    children: [
      {
        key: "0_0",
        name: "Is a",
        children: [
          {
            key: "0_0_0",
            type: "ISA",
            children: [],
            leafNodes: [{ name: "Hospital encounter", iri: "http://endhealth.info/im#1161000252102", children: [], leafNodes: [] }]
          }
        ],
        leafNodes: []
      },
      {
        key: "0_1",
        name: "Subtypes",
        children: [
          {
            key: "0_1_0",
            type: "SUBTYPE",
            children: [],
            leafNodes: [{ name: "Accident and emergency encounter discharge", iri: "http://endhealth.info/im#2541000252100", children: [], leafNodes: [] }]
          }
        ],
        leafNodes: []
      },
      {
        key: "0_2",
        name: "Semantic properties",
        children: [
          {
            key: "0_2_0",
            type: "PROPERTIES",
            children: [],
            leafNodes: [
              {
                name: "takes place in care setting",
                iri: "http://endhealth.info/im#51000252106",
                valueTypeIri: "http://endhealth.info/im#651000252108",
                valueTypeName: "Accident and emergency (setting)"
              }
            ]
          }
        ],
        leafNodes: []
      },
      {
        key: "0_3",
        name: "Data model properties",
        children: [
          {
            key: "0_3_0",
            name: "Direct",
            children: [
              {
                key: "0_3_0_0",
                type: "PROPERTIES",
                children: [],
                leafNodes: [
                  {
                    name: "a&e department type",
                    iri: "http://endhealth.info/im#aAndeDepartmentType",
                    valueTypeIri: "http://endhealth.info/im#651000252108",
                    valueTypeName: "Accident and emergency (setting)"
                  },
                  {
                    name: "has a&e attendance source of",
                    iri: "http://endhealth.info/im#hasAandeAttendanceSourceOf",
                    valueTypeIri: "http://snomed.info/sct#999002991000000109"
                  },
                  {
                    name: "has a&e category of attendance of",
                    iri: "http://endhealth.info/im#hasAandeCategoryOfAttendanceOf",
                    valueTypeIri: "http://endhealth.info/im#461000252108",
                    valueTypeName: "Accident and emergency attendance or follow up"
                  },
                  { name: "has arrival mode", iri: "http://endhealth.info/im#hasArrivalMode", valueTypeIri: "http://snomed.info/sct#999002981000000107" },
                  {
                    name: "treatment function for service for which admitted",
                    iri: "http://endhealth.info/im#treatmentFunctionForServiceForWhichAdmitted",
                    valueTypeIri: "http://snomed.info/sct#224930009",
                    valueTypeName: "Services (qualifier value)"
                  }
                ]
              }
            ],
            leafNodes: []
          },
          {
            key: "0_3_1",
            name: "Inherited",
            children: [
              {
                key: "0_3_1_0",
                type: "PROPERTIES",
                children: [],
                leafNodes: [
                  {
                    name: "additional Practitioners",
                    iri: "http://endhealth.info/im#additionalPractitioners",
                    valueTypeIri: "http://endhealth.info/im#ThePractitionerInRole",
                    valueTypeName: "Practitioner in role  (record type)",
                    inheritedFromIri: "http://endhealth.info/im#Encounter",
                    inheritedFromName: "Encounter (record type)"
                  },
                  {
                    name: "completion Status",
                    iri: "http://endhealth.info/im#completionStatus",
                    valueTypeIri: "http://endhealth.info/im#894281000252100",
                    valueTypeName: "Concept class",
                    inheritedFromIri: "http://endhealth.info/im#Encounter",
                    inheritedFromName: "Encounter (record type)"
                  },
                  {
                    name: "duration",
                    iri: "http://endhealth.info/im#duration",
                    valueTypeIri: "http://endhealth.info/im#894281000252100",
                    valueTypeName: "Concept class",
                    inheritedFromIri: "http://endhealth.info/im#Encounter",
                    inheritedFromName: "Encounter (record type)"
                  },
                  {
                    name: "has section",
                    iri: "http://endhealth.info/im#hasSection",
                    valueTypeIri: "http://endhealth.info/im#Section",
                    valueTypeName: "Section (structural)",
                    inheritedFromIri: "http://endhealth.info/im#Encounter",
                    inheritedFromName: "Encounter (record type)"
                  },
                  {
                    name: "linked appointment",
                    iri: "http://endhealth.info/im#linkedAppointment",
                    valueTypeIri: "http://endhealth.info/im#Appointment",
                    valueTypeName: "Appointment (slot)  (record type)",
                    inheritedFromIri: "http://endhealth.info/im#Encounter",
                    inheritedFromName: "Encounter (record type)"
                  },
                  {
                    name: "linked care episode",
                    iri: "http://endhealth.info/im#linkedCareEpisode",
                    valueTypeIri: "http://endhealth.info/im#EpisodeOfCare",
                    valueTypeName: "Episode of care  (record type)",
                    inheritedFromIri: "http://endhealth.info/im#Encounter",
                    inheritedFromName: "Encounter (record type)"
                  },
                  {
                    name: "location",
                    iri: "http://endhealth.info/im#location",
                    valueTypeIri: "http://endhealth.info/im#Location",
                    valueTypeName: "Location  (record type)",
                    inheritedFromIri: "http://endhealth.info/im#Encounter",
                    inheritedFromName: "Encounter (record type)"
                  },
                  {
                    name: "providing Organisation/ services or departments",
                    iri: "http://endhealth.info/im#providingOrganisation_ServicesOrDepartments",
                    valueTypeIri: "http://endhealth.info/im#Organisation",
                    valueTypeName: "Organisation  (record type)",
                    inheritedFromIri: "http://endhealth.info/im#Encounter",
                    inheritedFromName: "Encounter (record type)"
                  },
                  {
                    name: "is subencounter of",
                    iri: "http://endhealth.info/im#isSubEnctounterOf",
                    valueTypeIri: "http://endhealth.info/im#Encounter",
                    valueTypeName: "Encounter (record type)",
                    inheritedFromIri: "http://endhealth.info/im#Encounter",
                    inheritedFromName: "Encounter (record type)"
                  },
                  {
                    name: "has subject",
                    iri: "http://endhealth.info/im#hasSubject",
                    valueTypeIri: "http://snomed.info/sct#116154003",
                    valueTypeName: "Patient (person)",
                    inheritedFromIri: "http://endhealth.info/im#PatientHealthEvent",
                    inheritedFromName: "Patient health event (record type)"
                  },
                  {
                    name: "practitioner",
                    iri: "http://endhealth.info/im#hasPractitioner",
                    valueTypeIri: "http://endhealth.info/im#ThePractitionerInRole",
                    valueTypeName: "Practitioner in role  (record type)",
                    inheritedFromIri: "http://endhealth.info/im#PatientHealthEvent",
                    inheritedFromName: "Patient health event (record type)"
                  },
                  {
                    name: "date",
                    iri: "http://endhealth.info/im#date",
                    valueTypeIri: "http://www.w3.org/2001/XMLSchema#string",
                    valueTypeName: "string",
                    inheritedFromIri: "http://endhealth.info/im#HealthEvent",
                    inheritedFromName: "Health event (record type)"
                  },
                  {
                    name: "end date",
                    iri: "http://endhealth.info/im#endDate",
                    valueTypeIri: "http://www.w3.org/2001/XMLSchema#string",
                    valueTypeName: "string",
                    inheritedFromIri: "http://endhealth.info/im#HealthEvent",
                    inheritedFromName: "Health event (record type)"
                  }
                ]
              }
            ],
            leafNodes: []
          }
        ],
        leafNodes: []
      }
    ],
    leafNodes: []
  };

  beforeEach(() => {
    jest.resetAllMocks();
    EntityService.getEntityGraph = jest.fn().mockResolvedValue(GRAPH);
    mockRoute = {
      name: "Concept"
    };
    mockRouter = {
      push: jest.fn()
    };
    mockToast = {
      add: jest.fn()
    };

    wrapper = shallowMount(EntityChart, {
      global: {
        components: { ProgressSpinner, OrganizationChart },
        mocks: { $route: mockRoute, $router: mockRouter, $toast: mockToast }
      },
      props: { conceptIri: "http://endhealth.info/im#AccidentAndEmergencyEncounter" }
    });
  });

  it("starts with empty values", async () => {
    await flushPromises();
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.conceptIri).toBe("http://endhealth.info/im#AccidentAndEmergencyEncounter");
  });

  it("can watch conceptIri", () => {
    wrapper.vm.getGraph = jest.fn();
    wrapper.vm.$options.watch.conceptIri.call(wrapper.vm, "http://endhealth.info/im#DiscoveryOntology");
    expect(wrapper.vm.getGraph).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.getGraph).toHaveBeenCalledWith("http://endhealth.info/im#DiscoveryOntology");
  });

  it("calls getGraph on mounted", () => {
    expect(EntityService.getEntityGraph).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityGraph).toHaveBeenCalledWith("http://endhealth.info/im#AccidentAndEmergencyEncounter");
  });

  it("can getTypeFromIri ___ no #", () => {
    expect(wrapper.vm.getTypeFromIri("http://endhealth.info/im%badiri")).toBe("http://endhealth.info/im%badiri");
  });

  it("can getTypeFromIri ___ #", () => {
    expect(wrapper.vm.getTypeFromIri("http://endhealth.info/im#testIri")).toBe("TestIri");
  });

  it("can getTypeFromIri ___ # and :", () => {
    expect(wrapper.vm.getTypeFromIri("http://endhealth.info/im#test:Iri")).toBe("Iri");
  });

  it("can getGraph", async () => {
    await flushPromises();
    await wrapper.vm.$nextTick();
    wrapper.vm.getGraph("http://snomed.info/sct#298382003");
    expect(wrapper.vm.loading).toBe(true);
    expect(EntityService.getEntityGraph).toHaveBeenCalledTimes(2);
    expect(EntityService.getEntityGraph).toHaveBeenLastCalledWith("http://snomed.info/sct#298382003");
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.loading).toBe(false);
    expect(mockToast.add).not.toHaveBeenCalled();
    expect(wrapper.vm.graph).toStrictEqual(GRAPH);
  });

  it("can navigate", () => {
    wrapper.vm.navigate("http://endhealth.info/im#12345678");
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "Concept", params: { selectedIri: "http://endhealth.info/im#12345678" } });
  });

  it("can navigate __ no Iri", () => {
    wrapper.vm.navigate();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
