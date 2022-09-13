import Operator from "@/components/eclSearch/builder/Operator.vue";
import { shallowMount } from "@vue/test-utils";
import Dropdown from "primevue/dropdown";
import { setupServer } from "msw/node";

describe("Operator.vue", () => {
  const restHandlers = [];
  const server = setupServer(...restHandlers);

  beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
  });

  afterAll(() => {
    server.close();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe("prop value", () => {
    let wrapper;

    beforeEach(() => {
      vi.resetAllMocks();
      const warn = console.warn;
      console.warn = vi.fn();

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
      wrapper.vm.onConfirm = vi.fn();
      wrapper.vm.$options.watch.selected.call(wrapper.vm, { name: "Not equals", symbol: "!=" });
      expect(wrapper.vm.onConfirm).toHaveBeenCalledTimes(1);
    });

    it("emits onConfirm", () => {
      const warn = console.warn;
      console.warn = vi.fn();
      wrapper.vm.onConfirm();
      expect(wrapper.emitted().updateClicked[0]).toStrictEqual([
        {
          id: "focusConcept_0operator",
          queryString: "=",
          position: 0,
          type: "Operator",
          value: { name: "Equals", symbol: "=" },
          showButtons: { minus: true, plus: true }
        }
      ]);
      console.warn = warn;
    });
  });

  describe("null prop value", () => {
    let wrapper;

    beforeEach(() => {
      vi.resetAllMocks();
      const warn = console.warn;
      console.warn = vi.fn();

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
});
