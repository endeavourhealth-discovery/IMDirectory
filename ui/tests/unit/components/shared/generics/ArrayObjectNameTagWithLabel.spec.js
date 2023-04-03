import { render } from "@testing-library/vue";
import ArrayObjectNameTagWithLabel from "@/components/shared/generics/ArrayObjectNameTagWithLabel.vue";
import Tag from "primevue/tag";
import { IM } from "@im-library/vocabulary";
import { expect } from "vitest";

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

describe("ArrayObjectNameTagWithLabel.vue ___ single", () => {
  let component;

  beforeEach(() => {
    vi.resetAllMocks();

    component = render(ArrayObjectNameTagWithLabel, {
      global: { components: { Tag } },
      props: { label: "Status", size: "50%", data: [{ "@id": "http://endhealth.info/im#Active", name: "Active" }], show: true }
    });
  });

  it("mounts", () => {
    component.getByText("Status:");
    expect(component.getAllByTestId("data-tag").length).toBe(1);
    component.getByText("Active");
  });
});

describe("ArrayObjectNameTagWithLabel.vue ___ multiple", () => {
  let component;

  beforeEach(() => {
    vi.resetAllMocks();

    component = render(ArrayObjectNameTagWithLabel, {
      global: { components: { Tag } },
      props: {
        label: "Status",
        size: "50%",
        data: [
          { "@id": "http://endhealth.info/im#Active", name: "Active" },
          { "@id": "http://endhealth.info/im#Draft", name: "Draft" }
        ],
        show: true
      }
    });
  });

  it("mounts", () => {
    component.getByText("Status:");
    expect(component.getAllByTestId("data-tag").length).toBe(2);
    component.getByText("Active");
    component.getByText("Draft");
  });
});
