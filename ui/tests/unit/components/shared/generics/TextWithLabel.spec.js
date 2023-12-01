import { render } from "@testing-library/vue";
import TextWithLabel from "@/components/shared/generics/TextWithLabel.vue";
import PrimeVue from "primevue/config";

const mockAdd = vi.fn();

vi.mock("primevue/usetoast", () => ({
  useToast: () => ({
    add: mockAdd
  })
}));

describe("TextWithLabel.vue", () => {
  let component;

  beforeEach(() => {
    vi.resetAllMocks();

    component = render(TextWithLabel, {
      props: { label: "Name", data: "Scoliosis", size: "50%", show: true },
      global: { plugins: [PrimeVue], directives: { tooltip: true, clipboard: true } }
    });
  });

  it("renders props", () => {
    component.getByText("Name:");
    component.getByText("Scoliosis");
  });
});
