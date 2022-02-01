import { shallowMount } from "@vue/test-utils";
import TextWithLabel from "@/components/generics/TextWithLabel.vue";

describe("TextWithLabel.vue", () => {
  let wrapper: any;

  beforeEach(() => {
    jest.resetAllMocks();

    wrapper = shallowMount(TextWithLabel, {
      props: { label: "Name", data: "Scoliosis", size: "50%" }
    });
  });

  it("renders props", () => {
    const label = wrapper.get(".label");
    const data = wrapper.get(".data");
    expect(label.text()).toBe("Name:");
    expect(data.text()).toBe("Scoliosis");
  });
});
