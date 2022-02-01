import { flushPromises, shallowMount } from "@vue/test-utils";
import Dashboard from "@/views/Dashboard.vue";
import ReportTable from "@/components/dashboard/ReportTable.vue";
import PieChartDashCard from "@/components/dashboard/PieChartDashCard.vue";
import ProgressSpinner from "primevue/progressspinner";
import ConfigService from "@/services/ConfigService";
import EntityService from "@/services/EntityService";

describe("Dashboard.vue", () => {
  let wrapper: any;

  const CONFIGS = [
    { size: "100%", type: "ReportTable", order: 100, iri: "http://endhealth.info/im#ontologyOverview" },
    { size: "50%", type: "ReportPieChart", order: 200, iri: "http://endhealth.info/im#ontologyConceptTypes" },
    { size: "50%", type: "ReportPieChart", order: 300, iri: "http://endhealth.info/im#ontologyConceptSchemes" },
    { size: "50%", type: "ReportPieChart", order: 400, iri: "http://endhealth.info/im#ontologyConceptStatus" }
  ];

  beforeEach(async () => {
    jest.resetAllMocks();

    ConfigService.getDashboardLayout = jest.fn().mockResolvedValue(CONFIGS);

    EntityService.getPartialEntity = jest.fn().mockResolvedValue({
      "@id": "http://endhealth.info/im#ontologyConceptStatus",
      "http://endhealth.info/im#hasStatsReportEntry": [
        {
          "http://www.w3.org/2002/07/owl#hasValue": 845257,
          "http://www.w3.org/2000/01/rdf-schema#label": "Active"
        },
        {
          "http://www.w3.org/2002/07/owl#hasValue": 283694,
          "http://www.w3.org/2000/01/rdf-schema#label": "Inactive"
        },
        {
          "http://www.w3.org/2002/07/owl#hasValue": 1296,
          "http://www.w3.org/2000/01/rdf-schema#label": "Draft"
        }
      ],
      "http://www.w3.org/2000/01/rdf-schema#comment": "A brief overview of the status of concepts stored in the Ontology",
      "http://www.w3.org/2000/01/rdf-schema#label": "Ontology concept status"
    });

    wrapper = shallowMount(Dashboard, {
      global: {
        components: { ReportTable, PieChartDashCard, ProgressSpinner }
      }
    });

    await flushPromises();
    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  it("starts with correct data", () => {
    expect(wrapper.vm.cardsData).toStrictEqual([
      {
        component: "ReportTable",
        description: "A brief overview of the status of concepts stored in the Ontology",
        inputData: [
          {
            "http://www.w3.org/2000/01/rdf-schema#label": "Active",
            "http://www.w3.org/2002/07/owl#hasValue": 845257
          },
          {
            "http://www.w3.org/2000/01/rdf-schema#label": "Inactive",
            "http://www.w3.org/2002/07/owl#hasValue": 283694
          },
          {
            "http://www.w3.org/2000/01/rdf-schema#label": "Draft",
            "http://www.w3.org/2002/07/owl#hasValue": 1296
          }
        ],
        name: "Ontology concept status"
      },
      {
        component: "ReportPieChart",
        description: "A brief overview of the status of concepts stored in the Ontology",
        inputData: [
          {
            "http://www.w3.org/2000/01/rdf-schema#label": "Active",
            "http://www.w3.org/2002/07/owl#hasValue": 845257
          },
          {
            "http://www.w3.org/2000/01/rdf-schema#label": "Inactive",
            "http://www.w3.org/2002/07/owl#hasValue": 283694
          },
          {
            "http://www.w3.org/2000/01/rdf-schema#label": "Draft",
            "http://www.w3.org/2002/07/owl#hasValue": 1296
          }
        ],
        name: "Ontology concept status"
      },
      {
        component: "ReportPieChart",
        description: "A brief overview of the status of concepts stored in the Ontology",
        inputData: [
          {
            "http://www.w3.org/2000/01/rdf-schema#label": "Active",
            "http://www.w3.org/2002/07/owl#hasValue": 845257
          },
          {
            "http://www.w3.org/2000/01/rdf-schema#label": "Inactive",
            "http://www.w3.org/2002/07/owl#hasValue": 283694
          },
          {
            "http://www.w3.org/2000/01/rdf-schema#label": "Draft",
            "http://www.w3.org/2002/07/owl#hasValue": 1296
          }
        ],
        name: "Ontology concept status"
      },
      {
        component: "ReportPieChart",
        description: "A brief overview of the status of concepts stored in the Ontology",
        inputData: [
          {
            "http://www.w3.org/2000/01/rdf-schema#label": "Active",
            "http://www.w3.org/2002/07/owl#hasValue": 845257
          },
          {
            "http://www.w3.org/2000/01/rdf-schema#label": "Inactive",
            "http://www.w3.org/2002/07/owl#hasValue": 283694
          },
          {
            "http://www.w3.org/2000/01/rdf-schema#label": "Draft",
            "http://www.w3.org/2002/07/owl#hasValue": 1296
          }
        ],
        name: "Ontology concept status"
      }
    ]);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.configs).toStrictEqual(CONFIGS);
  });

  it("inits", async () => {
    wrapper.vm.getConfigs = jest.fn();
    wrapper.vm.getCardsData = jest.fn();
    wrapper.vm.init();
    expect(wrapper.vm.loading).toBe(true);
    await flushPromises();
    expect(wrapper.vm.getConfigs).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.getCardsData).toHaveBeenCalledTimes(1);
  });

  it("can getConfigs ___ data", async () => {
    wrapper.vm.configs = [];
    wrapper.vm.getConfigs();
    await flushPromises();
    expect(wrapper.vm.configs).toStrictEqual(CONFIGS);
  });

  it("can getConfigs ___ no data", async () => {
    wrapper.vm.configs = [];
    ConfigService.getDashboardLayout = jest.fn().mockResolvedValue([]);
    wrapper.vm.getConfigs();
    await flushPromises();
    expect(wrapper.vm.configs).toStrictEqual([]);
  });

  it("can getCardsData ___ servic error", async () => {
    EntityService.getPartialEntity = jest.fn().mockResolvedValue({});
    wrapper.vm.cardsData = [] as { name: string; description: string; inputData: any; component: string }[];
    wrapper.vm.getCardsData();
    await flushPromises();
    expect(wrapper.vm.cardsData).toStrictEqual([]);
  });
});
