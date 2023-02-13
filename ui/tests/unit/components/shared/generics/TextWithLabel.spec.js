import { render, fireEvent, within } from "@testing-library/vue";
import TextWithLabel from "@/components/shared/generics/TextWithLabel.vue";

describe("TextWithLabel.vue", () => {
  let component;

  beforeEach(() => {
    vi.resetAllMocks();

    component = render(TextWithLabel, {
      props: { label: "Name", data: "Scoliosis", size: "50%", show: true }
    });
  });

  it("renders props", () => {
    component.getByText("Name:");
    component.getByText("Scoliosis");
  });
});
