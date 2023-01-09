import { render, fireEvent, within } from "@testing-library/vue";
import LandingPage from "@/components/directory/LandingPage.vue";
import ProgressSpinner from "primevue/progressspinner";
import PrimeVue from "primevue/config";
import Card from "primevue/card";
import Chart from "primevue/chart";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Tooltip from "primevue/tooltip";
import testData from "./LandingPage.testData";
import { EntityService, ConfigService, DirectService } from "@/services";
import { flushPromises } from "@vue/test-utils";
import { afterAll, it, vi } from "vitest";

const mockDispatch = vi.fn();
const mockState = {
  recentLocalActivity: [{ iri: "http://snomed.info/sct#6081001", dateTime: "2022-09-22T15:57:56.778Z", app: "/viewer/#/" }]
};
const mockCommit = vi.fn();

vi.mock("vuex", () => ({
  useStore: () => ({
    dispatch: mockDispatch,
    state: mockState,
    commit: mockCommit
  })
}));

const mockPush = vi.fn();
const mockGo = vi.fn();
const mockRoute = { name: "Concept" };

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: mockPush,
    go: mockGo
  }),
  useRoute: () => mockRoute
}));

describe("LandingPage.vue", async () => {
  let component;
  let getPartialSpy;
  let getPartialsSpy;
  let getDashboardLayoutSpy;
  let directToSpy;

  beforeEach(async () => {
    vi.resetAllMocks();
    getPartialSpy = vi.spyOn(EntityService, "getPartialEntity").mockResolvedValueOnce(testData.ONTOLOGY_OVERVIEW).mockResolvedValueOnce(testData.CONCEPT_TYPES);
    getPartialsSpy = vi.spyOn(EntityService, "getPartialEntities").mockResolvedValue([testData.ENTITY]);
    getDashboardLayoutSpy = vi.spyOn(ConfigService, "getDashboardLayout").mockResolvedValue(testData.DASHBOARD_LAYOUT);
    directToSpy = vi.spyOn(DirectService.prototype, "directTo");
    vi.useFakeTimers().setSystemTime(new Date("2022-09-23T12:18:59.78"));

    component = render(LandingPage, {
      global: {
        components: { ProgressSpinner, Card, DataTable, Column, Button, Chart },
        directives: { Tooltip: Tooltip },
        plugins: [PrimeVue],
        stubs: {
          ReportTable: { template: "<span>Test Report Table</span>" },
          PieChartDashCard: { template: "<span>Test Pie Chart</span>" },
          ActionButtons: true
        }
      }
    });
    await flushPromises();
  });

  it("has recent activities", async () => {
    component.getByText(testData.ENTITY["http://www.w3.org/2000/01/rdf-schema#label"]);
  });

  it("sets activity time", () => {
    component.getByText("yesterday");
  });

  it("shows report table if in config", () => {
    component.getByText("Test Report Table");
  });

  it("shows pie chart if in config", () => {
    component.getByText("Test Pie Chart");
  });
});
