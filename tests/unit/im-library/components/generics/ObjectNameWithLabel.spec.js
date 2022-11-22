import { render, fireEvent, within } from "@testing-library/vue";
import ObjectNameWithLabel from "../../../../src/components/modules/generics/ObjectNameWithLabel.vue";
import LoggerService from "../../../../src/services/modules/LoggerService";

describe("ObjectNameWithLabel.vue", () => {
  let component;

  beforeEach(() => {
    vi.resetAllMocks();
    component = render(ObjectNameWithLabel, {
      props: { label: "Status", data: { name: "Active" }, size: "50%", show: true }
    });
  });

  it("can mount and check is object with name", () => {
    component.getByText("Status:");
    component.getByText("Active");
  });
});

describe("ObjectNameWithLabel.vue ___ missing name", () => {
  let component;

  beforeEach(() => {
    vi.resetAllMocks();
    component = render(ObjectNameWithLabel, {
      props: { label: "Status", data: {}, size: "50%", show: true }
    });
  });

  it("can mount and check is object with name", () => {
    component.getByText("Status:");
    component.getByText("None");
  });
});
