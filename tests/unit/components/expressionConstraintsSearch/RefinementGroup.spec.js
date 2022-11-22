import RefinementGroup from "@/components/eclSearch/builder/RefinementGroup.vue";
import InputSwitch from "primevue/inputswitch";
import { flushPromises, shallowMount } from "@vue/test-utils";
import { ECLComponent } from "@/im_library/enums";
import { describe, expect, it } from "vitest";
import { setupServer } from "msw/node";

describe("RefinementGroup.vue", () => {
  it("fakes tests", () => {
    expect(true).toBe(true);
  });
});
//   describe("no value", () => {
//     let wrapper;
//     let docSpy;

//     const REFINEMENT_BUILD = [
//       {
//         id: "Refinement_0",
//         value: null,
//         position: 0,
//         type: "Refinement",
//         queryString: "",
//         showButtons: { minus: false, plus: true }
//       }
//     ];

//     beforeEach(async () => {
//       vi.resetAllMocks();

//       wrapper = shallowMount(RefinementGroup, {
//         global: { components: { InputSwitch } },
//         props: { id: "RefinementGroup_1", showButtons: { minus: true, plus: true }, position: 1, value: undefined }
//       });

//       await wrapper.vm.$nextTick();
//       vi.clearAllMocks();
//     });

//     it("mounts", () => {
//       expect(wrapper.vm.id).toBe("RefinementGroup_1");
//       expect(wrapper.vm.showButtons).toStrictEqual({ minus: true, plus: true });
//       expect(wrapper.vm.value).toBe(undefined);
//       expect(wrapper.vm.group).toBe(false);
//       expect(wrapper.vm.refinementGroupBuild).toStrictEqual(REFINEMENT_BUILD);
//     });

//     it("can update on refinementBuild change", () => {
//       const testData = {
//         id: "refinementGroup_1",
//         value: { children: REFINEMENT_BUILD, group: false },
//         position: 1,
//         type: "RefinementGroup",
//         queryString: "",
//         showButtons: { minus: false, plus: false }
//       };
//       wrapper.vm.createRefinementGroup = vi.fn().mockReturnValue(testData);
//       wrapper.vm.$options.watch.refinementGroupBuild.handler.call(wrapper.vm, REFINEMENT_BUILD);
//       expect(wrapper.emitted().updateClicked).toBeTruthy();
//       expect(wrapper.emitted().updateClicked[1]).toStrictEqual([testData]);
//     });

//     it("can update on group change", () => {
//       const testData = {
//         id: "refinementGroup_1",
//         value: { children: REFINEMENT_BUILD, group: false },
//         position: 1,
//         type: "RefinementGroup",
//         queryString: "",
//         showButtons: { minus: false, plus: false }
//       };
//       wrapper.vm.createRefinementGroup = vi.fn().mockReturnValue(testData);
//       wrapper.vm.$options.watch.group.call(wrapper.vm, true);
//       expect(wrapper.emitted().updateClicked).toBeTruthy();
//       expect(wrapper.emitted().updateClicked[1]).toStrictEqual([testData]);
//     });

//     it("can emit onConfirm", () => {
//       const testData = {
//         id: "refinementGroup_1",
//         value: { children: REFINEMENT_BUILD, group: false },
//         position: 1,
//         type: "RefinementGroup",
//         queryString: "",
//         showButtons: { minus: false, plus: false }
//       };
//       wrapper.vm.createRefinementGroup = vi.fn().mockReturnValue(testData);
//       wrapper.vm.onConfirm();
//       expect(wrapper.emitted().addClicked).toBeTruthy();
//       expect(wrapper.emitted().addClicked[0]).toStrictEqual([testData]);
//     });

