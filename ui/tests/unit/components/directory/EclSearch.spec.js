import { render, fireEvent } from "@testing-library/vue";
import ExpressionConstraintsSearch from "@/components/directory/EclSearch.vue";
import { flushPromises } from "@vue/test-utils";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import MultiSelect from "primevue/multiselect";
import testData from "./EclSearch.testData";
import { EclService } from "@/services";
import { expect, it } from "vitest";
import { fakerFactory } from "@im-library/mocks/fakerFactory";
import VueClipboard from "vue3-clipboard";
import Tooltip from "primevue/tooltip";
import { createTestingPinia } from "@pinia/testing";

createTestingPinia({
  initialState: {
    filter: {
      filterOptions: {
        status: [
          { "@id": "http://endhealth.info/im#Active", name: "Active" },
          { "@id": "http://endhealth.info/im#Draft", name: "Draft" },
          { "@id": "http://endhealth.info/im#Inactive", name: "Inactive" },
          { "@id": "http://endhealth.info/im#Unassigned", name: "Unassigned" }
        ]
      }
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

const mockAdd = vi.fn();

vi.mock("primevue/usetoast", () => ({
  useToast: () => ({
    add: mockAdd
  })
}));

const mockOpen = vi.fn();
const mockClose = vi.fn();

vi.mock("primevue/useDialog", () => ({
  useDialog: () => ({
    open: mockOpen,
    close: mockClose
  })
}));

describe("EclSearch.vue", async () => {
  let component;
  let mockECLSearch;
  let mockGetQueryFromECL;
  let mockTotalCount;

  beforeEach(async () => {
    vi.resetAllMocks();

    mockECLSearch = vi.spyOn(EclService, "ECLSearch").mockResolvedValue({ count: testData.SEARCH_RESULTS.length, page: 1, entities: testData.SEARCH_RESULTS });
    mockGetQueryFromECL = vi.spyOn(EclService, "getQueryFromECL").mockResolvedValue({ from: { "@id": "testQuery" } });
    mockTotalCount = vi.spyOn(EclService, "eclSearchTotalCount").mockResolvedValue(testData.SEARCH_RESULTS.length);

    component = render(ExpressionConstraintsSearch, {
      global: {
        components: { Textarea, Button, MultiSelect },
        directives: {
          tooltip: Tooltip
        },
        stubs: { SearchResults: true, Builder: true, ResultsTable: true },
        plugins: [
          app =>
            VueClipboard(app, {
              autoSetContainer: true,
              appendToBody: true
            })
        ]
      }
    });

    await flushPromises();
    vi.clearAllMocks();
  });

  it("mounts", () => {
    component.getByText("ECL expression:");
  });

  it("searches", async () => {
    const textbox = component.getByTestId("query-string");
    await fireEvent.update(textbox, "<< 10363601000001109 |UK product|");
    component.getByDisplayValue("<< 10363601000001109 |UK product|");
    const search = component.getByTestId("search-button");
    await fireEvent.click(search);
    await flushPromises();
    expect(mockECLSearch).toHaveBeenCalledTimes(1);
  });

  it("opens builder overlay", async () => {
    const button = component.getByTestId("builder-button");
    await fireEvent.click(button);
    component.getByTestId("builder-visible-true");
  });

  it.skip("handles >1000 results", async () => {
    const largeSearchResults = [];
    for (let i = 1; i <= 1100; ) {
      const newSummary = fakerFactory.conceptSummary.create();
      if (largeSearchResults.findIndex(sr => sr.iri === newSummary.iri) === -1) {
        largeSearchResults.push(fakerFactory.conceptSummary.create());
        i++;
      }
    }
    mockECLSearch.mockResolvedValue({ count: largeSearchResults.length, page: 1, entities: largeSearchResults });
    const textbox = component.getByTestId("query-string");
    await fireEvent.update(textbox, "<< 10363601000001109 |UK product|");
    component.getByDisplayValue("<< 10363601000001109 |UK product|");
    const search = component.getByTestId("search-button");
    await fireEvent.click(search);
    await flushPromises();
    component.getByText("1100 results found. Display limited to first 1000.");
  });

  it("toasts on copy", async () => {
    const textbox = component.getByTestId("query-string");
    await fireEvent.update(textbox, "<< 10363601000001109 |UK product|");
    component.getByDisplayValue("<< 10363601000001109 |UK product|");
    const button = component.getByTestId("copy-to-clipboard-button");
    await fireEvent.click(button);
    await flushPromises();
    expect(mockAdd).toHaveBeenCalledOnce();
  });
});
