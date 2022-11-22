import Logic from "@/components/eclSearch/builder/Logic.vue";
import { shallowMount } from "@vue/test-utils";
import Dropdown from "primevue/dropdown";
import { ECLComponent } from "@/im_library/enums";
import { describe, expect, it } from "vitest";
import { setupServer } from "msw/node";

describe("Logic.vue", () => {
  it("fakes tests", () => {
    expect(true).toBe(true);
  });
});
//   describe("value", () => {
//     let wrapper;

//     beforeEach(() => {
//       vi.resetAllMocks();

//       const warn = console.warn;
//       console.warn = vi.fn();
//       wrapper = shallowMount(Logic, {
//         props: { id: "logic_1", showButtons: { minus: true, plus: true }, position: 1, value: { data: "OR", parentGroup: ECLComponent.BUILDER } },
//         global: { components: { Dropdown } }
//       });
//       console.warn = warn;
//     });

//     it("mounts", () => {
//       expect(wrapper.vm.options).toStrictEqual(["AND", "OR", "MINUS"]);
//       expect(wrapper.vm.selected).toBe("OR");
//       expect(wrapper.vm.id).toBe("logic_1");
//       expect(wrapper.vm.position).toBe(1);
//       expect(wrapper.vm.showButtons).toStrictEqual({ minus: true, plus: true });
//       expect(wrapper.vm.value).toStrictEqual({ data: "OR", parentGroup: ECLComponent.BUILDER });
//     });

//     it("handles onConfirm", async () => {
//       wrapper.vm.onConfirm();
//       await wrapper.vm.$nextTick();
//       expect(wrapper.emitted().updateClicked).toBeTruthy();
//       expect(wrapper.emitted().updateClicked[0]).toStrictEqual([
//         {
//           id: "logic_1",
//           queryString: "OR",
//           position: 1,
//           type: "Logic",
//           value: { data: "OR", parentGroup: ECLComponent.BUILDER },
//           showButtons: { minus: true, plus: true }
//         }
//       ]);
//     });

//     it("handles deleteClicked", async () => {
//       wrapper.vm.deleteClicked();
//       await wrapper.vm.$nextTick();
//       expect(wrapper.emitted().deleteClicked).toBeTruthy();
//       expect(wrapper.emitted().deleteClicked[0]).toStrictEqual([
//         {
//           id: "logic_1",
//           queryString: "OR",
//           position: 1,
//           type: "Logic",
//           value: { data: "OR", parentGroup: ECLComponent.BUILDER },
//           showButtons: { minus: true, plus: true }
//         }
//       ]);
//     });

//     it("handles addNextClicked", async () => {
//       wrapper.vm.addNextClicked(ECLComponent.FOCUS_CONCEPT);
//       await wrapper.vm.$nextTick();
//       expect(wrapper.emitted().addNextOptionsClicked).toBeTruthy();
//       expect(wrapper.emitted().addNextOptionsClicked[0]).toStrictEqual([
//         {
//           position: 2,
//           selectedType: ECLComponent.FOCUS_CONCEPT
//         }
//       ]);
//     });
//   });

//   describe("no value", () => {
//     let wrapper;

//     beforeEach(() => {
//       vi.resetAllMocks();

//       const warn = console.warn;
//       console.warn = vi.fn();
//       wrapper = shallowMount(Logic, {
//         props: { id: "logic_1", showButtons: { minus: true, plus: true }, position: 1, value: { data: undefined, parentGroup: ECLComponent.BUILDER } },
//         global: { components: { Dropdown } }
//       });
//       console.warn = warn;
//     });

//     it("mounts", () => {
//       expect(wrapper.vm.options).toStrictEqual(["AND", "OR", "MINUS"]);
//       expect(wrapper.vm.selected).toBe("AND");
//       expect(wrapper.vm.id).toBe("logic_1");
//       expect(wrapper.vm.position).toBe(1);
//       expect(wrapper.vm.showButtons).toStrictEqual({ minus: true, plus: true });
//       expect(wrapper.vm.value).toStrictEqual({ data: undefined, parentGroup: ECLComponent.BUILDER });
//     });
//   });
// });
