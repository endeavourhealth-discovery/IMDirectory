import { render, fireEvent, within } from "@testing-library/vue";
import SearchResults from "@/components/shared/SearchResults.vue";
import Tooltip from "primevue/tooltip";
import MultiSelect from "primevue/multiselect";
import RadioButton from "primevue/radiobutton";
import PrimeVue from "primevue/config";
import { expect, it, vi } from "vitest";
import testData from "./SearchResults.testData";
import { createTestingPinia } from "@pinia/testing";
import RadioButton from "primevue/radiobutton";

createTestingPinia({
  initialState: {
    directory: {
      findInTreeIri: "",
      searchLoading: false,
      searchResults: testData.SEARCH_RESULTS
    },
    filter: {
      defaultFilterOptions: testData.FILTER_DEFAULTS,
      filterOptions: testData.FILTER_OPTIONS,
      selectedFilterOptions: testData.SELECTED_FILTERS
    },
    user: {
      favourites: ["http://snomed.info/sct#241193003"]
    }
  }
});

describe("SearchResultsTable.vue", () => {
  let component;

  beforeEach(async () => {
    vi.resetAllMocks();

    component = render(SearchResults, {
      global: {
        components: { MultiSelect, RadioButton },
        directives: { tooltip: Tooltip },
        plugins: [PrimeVue],
        stubs: { ResultsTable: true }
      },
      props: { searchTerm: "Scolio", updateSearch: false, showFilters: true }
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("sets filters from store", () => {
    component.getByText(testData.FILTER_DEFAULTS.status[0].name);
  });
});
