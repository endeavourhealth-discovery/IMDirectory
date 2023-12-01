import { render } from "@testing-library/vue";
import { beforeEach, describe, it } from "vitest";
import DirectorySplitter from "@/components/directory/DirectorySplitter.vue";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import PrimeVue from "primevue/config";
import { createTestingPinia } from "@pinia/testing";

createTestingPinia();

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

describe("Home.vue", () => {
  let component;

  beforeEach(() => {
    component = render(DirectorySplitter, {
      global: {
        components: { Splitter, SplitterPanel },
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