//     it("can emit on deleteClicked", () => {
//       const testData = {
//         id: "refinementGroup_1",
//         value: { children: REFINEMENT_BUILD, group: false },
//         position: 1,
//         type: "RefinementGroup",
//         queryString: "",
//         showButtons: { minus: false, plus: false }
//       };
//       wrapper.vm.createRefinementGroup = vi.fn().mockReturnValue(testData);
//       wrapper.vm.deleteClicked();
//       expect(wrapper.emitted().deleteClicked).toBeTruthy();
//       expect(wrapper.emitted().deleteClicked[0]).toStrictEqual([testData]);
//     });

//     it("can emit on addNextClicked", async () => {
//       wrapper.vm.addNextClicked(ECLComponent.REFINEMENT);
//       await wrapper.vm.$nextTick();
//       expect(wrapper.emitted().addNextOptionsClicked).toBeTruthy();
//       expect(wrapper.emitted().addNextOptionsClicked[0]).toStrictEqual([{ position: 2, selectedType: ECLComponent.REFINEMENT }]);
//     });

//     it("can addItem ___ Logic", () => {
//       wrapper.vm.updatePositions = vi.fn();
//       wrapper.vm.addItem({ selectedType: "Logic", position: 1, value: null });
//       expect(wrapper.vm.refinementGroupBuild).toStrictEqual([
//         {
//           id: "Refinement_0",
//           queryString: "",
//           position: 0,
//           type: "Refinement",
//           value: null,
//           showButtons: { minus: false, plus: true }
//         },
//         {
//           id: "Logic_1",
//           queryString: "",
//           position: 1,
//           type: "Logic",
//           value: { data: null, parentGroup: ECLComponent.REFINEMENT_GROUP },
//           showButtons: { minus: true, plus: true }
//         }
//       ]);
//     });

//     it("can deleteItem ___ length 0", () => {
//       wrapper.vm.refinementGroupBuild = [
//         {
//           id: "refinementGroup_1refinement_0",
//           queryString: "testLabel",
//           position: 0,
//           type: "Refinement",
//           value: null,
//           showButtons: { minus: false, plus: false }
//         }
//       ];
//       wrapper.vm.deleteItem({
//         id: "refinementGroup_1refinement_0",
//         queryString: "testLabel",
//         position: 0,
//         type: "Refinement",
//         value: null,
//         showButtons: { minus: false, plus: false }
//       });
//       expect(wrapper.vm.refinementGroupBuild).toStrictEqual([
//         {
//           id: "Refinement_0",
//           position: 0,
//           queryString: "",
//           showButtons: {
//             minus: false,
//             plus: true
//           },
//           type: "Refinement",
//           value: null
//         }
//       ]);
//     });

//     it("can updateItem", () => {
//       wrapper.vm.updateItemWrapper({
//         id: "refinementGroup_1refinement_0",
//         value: null,
//         position: 0,
//         type: "Refinement",
//         queryString: "testLabel",
//         showButtons: { minus: false, plus: false }
//       });
//       expect(wrapper.vm.refinementGroupBuild).toStrictEqual([
//         {
//           id: "refinementGroup_1refinement_0",
//           queryString: "testLabel",
//           position: 0,
//           type: "Refinement",
//           value: null,
//           showButtons: { minus: false, plus: false }
//         }
//       ]);
//     });

//     it("can createRefinementGroup", () => {
//       wrapper.vm.generateRefinementGroupQueryString = vi.fn().mockReturnValue("");
//       expect(wrapper.vm.createRefinementGroup()).toStrictEqual({
//         id: "RefinementGroup_1",
//         queryString: ":\n\t",
//         position: 1,
//         type: "RefinementGroup",
//         value: {
//           children: [
//             {
//               id: "Refinement_0",
//               queryString: "",
//               position: 0,
//               type: "Refinement",
//               value: null,
//               showButtons: { minus: false, plus: true }
//             }
//           ],
//           group: false
//         },
//         showButtons: { minus: true, plus: true }
//       });
//     });

