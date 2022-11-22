import ObjectNameTagWithLabel from "../../../../src/components/modules/generics/ObjectNameTagWithLabel.vue";
import { render, fireEvent, within } from "@testing-library/vue";
import Tag from "primevue/tag";
import LoggerService from "../../../../src/services/modules/LoggerService";
import { IM } from "../../../../src/vocabulary/IM";
import { it } from "vitest";

const mockDispatch = vi.fn();
const mockState = {
  tagSeverityMatches: [
    { "@id": IM.ACTIVE, severity: "success" },
    { "@id": IM.DRAFT, severity: "warning" },
    { "@id": IM.INACTIVE, severity: "danger" }
  ]
};
const mockCommit = vi.fn();

vi.mock("vuex", () => ({
  useStore: () => ({
    dispatch: mockDispatch,
    state: mockState,
    commit: mockCommit
  })
}));

describe("ObjectNameTagWithLabel.vue", () => {
  let component;

  beforeEach(() => {
    vi.resetAllMocks();

    component = render(ObjectNameTagWithLabel, {
      global: { components: { Tag } },
      props: { label: "Status", data: { "@id": "http://endhealth.info/im#Active", name: "Active" }, size: "100%", show: true }
    });
  });

  it("shows tag and label", () => {
    component.getByText("Status:");
    component.getByText("Active");
  });
});

describe("ObjectNameTagWithLabel.vue ___ missing name", () => {
  let component;

  beforeEach(() => {
    vi.resetAllMocks();

    component = render(ObjectNameTagWithLabel, {
      global: { components: { Tag } },
      props: { label: "Status", data: { "@id": "http://endhealth.info/im#Active" }, size: "100%", show: true }
    });
  });

  it("shows tag and label", () => {
    component.getByText("Status:");
    component.getByText("None");
  });
});
