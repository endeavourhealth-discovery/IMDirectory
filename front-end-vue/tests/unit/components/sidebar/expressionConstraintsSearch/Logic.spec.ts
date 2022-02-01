import Logic from "@/components/sidebar/expressionConstraintsSearch/Logic.vue";
import { ECLType } from "@/models/expressionConstraintsLanguage/ECLType";
import { shallowMount } from "@vue/test-utils";
import Dropdown from "primevue/dropdown";

describe("Logic.vue ___ value", () => {
  let wrapper: any;

  beforeEach(() => {
    jest.resetAllMocks();

    const warn = console.warn;
    console.warn = jest.fn();
    wrapper = shallowMount(Logic, { props: { id: "logic_1", last: true, position: 1, value: "OR" }, global: { components: { Dropdown } } });
    console.warn = warn;
  });

  it("mounts", () => {
    expect(wrapper.vm.options).toStrictEqual(["AND", "OR", "MINUS"]);
    expect(wrapper.vm.selected).toBe("OR");
    expect(wrapper.vm.id).toBe("logic_1");
    expect(wrapper.vm.position).toBe(1);
    expect(wrapper.vm.last).toBe(true);
    expect(wrapper.vm.value).toBe("OR");
  });

  it("handles onConfirm", async () => {
    wrapper.vm.onConfirm();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().updateClicked).toBeTruthy();
    expect(wrapper.emitted().updateClicked[0]).toStrictEqual([
      {
        component: "Logic",
        id: "logic_1",
        label: "OR",
        position: 1,
        type: "logic",
        value: "OR"
      }
    ]);
  });

  it("handles deleteClicked", async () => {
    wrapper.vm.deleteClicked();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().deleteClicked).toBeTruthy();
    expect(wrapper.emitted().deleteClicked[0]).toStrictEqual([
      {
        component: "Logic",
        id: "logic_1",
        label: "OR",
        position: 1,
        type: "logic",
        value: "OR"
      }
    ]);
  });

  it("handles addNextClicked", async () => {
    wrapper.vm.addNextClicked();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().addNextOptionsClicked).toBeTruthy();
    expect(wrapper.emitted().addNextOptionsClicked[0]).toStrictEqual([
      {
        previousComponentType: ECLType.LOGIC,
        previousPosition: 1
      }
    ]);
  });
});

describe("Logic.vue ___ no value", () => {
  let wrapper: any;

  beforeEach(() => {
    jest.resetAllMocks();

    const warn = console.warn;
    console.warn = jest.fn();
    wrapper = shallowMount(Logic, { props: { id: "logic_1", last: true, position: 1, value: undefined }, global: { components: { Dropdown } } });
    console.warn = warn;
  });

  it("mounts", () => {
    expect(wrapper.vm.options).toStrictEqual(["AND", "OR", "MINUS"]);
    expect(wrapper.vm.selected).toBe("AND");
    expect(wrapper.vm.id).toBe("logic_1");
    expect(wrapper.vm.position).toBe(1);
    expect(wrapper.vm.last).toBe(true);
    expect(wrapper.vm.value).toBe(undefined);
  });
});