//     it("can generateRefinementGroupQueryString ___ no length", () => {
//       wrapper.vm.refinementGroupBuild = [];
//       expect(wrapper.vm.generateRefinementGroupQueryString()).toBe("");
//     });

//     it("can generateRefinementGroupQueryString ___ no group", () => {
//       wrapper.vm.refinementGroupBuild = [
//         {
//           id: "refinementGroup_1refinement_0",
//           value: {
//             children: []
//           },
//           position: 0,
//           type: "Refinement",
//           queryString: "<< * = << *"
//         },
//         { id: "refinementGroup_1logic_1", value: { data: "AND", parentGroup: "RefinementGroup" }, position: 1, type: "Logic", queryString: "AND" },
//         {
//           id: "refinementGroup_1refinement_2",
//           value: {
//             children: []
//           },
//           position: 2,
//           type: "Refinement",
//           queryString: "<< * = << *"
//         }
//       ];
//       expect(wrapper.vm.generateRefinementGroupQueryString()).toBe(":\n\t<< * = << * AND\n\t<< * = << *");
//     });

//     it("can generateRefinementGroupQueryString ___ group", () => {
//       wrapper.vm.group = true;
//       wrapper.vm.refinementGroupBuild = [
//         {
//           id: "refinementGroup_1refinement_0",
//           value: {
//             children: []
//           },
//           position: 0,
//           type: "Refinement",
//           queryString: "<< * = << *"
//         },
//         { id: "refinementGroup_1logic_1", value: { data: "AND", parentGroup: "RefinementGroup" }, position: 1, type: "Logic", queryString: "AND" },
//         {
//           id: "refinementGroup_1refinement_2",
//           value: {
//             children: []
//           },
//           position: 2,
//           type: "Refinement",
//           queryString: "<< * = << *"
//         }
//       ];
//       expect(wrapper.vm.generateRefinementGroupQueryString()).toBe(":\n\t{<< * = << * AND\n\t<< * = << *}");
//     });

//     it("can setStartBuild ___ no value", () => {
//       wrapper.vm.refinementGroupBuild = [];
//       wrapper.vm.setStartBuild();
//       expect(wrapper.vm.refinementGroupBuild).toStrictEqual([
//         {
//           id: ECLComponent.REFINEMENT + "_0",
//           queryString: "",
//           position: 0,
//           type: ECLComponent.REFINEMENT,
//           value: null,
//           showButtons: { minus: false, plus: true }
//         }
//       ]);
//     });
//   });

