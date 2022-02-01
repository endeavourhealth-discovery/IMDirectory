import Operator from "@/components/sidebar/expressionConstraintsSearch/Operator.vue";
import { shallowMount } from "@vue/test-utils";
import Dropdown from "primevue/dropdown";

describe("Operator.vue ___prop value", () => {
  let wrapper: any;

  beforeEach(() => {
    jest.resetAllMocks();
    const warn = console.warn;
    console.warn = jest.fn();

    wrapper = shallowMount(Operator, {
      global: { components: { Dropdown } },
      props: { id: "focusConcept_0operator", position: 0, value: { name: "Equals", symbol: "=" } }
    });

    console.warn = warn;
  });

  it("sets selected on mount", () => {
    expect(wrapper.vm.selected).toStrictEqual({ name: "Equals", symbol: "=" });
  });

  it("confirms on selected change", () => {
    wrapper.vm.onConfirm = jest.fn();
    wrapper.vm.$options.watch.selected.call(wrapper.vm, { name: "Not equals", symbol: "!=" });
    expect(wrapper.vm.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("emits onConfirm", () => {
    const warn = console.warn;
    console.warn = jest.fn();
    wrapper.vm.onConfirm();
    expect(wrapper.emitted().updateClicked[0]).toStrictEqual([
      {
        component: "Operator",
        id: "focusConcept_0operator",
        label: "=",
        position: 0,
        type: "operator",
        value: { name: "Equals", symbol: "=" }
      }
    ]);
    console.warn = warn;
  });
});

describe("Operator.vue ___ null prop value", () => {
  let wrapper: any;

  beforeEach(() => {
    jest.resetAllMocks();
    const warn = console.warn;
    console.warn = jest.fn();

    wrapper = shallowMount(Operator, {
      global: { components: { Dropdown } },
      props: { id: "focusConcept_0operator", position: 0, value: null }
    });

    console.warn = warn;
  });

  it("sets selected on mount", () => {
    expect(wrapper.vm.selected).toStrictEqual({ name: "Equals", symbol: "=" });
  });
});
