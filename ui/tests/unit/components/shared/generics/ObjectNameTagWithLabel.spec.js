import ObjectNameTagWithLabel from "../../../../../src/components/shared/generics/ObjectNameTagWithLabel.vue";
import { render } from "@testing-library/vue";
import Tag from "primevue/tag";
import { IM } from "@im-library/vocabulary";
import { it } from "vitest";
import { createTestingPinia } from "@pinia/testing";

createTestingPinia({
  initialState: {
    shared: {
      tagSeverityMatches: [
        { "@id": IM.ACTIVE, severity: "success" },
        { "@id": IM.DRAFT, severity: "warning" },
        { "@id": IM.INACTIVE, severity: "danger" }
      ]
    }
  }
});

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
