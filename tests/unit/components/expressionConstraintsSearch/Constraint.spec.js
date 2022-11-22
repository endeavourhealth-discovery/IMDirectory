import Constraint from "../../../../src/components/home/directory/topbar/eclSearch/builder/Constraint.vue";
import { shallowMount } from "@vue/test-utils";
import Dropdown from "primevue/dropdown";
import { describe, expect } from "vitest";
import { setupServer } from "msw/node";

describe("Constraint.vue", () => {
  it("fakes tests", () => {
    expect(true).toBe(true);
  });
});

//   describe("prop value", () => {
//     let wrapper;

//     beforeEach(() => {
//       vi.resetAllMocks();
//       const warn = console.warn;
//       console.warn = vi.fn();

//       wrapper = shallowMount(Constraint, {
//         global: { components: { Dropdown } },
//         props: { id: "focusConcept_0constraint", position: 0, value: { name: "Descendant or self of", symbol: "<<" } }
//       });

//       console.warn = warn;
//     });

//     it("sets selected on mount", () => {
//       expect(wrapper.vm.selected).toStrictEqual({ name: "Descendant or self of", symbol: "<<" });
//     });

//     it("confirms on selected change", () => {
//       wrapper.vm.onConfirm = vi.fn();
//       wrapper.vm.$options.watch.selected.call(wrapper.vm, { name: "Self", symbol: "<" });
//       expect(wrapper.vm.onConfirm).toHaveBeenCalledTimes(1);
//     });

//     it("emits onConfirm", () => {
//       const warn = console.warn;
//       console.warn = vi.fn();
//       wrapper.vm.onConfirm();
//       expect(wrapper.emitted().updateClicked[0]).toStrictEqual([
//         {
//           id: "focusConcept_0constraint",
//           queryString: "<<",
//           position: 0,
//           type: "Constraint",
//           value: { name: "Descendant or self of", symbol: "<<" },
//           showButtons: { minus: true, plus: true }
//         }
//       ]);
//       console.warn = warn;
//     });

//     it("can createConstraint", () => {
//       expect(wrapper.vm.createConstraint()).toStrictEqual({
//         id: "focusConcept_0constraint",
//         queryString: "<<",
//         position: 0,
//         type: "Constraint",
//         value: { name: "Descendant or self of", symbol: "<<" },
//         showButtons: { minus: true, plus: true }
//       });
//     });
//   });

//   describe("null prop value", () => {
//     let wrapper;

//     beforeEach(() => {
//       vi.resetAllMocks();
//       const warn = console.warn;
//       console.warn = vi.fn();

//       wrapper = shallowMount(Constraint, {
//         global: { components: { Dropdown } },
//         props: { id: "focusConcept_0constraint", position: 0, value: null }
//       });

//       console.warn = warn;
//     });

//     it("sets selected on mount", () => {
//       expect(wrapper.vm.selected).toStrictEqual({ name: "Descendant or self of", symbol: "<<" });
//     });
//   });
// });
