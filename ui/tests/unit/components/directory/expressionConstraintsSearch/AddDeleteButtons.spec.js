import AddDeleteButtons from "@/components/directory/topbar/eclSearch/AddDeleteButtons.vue";
import { shallowMount } from "@vue/test-utils";
import { ECLComponent } from "@im-library/enums";
import Button from "primevue/button";
import { vi } from "vitest";

describe("AddDeleteButtons.vue", () => {
  let wrapper;
  let mockRef;

  beforeEach(() => {
    vi.resetAllMocks();

    mockRef = { render: () => {}, methods: { toggle: vi.fn() } };

    wrapper = shallowMount(AddDeleteButtons, {
      props: { position: 0, show: { minus: true, plus: true }, options: [ECLComponent.FOCUS_CONCEPT] },
      global: { components: { Button }, stubs: { Menu: mockRef } }
    });
  });

  it("mounts", () => {
    expect(wrapper.vm.position).toBe(0);
    expect(wrapper.vm.show).toStrictEqual({ minus: true, plus: true });
  });

  // it("handles addNextClicked", async () => {
  //   wrapper.vm.addNextClicked(true);
  //   await wrapper.vm.$nextTick();
  //   expect(mockRef.methods.toggle).toHaveBeenCalledTimes(1);
  // });

  // it("handles deleteClicked", async () => {
  //   wrapper.vm.deleteClicked();
  //   await wrapper.vm.$nextTick();
  //   expect(wrapper.emitted().deleteClicked).toBeTruthy();
  //   expect(wrapper.emitted().deleteClicked[0]).toStrictEqual([]);
  // });
});
