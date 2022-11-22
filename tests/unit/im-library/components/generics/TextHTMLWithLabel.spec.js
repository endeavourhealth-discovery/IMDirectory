import { render, fireEvent, within } from "@testing-library/vue";
import TextHTMLWithLabel from "../../../../src/components/modules/generics/TextHTMLWithLabel.vue";

describe("TextHTMLWithLabel.vue", () => {
  let component;

  beforeEach(() => {
    vi.resetAllMocks();

    component = render(TextHTMLWithLabel, {
      props: {
        label: "Description",
        data: "An entry recording information about a criticial care encounter.<p>common data model attributes for Critical care encounter",
        size: "100%",
        id: "TextHTMLWithLabel1",
        show: true
      }
    });
  });

  it("can render props", () => {
    component.getByText("Description:");
    component.getByText("An entry recording information about a criticial care encounter.");
    component.getByText("common data model attributes for Critical care encounter");
  });
});
