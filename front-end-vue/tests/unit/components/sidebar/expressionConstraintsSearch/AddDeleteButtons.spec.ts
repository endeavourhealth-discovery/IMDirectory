import AddDeleteButtons from "@/components/sidebar/expressionConstraintsSearch/AddDeleteButtons.vue";
import { shallowMount } from "@vue/test-utils";
import Button from "primevue/button";

describe("AddDeleteButtons.vue", () => {
  let wrapper: any;

  beforeEach(() => {
    jest.resetAllMocks();

    wrapper = shallowMount(AddDeleteButtons, { props: { position: 0, last: true }, global: { components: { Button } } });
  });

  it("mounts", () => {
    expect(wrapper.vm.position).toBe(0);
    expect(wrapper.vm.last).toBe(true);
  });

  it("handles addNextClicked", async () => {
    wrapper.vm.addNextClicked();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().addNextClicked).toBeTruthy();
    expect(wrapper.emitted().addNextClicked[0]).toStrictEqual([]);
  });

  it("handles deleteClicked", async () => {
    wrapper.vm.deleteClicked();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().deleteClicked).toBeTruthy();
    expect(wrapper.emitted().deleteClicked[0]).toStrictEqual([]);
  });
});
