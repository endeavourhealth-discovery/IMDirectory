import { beforeEach, describe, expect, it, vi } from "vitest";
import SearchBar from "@/components/shared/SearchBar.vue";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import OverlayPanel from "primevue/overlaypanel";
import testData from "./SearchBar.testData";
import PrimeVue from "primevue/config";
import SplitButton from "primevue/splitbutton";
import Tooltip from "primevue/tooltip";
import { fireEvent, render } from "@testing-library/vue";
import { createTestingPinia } from "@pinia/testing";
import { useFilterStore } from "@/stores/filterStore.ts";
import { EntityService, QueryService } from "@/services";

createTestingPinia({
  initialState: {
    filter: {
      selectedFilters: testData.SELECTED_FILTERS
    }
  }
});
const mockFilterStore = useFilterStore();

const mockOpen = vi.fn();
const mockClose = vi.fn();
vi.mock("primevue/usedialog", () => ({
  useDialog: () => ({
    open: mockOpen,
    close: mockClose
  }),
  useRoute: () => mockRoute
}));

describe("SearchBar.vue", () => {
  let component;
  let queryIMSearchSpy;
  let queryIMSpy;

  beforeEach(() => {
    vi.resetAllMocks();
    queryIMSearchSpy = vi.spyOn(QueryService, "queryIMSearch").mockResolvedValue(testData.SEARCH_RESULTS);
    queryIMSpy = vi.spyOn(QueryService, "queryIM").mockResolvedValue(testData.SEARCH_RESULTS);
    component = render(SearchBar, {
      global: {
        components: { InputText, Button, OverlayPanel, SplitButton },
        plugins: [PrimeVue],
        stubs: { Filters: true },
        directives: { tooltip: Tooltip }
      },
      props: { searchResults: [], searchLoading: false, loadMore: { page: 1, count: 20 }, download: { term: "Scolio", count: 355 }, showFilters: true }
    });
  });

  it("searches when user inputs", async () => {
    const input = component.getByTestId("search-input");
    await fireEvent.update(input, "Scoliosis");
    await new Promise(resolve => setTimeout(resolve, 1000));
    expect(component.emitted()).toHaveProperty("toSearch");
  });

  it("opens filters", async () => {
    const button = component.getByTestId("filters-open-button");
    expect(component.queryByTestId("filters")).toBeNull();
    await fireEvent.click(button);
    component.getByTestId("filters");
  });
});
