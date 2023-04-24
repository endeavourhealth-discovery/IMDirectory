import { beforeEach, describe, expect, it, vi } from "vitest";
import Search from "@/components/directory/topbar/Search.vue";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import OverlayPanel from "primevue/overlaypanel";
import testData from "./Search.testData";
import PrimeVue from "primevue/config";
import SplitButton from "primevue/splitbutton";
import { fireEvent, render } from "@testing-library/vue";
import { createTestingPinia } from "@pinia/testing";
import { useRootStore } from "@/stores/root";

createTestingPinia({
  initialState: {
    root: {
      selectedFilters: testData.SELECTED_FILTERS
    }
  }
});
const mockStore = useRootStore();

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

describe("Search.vue", () => {
  let component;

  beforeEach(() => {
    vi.resetAllMocks();
    component = render(Search, {
      global: {
        components: { InputText, Button, OverlayPanel, SplitButton },
        plugins: [PrimeVue],
        stubs: { Filters: true }
      }
    });
  });


  it("searches when user inputs", async () => {
    const input = component.getByTestId("search-input");
    await fireEvent.update(input, "Scoliosis");
    expect(mockPush).toHaveBeenCalledOnce();
    expect(mockPush).toHaveBeenCalledWith({ name: "Search" });
    expect(mockStore.updateSearchLoading).toHaveBeenCalledTimes(2);
    expect(mockStore.fetchSearchResults).toHaveBeenCalledOnce();
  });

  it("opens filters", async () => {
    const button = component.getByTestId("filters-open-button");
    expect(component.queryByTestId("filters")).toBeNull();
    await fireEvent.click(button);
    component.getByTestId("filters");
  });
});
