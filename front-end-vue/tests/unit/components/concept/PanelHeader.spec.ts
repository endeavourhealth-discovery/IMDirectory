import { shallowMount } from "@vue/test-utils";
import PanelHeader from "@/components/concept/PanelHeader.vue";

describe("PanelHeader.vue", () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = shallowMount(PanelHeader, {
      props: { types: [], header: "Scoliosis deformity of spine (disorder)" },
      global: { stubs: ["FontAwesomeIcon"] }
    });
  });

  it("can watch types", async () => {
    wrapper.vm.$options.watch.types.call(wrapper.vm, [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }]);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.color).toBe("color: #e39a3688");
    expect(wrapper.vm.icon).toStrictEqual(["far", "lightbulb"]);
  });

  it("can watch types ___ 0 length", async () => {
    wrapper.vm.$options.watch.types.call(wrapper.vm, []);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.color).toBe("");
    expect(wrapper.vm.icon).toStrictEqual([]);
  });

  it("renders header text", () => {
    expect(wrapper.get("#entity-panel-header-text").text()).toBe("Scoliosis deformity of spine (disorder)");
  });
});
