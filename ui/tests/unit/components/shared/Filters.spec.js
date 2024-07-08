import { flushPromises } from "@vue/test-utils";
import Filters from "@/components/shared/Filters.vue";
import MultiSelect from "primevue/multiselect";
import ToggleSwitch from "primevue/toggleswitch";
import Tooltip from "primevue/tooltip";
import Button from "primevue/button";
import Select from "primevue/select";
import testData from "./Filters.testData";
import { render } from "@testing-library/vue";
import PrimeVue from "primevue/config";
import { beforeEach, describe, it, vi } from "vitest";
import { createTestingPinia } from "@pinia/testing";

createTestingPinia({
  initialState: {
    filter: {
      filterOptions: testData.FILTER_OPTIONS,
      defaultFilterOptions: testData.FILTER_DEFAULTS,
      selectedFilterOptions: testData.SELECTED_FILTERS,
      quickFiltersStatus: testData.QUICK_FILTER_STATUS
    }
  }
});

describe("Filters.vue", () => {
  let component;
  let mockSearch;

  beforeEach(async () => {
    mockSearch = vi.fn();
    component = render(Filters, {
      props: { search: mockSearch },
      global: {
        components: { MultiSelect, ToggleSwitch, Button, Select },
        directives: { Tooltip: Tooltip },
        plugins: [PrimeVue]
      }
    });
    await flushPromises();
    vi.clearAllMocks();
  });

  it("sets filters to defaults", () => {
    testData.SELECTED_FILTERS.status.forEach(status => {
      component.getByText(status.name);
    });
    testData.SELECTED_FILTERS.schemes.forEach(scheme => {
      component.getByText(scheme.name);
    });
    testData.SELECTED_FILTERS.types
      .filter(type => type.name !== "Data model/Node shape ")
      .forEach(type => {
        component.getByText(`${type.name}`);
      });
  });
});