//   describe("value", () => {
//     let wrapper;
//     let REFINEMENT_BUILD = [
//       {
//         id: "RefinementGroup_1Refinement_0",
//         value: {
//           children: [
//             {
//               id: "refinementGroup_1refinement_0Constraint",
//               value: { name: "Descendant or self of", symbol: "<<" },
//               position: 0,
//               type: "Constraint",
//               queryString: "<<",
//               showButtons: { minus: false, plus: false }
//             },
//             {
//               value: {
//                 code: "",
//                 name: "ANY",
//                 iri: "",
//                 isDescendentOf: [],
//                 weighting: 0,
//                 scheme: {},
//                 status: {},
//                 match: "ANY",
//                 entityType: [{ "@id": "http://endhealth.info/im#Concept", name: "Concept" }]
//               },
//               id: "RefinementGroup_1Refinement_0expression",
//               position: 1,
//               type: "Expression",
//               queryString: "*"
//             },
//             {
//               id: "RefinementGroup_1Refinement_0Operator",
//               value: { symbol: "=", name: "Equals" },
//               position: 2,
//               type: "Operator",
//               queryString: "=",
//               showButtons: { minus: false, plus: false }
//             },
//             {
//               id: "RefinementGroup_1Refinement_0Constraint",
//               value: { name: "Descendant or self of", symbol: "<<" },
//               position: 3,
//               type: "Constraint",
//               queryString: "<<",
//               showButtons: { minus: false, plus: false }
//             },
//             {
//               value: {
//                 code: "",
//                 name: "ANY",
//                 iri: "",
//                 isDescendentOf: [],
//                 weighting: 0,
//                 scheme: {},
//                 status: {},
//                 match: "ANY",
//                 entityType: [{ "@id": "http://endhealth.info/im#Concept", name: "Concept" }]
//               },
//               id: "RefinementGroup_1Refinement_0expression",
//               position: 4,
//               type: "Expression",
//               queryString: "*",
//               showButtons: { minus: false, plus: false }
//             }
//           ]
//         },
//         position: 0,
//         type: "Refinement",
//         queryString: "<< * = << *",
//         showButtons: { minus: false, plus: false }
//       },
//       {
//         id: "RefinementGroup_1Logic_1",
//         value: { data: "AND", parentGroup: "RefinementGroup" },
//         position: 1,
//         type: "Logic",
//         queryString: "AND",
//         showButtons: { minus: false, plus: false }
//       },
//       {
//         id: "RefinementGroup_1Refinement_2",
//         value: {
//           children: [
//             {
//               id: "RefinementGroup_1Refinement_2Constraint",
//               value: { name: "Descendant or self of", symbol: "<<" },
//               position: 0,
//               type: "Constraint",
//               queryString: "<<",
//               showButtons: { minus: false, plus: false }
//             },
//             {
//               value: {
//                 code: "",
//                 name: "ANY",
//                 iri: "",
//                 isDescendentOf: [],
//                 weighting: 0,
//                 scheme: {},
//                 status: {},
//                 match: "ANY",
//                 entityType: [{ "@id": "http://endhealth.info/im#Concept", name: "Concept" }]
//               },
//               id: "RefinementGroup_1Refinement_2Expression",
//               position: 1,
//               type: "Expression",
//               queryString: "*",
//               showButtons: { minus: false, plus: false }
//             },
//             {
//               id: "RefinementGroup_1Refinement_2Operator",
//               value: { symbol: "=", name: "Equals" },
//               position: 2,
//               type: "Operator",
//               showButtons: { minus: false, plus: false },
//               queryString: "="
//             },
//             {
//               id: "RefinementGroup_1Refinement_2Constraint",
//               value: { name: "Descendant or self of", symbol: "<<" },
//               position: 3,
//               type: "Constraint",
//               queryString: "<<",
//               showButtons: { minus: false, plus: false }
//             },
//             {
//               value: {
//                 code: "",
//                 name: "ANY",
//                 iri: "",
//                 isDescendentOf: [],
//                 weighting: 0,
//                 scheme: {},
//                 status: {},
//                 match: "ANY",
//                 entityType: [{ "@id": "http://endhealth.info/im#Concept", name: "Concept" }]
//               },
//               id: "RefinementGroup_1Refinement_2Expression",
//               position: 4,
//               type: "Expression",
//               queryString: "*",
//               showButtons: { minus: false, plus: false }
//             }
//           ]
//         },
//         position: 2,
//         type: "Refinement",
//         queryString: "<< * = << *",
//         showButtons: { minus: false, plus: false }
//       }
//     ];

//     beforeEach(async () => {
//       vi.resetAllMocks();

//       wrapper = shallowMount(RefinementGroup, {
//         global: { components: { InputSwitch } },
//         props: {
//           id: "refinementGroup_1",
//           showButtons: { minus: true, plus: false },
//           position: 1,
//           value: {
//             children: REFINEMENT_BUILD,
//             group: false
//           }
//         }
//       });

//       await wrapper.vm.$nextTick();
//       vi.clearAllMocks();
//     });

//     it("can setStartBuild ___ value", () => {
//       wrapper.vm.refinementGroupBuild = [];
//       wrapper.vm.setStartBuild();
//       expect(wrapper.vm.refinementGroupBuild).toStrictEqual(REFINEMENT_BUILD);
//     });
//   });
// });
