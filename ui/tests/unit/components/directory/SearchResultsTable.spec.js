import { render, fireEvent, within } from "@testing-library/vue";
import SearchResultsTable from "@/components/directory/SearchResultsTable.vue";
import DataTable from "primevue/datatable";
import ProgressSpinner from "primevue/progressspinner";
import Column from "primevue/column";
import OverlayPanel from "primevue/overlaypanel";
import Tooltip from "primevue/tooltip";
import ContextMenu from "primevue/contextmenu";
import VueClipboard from "vue3-clipboard";
import Button from "primevue/button";
import MultiSelect from "primevue/multiselect";
import PrimeVue from "primevue/config";
import { DirectService } from "@/services";
import { expect, it, vi } from "vitest";
import testData from "./SearchResultsTable.testData";
import { createTestingPinia } from "@pinia/testing";
import { useSharedStore } from "@/stores/sharedStore.js";

Object.assign(navigator, {
  clipboard: {
    writeText: () => {}
  }
});

createTestingPinia({
  initialState: {
    root: {
      searchLoading: false,
      filterDefaults: testData.FILTER_DEFAULTS,
      filterOptions: testData.FILTER_OPTIONS,
      selectedFilters: testData.SELECTED_FILTERS,
      searchResults: testData.SEARCH_RESULTS,
      favourites: ["http://snomed.info/sct#241193003"],
      findInTreeIri: ""
    }
  }
});
const mockState = useSharedStore();

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

describe("SearchResultsTable.vue", () => {
  let component;
  let directToSpy;
  let clipboardSpy;
  let docSpy;

  beforeEach(async () => {
    vi.resetAllMocks();
    clipboardSpy = vi.spyOn(navigator.clipboard, "writeText");
    docSpy = vi.spyOn(document, "getElementById");
    docSpy.mockReturnValue(undefined);
    directToSpy = vi.spyOn(DirectService.prototype, "directTo");

    component = render(SearchResultsTable, {
      global: {
        components: { DataTable, ProgressSpinner, Column, OverlayPanel, ContextMenu, Button, MultiSelect },
        directives: { tooltip: Tooltip, clipboard: VueClipboard },
        plugins: [PrimeVue]
      }
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("displays first page of search results", () => {
    component.getByText(mockState.searchResults[0].name + " | " + mockState.searchResults[0].code);
    component.getByText(mockState.searchResults[19].name + " | " + mockState.searchResults[19].code);
    const aboveLimit = component.queryByText(mockState.searchResults[20].name);
    expect(aboveLimit).toBeFalsy();
  });

  it("pages additional results", () => {
    const buttons = component.getAllByRole("button");
    const paginatorButtons = buttons.filter(button => button.classList.contains("p-paginator-page"));
    expect(paginatorButtons.length).toBeGreaterThan(1);
  });

  it("identifies favourites", () => {
    const rows = component.getAllByRole("row");
    const favourite = rows.filter(item => within(item).queryByText(mockState.searchResults[0].name + " | " + mockState.searchResults[0].code))[0];
    const buttons = within(favourite).getAllByRole("button");
    const favButton = buttons.filter(button => button.classList.contains("row-button-fav"));
    expect(favButton).toBeTruthy();
  });

  it("shows page 2", async () => {
    const buttons = component.getAllByRole("button");
    const paginatorButtons = buttons.filter(button => button.classList.contains("p-paginator-page"));
    await fireEvent.click(paginatorButtons[1]);
    component.getByText(mockState.searchResults[20].name + " | " + mockState.searchResults[20].code);
  });

  it("routes on edit", async () => {
    vi.clearAllMocks();
    const edit = component.getAllByTestId("edit-button")[0];
    await fireEvent.click(edit);
    expect(directToSpy).toHaveBeenCalledTimes(1);
    expect(directToSpy).toHaveBeenLastCalledWith("/#/", "http://snomed.info/sct#241193003", "Edited", "editor");
  });

  it("can unfavourite", async () => {
    vi.clearAllMocks();
    let rows = component.getAllByRole("row");
    let favourite = rows.filter(item => within(item).queryByText(mockState.searchResults[0].name + " | " + mockState.searchResults[0].code))[0];
    let favButton = within(favourite).getByTestId("unfavourite-button");
    await fireEvent.click(favButton);
    expect(mockState.updateFavourites).toHaveBeenCalledTimes(1);
  });

  it("can favourite", async () => {
    vi.clearAllMocks();
    let rows = component.getAllByRole("row");
    let favourite = rows.filter(item => within(item).queryByText(mockState.searchResults[1].name + " | " + mockState.searchResults[1].code))[0];
    let favButton = within(favourite).getByTestId("favourite-button");
    await fireEvent.click(favButton);
    expect(mockState.updateFavourites).toHaveBeenCalledTimes(1);
  });
});
