import { render } from "@testing-library/vue";
import { beforeEach, describe, it } from "vitest";
import DirectorySplitter from "@/components/directory/DirectorySplitter.vue";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import ProgressSpinner from "primevue/progressspinner";
import PrimeVue from "primevue/config";
import { createTestingPinia } from "@pinia/testing";

createTestingPinia();

const mockPush = vi.fn();
const mockGo = vi.fn();
const mockIsReady = vi.fn();
const mockRoute = { name: "Concept" };

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: mockPush,
    go: mockGo,
    isReady: mockIsReady
  }),
  useRoute: () => mockRoute
}));

describe("Home.vue", () => {
  let component;

  beforeEach(() => {
    component = render(DirectorySplitter, {
      global: {
        components: { Splitter, SplitterPanel, ProgressSpinner },
        stubs: ["router-view", "InfoSideBar", "NavTree"],
        plugins: [PrimeVue],
        mocks: {}
      }
    });
  });

  it("mounts", () => {
    component.getByTestId("splitter-right");
    component.getByTestId("splitter-left");
  });
});
