import { render } from "@testing-library/vue";
import LandingPage from "@/components/directory/LandingPage.vue";
import ProgressSpinner from "primevue/progressspinner";
import PrimeVue from "primevue/config";
import Card from "primevue/card";
import Chart from "primevue/chart";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Tooltip from "primevue/tooltip";
import OverlayPanel from "primevue/overlaypanel";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import testData from "./LandingPage.testData";
import { EntityService, ConfigService, DirectService, UserService } from "@/services";
import { flushPromises } from "@vue/test-utils";
import { it, vi } from "vitest";
import { createTestingPinia } from "@pinia/testing";

createTestingPinia({
  initialState: {
    user: {
      currentUser: {
        username: "Test"
      },
      recentLocalActivity: [{ iri: "http://snomed.info/sct#6081001", dateTime: "2022-09-22T15:57:56.778Z", action: "Viewed" }]
    }
  }
});

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
  let directToSpy;

  beforeEach(async () => {
    vi.resetAllMocks();
    getPartialSpy = vi.spyOn(EntityService, "getPartialEntity").mockResolvedValueOnce(testData.ONTOLOGY_OVERVIEW).mockResolvedValueOnce(testData.CONCEPT_TYPES);
    getPartialsSpy = vi.spyOn(EntityService, "getPartialEntities").mockResolvedValue([testData.ENTITY]);
    directToSpy = vi.spyOn(DirectService.prototype, "directTo");
    vi.useFakeTimers().setSystemTime(new Date("2022-09-23T12:18:59.78"));

    component = render(LandingPage, {
      global: {
        components: { ProgressSpinner, Card, DataTable, Column, Button, Chart, IMFontAwesomeIcon, OverlayPanel },
        directives: { Tooltip: Tooltip },
        plugins: [PrimeVue],
        stubs: {
          ActionButtons: true,
          Favourites: true
        }
      }
    });
    await flushPromises();
  });

  it("has recent activities", async () => {
    component.getByText(testData.ENTITY["http://www.w3.org/2000/01/rdf-schema#label"]);
  });

  it("sets activity time", () => {
    component.getByText("Viewed yesterday");
  });
});
