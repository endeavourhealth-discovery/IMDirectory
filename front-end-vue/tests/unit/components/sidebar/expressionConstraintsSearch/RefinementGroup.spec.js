import RefinementGroup from "@/components/sidebar/expressionConstraintsSearch/RefinementGroup.vue";
import InputSwitch from "primevue/inputswitch";
import { flushPromises, shallowMount } from "@vue/test-utils";
import { ECLType } from "@/models/expressionConstraintsLanguage/ECLType";
import { ECLComponent } from "@/models/expressionConstraintsLanguage/ECLComponent";

describe("RefinementGroup.vue ___ no value", () => {
  let wrapper;
  let docSpy;

  const REFINEMENT_BUILD = [
    {
      id: "refinementGroup_1refinement_0",
      value: null,
      position: 0,
      type: "refinement",
      label: "",
      component: "Refinement"
    },
    {
      id: "refinementGroup_1addNext_1",
      value: { previousPosition: 0, previousComponentType: "refinement", parentGroup: "refinementGroup" },
      position: 1,
      type: "addNext",
      label: "",
      component: "AddNext"
    }
  ];

  beforeEach(async () => {
    jest.resetAllMocks();

    wrapper = shallowMount(RefinementGroup, {
      global: { components: { InputSwitch } },
      props: { id: "refinementGroup_1", last: true, position: 1, value: undefined }
    });

    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  it("mounts", () => {
    expect(wrapper.vm.id).toBe("refinementGroup_1");
    expect(wrapper.vm.last).toBe(true);
    expect(wrapper.vm.value).toBe(undefined);
    expect(wrapper.vm.group).toBe(false);
    expect(wrapper.vm.refinementGroupBuild).toStrictEqual(REFINEMENT_BUILD);
  });

  it("can update on refinementBuild change", () => {
    const testData = {
      id: "refinementGroup_1",
      value: { children: REFINEMENT_BUILD, group: false },
      position: 1,
      type: "refinementGroup",
      label: "",
      component: "RefinementGroup"
    };
    wrapper.vm.createRefinementGroup = jest.fn().mockReturnValue(testData);
    wrapper.vm.$options.watch.refinementGroupBuild.handler.call(wrapper.vm, REFINEMENT_BUILD);
    expect(wrapper.emitted().updateClicked).toBeTruthy();
    expect(wrapper.emitted().updateClicked[1]).toStrictEqual([testData]);
  });

  it("can update on group change", () => {
    const testData = {
      id: "refinementGroup_1",
      value: { children: REFINEMENT_BUILD, group: false },
      position: 1,
      type: "refinementGroup",
      label: "",
      component: "RefinementGroup"
    };
    wrapper.vm.createRefinementGroup = jest.fn().mockReturnValue(testData);
    wrapper.vm.$options.watch.group.call(wrapper.vm, true);
    expect(wrapper.emitted().updateClicked).toBeTruthy();
    expect(wrapper.emitted().updateClicked[1]).toStrictEqual([testData]);
  });

  it("can emit onConfirm", () => {
    const testData = {
      id: "refinementGroup_1",
      value: { children: REFINEMENT_BUILD, group: false },
      position: 1,
      type: "refinementGroup",
      label: "",
      component: "RefinementGroup"
    };
    wrapper.vm.createRefinementGroup = jest.fn().mockReturnValue(testData);
    wrapper.vm.onConfirm();
    expect(wrapper.emitted().addClicked).toBeTruthy();
    expect(wrapper.emitted().addClicked[0]).toStrictEqual([testData]);
  });

  it("can emit on deleteClicked", () => {
    const testData = {
      id: "refinementGroup_1",
      value: { children: REFINEMENT_BUILD, group: false },
      position: 1,
      type: "refinementGroup",
      label: "",
      component: "RefinementGroup"
    };
    wrapper.vm.createRefinementGroup = jest.fn().mockReturnValue(testData);
    wrapper.vm.deleteClicked();
    expect(wrapper.emitted().deleteClicked).toBeTruthy();
    expect(wrapper.emitted().deleteClicked[0]).toStrictEqual([testData]);
  });

  it("can addNextOptions ___ not addNext", () => {
    wrapper.vm.refinementGroupBuild = [
      {
        id: "refinementGroup_1refinement_0",
        value: {
          children: []
        },
        position: 0,
        type: "refinement",
        label: "<< * = << *",
        component: "Refinement"
      },
      { id: "refinementGroup_1logic_1", value: "AND", position: 1, type: "logic", component: "Logic", label: "AND" },
      {
        id: "refinementGroup_1addNext_2",
        value: { previousPosition: 1, previousComponentType: "logic", parentGroup: "refinementGroup" },
        position: 2,
        type: "addNext",
        label: "",
        component: "AddNext"
      }
    ];
    docSpy = jest.spyOn(document, "getElementById");
    docSpy.mockReturnValue(undefined);
    wrapper.vm.getNextOptions = jest.fn().mockReturnValue({
      id: "refinementGroup_1addNext_1",
      value: {
        previousPosition: 0,
        previousComponentType: "refinement",
        parentGroup: "refinementGroup"
      },
      position: 1,
      type: "addNext",
      label: "",
      component: "AddNext"
    });
    wrapper.vm.updatePositions = jest.fn();
    wrapper.vm.addNextOptions({ previousComponentType: "refinement", previousPosition: 0, parentGroup: "refinementGroup" });
    expect(wrapper.vm.refinementGroupBuild).toStrictEqual([
      {
        id: "refinementGroup_1refinement_0",
        value: {
          children: []
        },
        position: 0,
        type: "refinement",
        label: "<< * = << *",
        component: "Refinement"
      },
      {
        id: "refinementGroup_1addNext_1",
        value: { previousPosition: 0, previousComponentType: "refinement", parentGroup: "refinementGroup" },
        position: 1,
        type: "addNext",
        label: "",
        component: "AddNext"
      },
      { id: "refinementGroup_1logic_1", value: "AND", position: 1, type: "logic", component: "Logic", label: "AND" },
      {
        id: "refinementGroup_1addNext_2",
        value: { previousPosition: 1, previousComponentType: "logic", parentGroup: "refinementGroup" },
        position: 2,
        type: "addNext",
        label: "",
        component: "AddNext"
      }
    ]);
    expect(wrapper.vm.updatePositions).toHaveBeenCalledTimes(1);
  });

  it("can addNextOptions ___ addNext", async () => {
    wrapper.vm.refinementGroupBuild = [
      {
        id: "refinementGroup_1refinement_0",
        value: {
          children: []
        },
        position: 0,
        type: "refinement",
        label: "<< * = << *",
        component: "Refinement"
      },
      { id: "refinementGroup_1logic_1", value: "AND", position: 1, type: "logic", component: "Logic", label: "AND" },
      {
        id: "refinementGroup_1addNext_2",
        value: { previousPosition: 1, previousComponentType: "logic", parentGroup: "refinementGroup" },
        position: 2,
        type: "addNext",
        label: "",
        component: "AddNext"
      }
    ];
    const mockElement = document.createElement("div");
    mockElement.scrollIntoView = jest.fn();
    docSpy = jest.spyOn(document, "getElementById");
    docSpy.mockReturnValue(mockElement);
    wrapper.vm.getNextOptions = jest.fn().mockReturnValue({
      id: "refinementGroup_1addNext_1",
      value: {
        previousPosition: 1,
        previousComponentType: "logic",
        parentGroup: "refinementGroup"
      },
      position: 2,
      type: "addNext",
      label: "",
      component: "AddNext"
    });
    wrapper.vm.updatePositions = jest.fn();
    wrapper.vm.addNextOptions({ previousComponentType: "logic", previousPosition: 1, parentGroup: "refinementGroup" });
    expect(wrapper.vm.refinementGroupBuild).toStrictEqual([
      {
        id: "refinementGroup_1refinement_0",
        value: {
          children: []
        },
        position: 0,
        type: "refinement",
        label: "<< * = << *",
        component: "Refinement"
      },
      { id: "refinementGroup_1logic_1", value: "AND", position: 1, type: "logic", component: "Logic", label: "AND" },
      {
        id: "refinementGroup_1addNext_1",
        value: { previousPosition: 1, previousComponentType: "logic", parentGroup: "refinementGroup" },
        position: 2,
        type: "addNext",
        label: "",
        component: "AddNext"
      }
    ]);
    expect(wrapper.vm.updatePositions).toHaveBeenCalledTimes(1);
    await flushPromises();
    expect(mockElement.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("can emit on addNextClicked", async () => {
    wrapper.vm.addNextClicked();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().addNextOptionsClicked).toBeTruthy();
    expect(wrapper.emitted().addNextOptionsClicked[0]).toStrictEqual([{ previousComponentType: "refinementGroup", previousPosition: 1 }]);
  });

  it("can addItem ___ end", () => {
    wrapper.vm.updatePositions = jest.fn();
    wrapper.vm.generateNewComponent = jest.fn().mockReturnValue({
      id: "refinementGroup_1logic_1",
      value: null,
      position: 1,
      type: "logic",
      label: "",
      component: "Logic"
    });
    wrapper.vm.getNextOptions = jest.fn().mockReturnValue({
      id: "refinementGroup_1addNext_1",
      value: {
        previousPosition: 1,
        previousComponentType: "logic",
        parentGroup: "refinementGroup"
      },
      position: 2,
      type: "addNext",
      label: "",
      component: "AddNext"
    });
    wrapper.vm.addItem({ selectedType: "logic", position: 1 });
    expect(wrapper.vm.refinementGroupBuild).toStrictEqual([
      {
        component: "Refinement",
        id: "refinementGroup_1refinement_0",
        label: "",
        position: 0,
        type: "refinement",
        value: null
      },
      {
        component: "Logic",
        id: "refinementGroup_1logic_1",
        label: "",
        position: 1,
        type: "logic",
        value: null
      },
      {
        component: "AddNext",
        id: "refinementGroup_1addNext_1",
        label: "",
        position: 2,
        type: "addNext",
        value: {
          parentGroup: "refinementGroup",
          previousComponentType: "logic",
          previousPosition: 1
        }
      }
    ]);
    expect(wrapper.vm.updatePositions).toHaveBeenCalledTimes(1);
  });

  it("can addItem ___ no end", () => {
    wrapper.vm.refinementGroupBuild = [
      {
        component: "Refinement",
        id: "refinementGroup_1refinement_0",
        label: "",
        position: 0,
        type: "refinement",
        value: null
      },
      {
        component: "AddNext",
        id: "refinementGroup_1addNext_1",
        label: "",
        position: 1,
        type: "addNext",
        value: {
          parentGroup: "refinementGroup",
          previousComponentType: "refinement",
          previousPosition: 1
        }
      },
      {
        component: "Logic",
        id: "refinementGroup_1logic_2",
        label: "",
        position: 2,
        type: "logic",
        value: null
      },
      {
        component: "AddNext",
        id: "refinementGroup_1addNext_3",
        label: "",
        position: 3,
        type: "addNext",
        value: {
          parentGroup: "refinementGroup",
          previousComponentType: "logic",
          previousPosition: 1
        }
      }
    ];
    wrapper.vm.updatePositions = jest.fn();
    wrapper.vm.generateNewComponent = jest.fn().mockReturnValue({
      id: "refinementGroup_1logic_1",
      value: null,
      position: 1,
      type: "logic",
      label: "",
      component: "Logic"
    });
    wrapper.vm.getNextOptions = jest.fn().mockReturnValue({
      id: "refinementGroup_1addNext_1",
      value: {
        previousPosition: 1,
        previousComponentType: "logic",
        parentGroup: "refinementGroup"
      },
      position: 2,
      type: "addNext",
      label: "",
      component: "AddNext"
    });
    wrapper.vm.addItem({ selectedType: "logic", position: 1 });
    expect(wrapper.vm.refinementGroupBuild).toStrictEqual([
      {
        component: "Refinement",
        id: "refinementGroup_1refinement_0",
        label: "",
        position: 0,
        type: "refinement",
        value: null
      },
      {
        component: "Logic",
        id: "refinementGroup_1logic_1",
        label: "",
        position: 1,
        type: "logic",
        value: null
      },
      {
        component: "Logic",
        id: "refinementGroup_1logic_2",
        label: "",
        position: 2,
        type: "logic",
        value: null
      },
      {
        component: "AddNext",
        id: "refinementGroup_1addNext_3",
        label: "",
        position: 3,
        type: "addNext",
        value: {
          parentGroup: "refinementGroup",
          previousComponentType: "logic",
          previousPosition: 1
        }
      }
    ]);
    expect(wrapper.vm.updatePositions).toHaveBeenCalledTimes(1);
  });

  it("can addItem ___ no newComponent", () => {
    wrapper.vm.updatePositions = jest.fn();
    wrapper.vm.generateNewComponent = jest.fn().mockReturnValue(undefined);
    wrapper.vm.addItem({ selectedType: "logic", position: 1 });
    expect(wrapper.vm.updatePositions).not.toHaveBeenCalled();
  });

  it("can deleteItem ___ position 0", () => {
    wrapper.vm.refinementGroupBuild = [
      {
        component: "Refinement",
        id: "refinementGroup_1refinement_0",
        label: "testLabel",
        position: 0,
        type: "refinement",
        value: null
      },
      {
        component: "AddNext",
        id: "refinementGroup_1addNext_1",
        label: "",
        position: 1,
        type: "addNext",
        value: {
          parentGroup: "refinementGroup",
          previousComponentType: "refinement",
          previousPosition: 1
        }
      },
      {
        component: "Logic",
        id: "refinementGroup_1logic_2",
        label: "",
        position: 2,
        type: "logic",
        value: null
      },
      {
        component: "AddNext",
        id: "refinementGroup_1addNext_3",
        label: "",
        position: 3,
        type: "addNext",
        value: {
          parentGroup: "refinementGroup",
          previousComponentType: "logic",
          previousPosition: 1
        }
      }
    ];
    wrapper.vm.updatePositions = jest.fn();
    wrapper.vm.setStartBuild = jest.fn().mockReturnValue([
      {
        component: ECLComponent.REFINEMENT,
        id: "refinementGroup_0" + ECLType.REFINEMENT + "_0",
        label: "",
        position: 0,
        type: ECLType.REFINEMENT,
        value: null
      },
      {
        component: ECLComponent.ADD_NEXT,
        id: "refinementGroup_0" + ECLType.ADD_NEXT + "_1",
        value: {
          previousPosition: 0,
          previousComponentType: ECLType.REFINEMENT,
          parentGroup: ECLType.REFINEMENT_GROUP
        },
        position: 1,
        type: ECLType.ADD_NEXT,
        label: ""
      }
    ]);
    wrapper.vm.getNextOptions = jest.fn().mockReturnValue({
      id: "refinementGroup_1addNext_1",
      value: {
        previousPosition: 1,
        previousComponentType: "logic",
        parentGroup: "refinementGroup"
      },
      position: 2,
      type: "addNext",
      label: "",
      component: "AddNext"
    });
    wrapper.vm.deleteItem({
      component: "Refinement",
      id: "refinementGroup_1refinement_0",
      label: "testLabel",
      position: 0,
      type: "refinement",
      value: null
    });
    expect(wrapper.vm.refinementGroupBuild).toStrictEqual([
      {
        component: "Refinement",
        id: "refinementGroup_0refinement_0",
        label: "",
        position: 0,
        type: "refinement",
        value: null
      },
      {
        component: "AddNext",
        id: "refinementGroup_1addNext_1",
        label: "",
        position: 1,
        type: "addNext",
        value: {
          parentGroup: "refinementGroup",
          previousComponentType: "refinement",
          previousPosition: 1
        }
      },
      {
        component: "Logic",
        id: "refinementGroup_1logic_2",
        label: "",
        position: 2,
        type: "logic",
        value: null
      },
      {
        component: "AddNext",
        id: "refinementGroup_1addNext_1",
        label: "",
        position: 2,
        type: "addNext",
        value: {
          parentGroup: "refinementGroup",
          previousComponentType: "logic",
          previousPosition: 1
        }
      }
    ]);
    expect(wrapper.vm.updatePositions).toHaveBeenCalledTimes(1);
  });

  it("can deleteItem ___ end", () => {
    wrapper.vm.refinementGroupBuild = [
      {
        component: "Refinement",
        id: "refinementGroup_1refinement_0",
        label: "testLabel",
        position: 0,
        type: "refinement",
        value: null
      },
      {
        component: "AddNext",
        id: "refinementGroup_1addNext_1",
        label: "",
        position: 1,
        type: "addNext",
        value: {
          parentGroup: "refinementGroup",
          previousComponentType: "refinement",
          previousPosition: 1
        }
      },
      {
        component: "Logic",
        id: "refinementGroup_1logic_2",
        label: "",
        position: 2,
        type: "logic",
        value: null
      },
      {
        component: "AddNext",
        id: "refinementGroup_1addNext_3",
        label: "",
        position: 3,
        type: "addNext",
        value: {
          parentGroup: "refinementGroup",
          previousComponentType: "logic",
          previousPosition: 1
        }
      }
    ];
    wrapper.vm.updatePositions = jest.fn();
    wrapper.vm.setStartBuild = jest.fn();
    wrapper.vm.getNextOptions = jest.fn().mockReturnValue({
      id: "refinementGroup_1addNext_1",
      value: {
        previousPosition: 1,
        previousComponentType: "logic",
        parentGroup: "refinementGroup"
      },
      position: 2,
      type: "addNext",
      label: "",
      component: "AddNext"
    });
    wrapper.vm.deleteItem({
      component: "AddNext",
      id: "refinementGroup_1addNext_3",
      label: "",
      position: 3,
      type: "addNext",
      value: {
        parentGroup: "refinementGroup",
        previousComponentType: "logic",
        previousPosition: 1
      }
    });
    expect(wrapper.vm.refinementGroupBuild).toStrictEqual([
      {
        component: "Refinement",
        id: "refinementGroup_1refinement_0",
        label: "testLabel",
        position: 0,
        type: "refinement",
        value: null
      },
      {
        component: "AddNext",
        id: "refinementGroup_1addNext_1",
        label: "",
        position: 1,
        type: "addNext",
        value: {
          parentGroup: "refinementGroup",
          previousComponentType: "refinement",
          previousPosition: 1
        }
      },
      {
        component: "Logic",
        id: "refinementGroup_1logic_2",
        label: "",
        position: 2,
        type: "logic",
        value: null
      },
      {
        component: "AddNext",
        id: "refinementGroup_1addNext_1",
        label: "",
        position: 2,
        type: "addNext",
        value: {
          parentGroup: "refinementGroup",
          previousComponentType: "logic",
          previousPosition: 1
        }
      }
    ]);
    expect(wrapper.vm.updatePositions).toHaveBeenCalledTimes(1);
  });

  it("can deleteItem ___ middle ___ addNext followed", () => {
    wrapper.vm.refinementGroupBuild = [
      {
        component: "Refinement",
        id: "refinementGroup_1refinement_0",
        label: "testLabel",
        position: 0,
        type: "refinement",
        value: null
      },
      {
        component: "Logic",
        id: "refinementGroup_1logic_1",
        label: "",
        position: 1,
        type: "logic",
        value: null
      },
      {
        component: "AddNext",
        id: "refinementGroup_1addNext_2",
        label: "",
        position: 2,
        type: "addNext",
        value: {
          parentGroup: "refinementGroup",
          previousComponentType: "logic",
          previousPosition: 1
        }
      },
      {
        component: "Refinement",
        id: "refinementGroup_1refinement_3",
        label: "testLabel",
        position: 3,
        type: "refinement",
        value: null
      },
      {
        component: "AddNext",
        id: "refinementGroup_1addNext_4",
        label: "",
        position: 4,
        type: "addNext",
        value: {
          parentGroup: "refinementGroup",
          previousComponentType: "logic",
          previousPosition: 1
        }
      }
    ];
    wrapper.vm.updatePositions = jest.fn();
    wrapper.vm.setStartBuild = jest.fn();
    wrapper.vm.getNextOptions = jest.fn().mockReturnValue({
      id: "refinementGroup_1addNext_1",
      value: {
        previousPosition: 1,
        previousComponentType: "refinement",
        parentGroup: "refinementGroup"
      },
      position: 1,
      type: "addNext",
      label: "",
      component: "AddNext"
    });
    wrapper.vm.deleteItem({
      component: "Logic",
      id: "refinementGroup_1logic_1",
      label: "",
      position: 1,
      type: "logic",
      value: null
    });
    expect(wrapper.vm.refinementGroupBuild).toStrictEqual([
      {
        component: "Refinement",
        id: "refinementGroup_1refinement_0",
        label: "testLabel",
        position: 0,
        type: "refinement",
        value: null
      },
      {
        component: "AddNext",
        id: "refinementGroup_1addNext_1",
        label: "",
        position: 1,
        type: "addNext",
        value: {
          parentGroup: "refinementGroup",
          previousComponentType: "refinement",
          previousPosition: 1
        }
      },
      {
        component: "Refinement",
        id: "refinementGroup_1refinement_3",
        label: "testLabel",
        position: 3,
        type: "refinement",
        value: null
      },
      {
        component: "AddNext",
        id: "refinementGroup_1addNext_1",
        label: "",
        position: 1,
        type: "addNext",
        value: {
          parentGroup: "refinementGroup",
          previousComponentType: "refinement",
          previousPosition: 1
        }
      }
    ]);
    expect(wrapper.vm.updatePositions).toHaveBeenCalledTimes(1);
  });

  it("can deleteItem ___ middle ___ other", () => {
    wrapper.vm.refinementGroupBuild = [
      {
        component: "Refinement",
        id: "refinementGroup_1refinement_0",
        label: "testLabel",
        position: 0,
        type: "refinement",
        value: null
      },
      {
        component: "Logic",
        id: "refinementGroup_1logic_1",
        label: "",
        position: 1,
        type: "logic",
        value: null
      },
      {
        component: "Refinement",
        id: "refinementGroup_1refinement_2",
        label: "testLabel",
        position: 2,
        type: "refinement",
        value: null
      },
      {
        component: "AddNext",
        id: "refinementGroup_1addNext_3",
        label: "",
        position: 3,
        type: "addNext",
        value: {
          parentGroup: "refinementGroup",
          previousComponentType: "refinement",
          previousPosition: 1
        }
      }
    ];
    wrapper.vm.updatePositions = jest.fn();
    wrapper.vm.setStartBuild = jest.fn();
    wrapper.vm.getNextOptions = jest.fn().mockReturnValue({
      id: "refinementGroup_1addNext_1",
      value: {
        previousPosition: 1,
        previousComponentType: "refinement",
        parentGroup: "refinementGroup"
      },
      position: 1,
      type: "addNext",
      label: "",
      component: "AddNext"
    });
    wrapper.vm.deleteItem({
      component: "Logic",
      id: "refinementGroup_1logic_1",
      label: "",
      position: 1,
      type: "logic",
      value: null
    });
    expect(wrapper.vm.refinementGroupBuild).toStrictEqual([
      {
        component: "Refinement",
        id: "refinementGroup_1refinement_0",
        label: "testLabel",
        position: 0,
        type: "refinement",
        value: null
      },
      {
        component: "Refinement",
        id: "refinementGroup_1refinement_2",
        label: "testLabel",
        position: 2,
        type: "refinement",
        value: null
      },
      {
        component: "AddNext",
        id: "refinementGroup_1addNext_1",
        label: "",
        position: 1,
        type: "addNext",
        value: {
          parentGroup: "refinementGroup",
          previousComponentType: "refinement",
          previousPosition: 1
        }
      }
    ]);
    expect(wrapper.vm.updatePositions).toHaveBeenCalledTimes(1);
  });

  it("can updateItem", () => {
    wrapper.vm.updateItem({
      id: "refinementGroup_1refinement_0",
      value: null,
      position: 0,
      type: "refinement",
      label: "testLabel",
      component: "Refinement"
    });
    expect(wrapper.vm.refinementGroupBuild).toStrictEqual([
      {
        component: "Refinement",
        id: "refinementGroup_1refinement_0",
        label: "testLabel",
        position: 0,
        type: "refinement",
        value: null
      },
      {
        component: "AddNext",
        id: "refinementGroup_1addNext_1",
        label: "",
        position: 1,
        type: "addNext",
        value: {
          parentGroup: "refinementGroup",
          previousComponentType: "refinement",
          previousPosition: 0
        }
      }
    ]);
  });

  it("can getNextOptions", () => {
    expect(wrapper.vm.getNextOptions(0, ECLType.REFINEMENT, ECLType.REFINEMENT_GROUP)).toStrictEqual({
      id: "refinementGroup_1addNext_1",
      value: {
        previousPosition: 0,
        previousComponentType: ECLType.REFINEMENT,
        parentGroup: ECLType.REFINEMENT_GROUP
      },
      position: 1,
      type: ECLType.ADD_NEXT,
      label: "",
      component: ECLComponent.ADD_NEXT
    });
  });

  it("can updatePositions", () => {
    wrapper.vm.refinementGroupBuild = [
      {
        component: "Refinement",
        id: "refinementGroup_1refinement_0",
        label: "",
        position: 2,
        type: "refinement",
        value: null
      },
      {
        component: "Logic",
        id: "refinementGroup_1logic_1",
        label: "",
        position: 1,
        type: "logic",
        value: null
      },
      {
        component: "AddNext",
        id: "refinementGroup_1addNext_1",
        label: "",
        position: 0,
        type: "addNext",
        value: {
          parentGroup: "refinementGroup",
          previousComponentType: "logic",
          previousPosition: 1
        }
      }
    ];
    wrapper.vm.updatePositions();
    expect(wrapper.vm.refinementGroupBuild).toStrictEqual([
      {
        component: "Refinement",
        id: "refinementGroup_1refinement_0",
        label: "",
        position: 0,
        type: "refinement",
        value: null
      },
      {
        component: "Logic",
        id: "refinementGroup_1logic_1",
        label: "",
        position: 1,
        type: "logic",
        value: null
      },
      {
        component: "AddNext",
        id: "refinementGroup_1addNext_1",
        label: "",
        position: 2,
        type: "addNext",
        value: {
          parentGroup: "refinementGroup",
          previousComponentType: "logic",
          previousPosition: 1
        }
      }
    ]);
  });

  it("can generateNewComponent ___ refinement", () => {
    expect(wrapper.vm.generateNewComponent(ECLType.REFINEMENT, 1)).toStrictEqual({
      id: "refinementGroup_1" + ECLType.REFINEMENT + "_1",
      value: null,
      position: 1,
      type: ECLType.REFINEMENT,
      label: "",
      component: ECLComponent.REFINEMENT
    });
  });

  it("can generateNewComponent ___ logic", () => {
    expect(wrapper.vm.generateNewComponent(ECLType.LOGIC, 1)).toStrictEqual({
      id: "refinementGroup_1" + ECLType.LOGIC + "_1",
      value: null,
      position: 1,
      type: ECLType.LOGIC,
      label: "",
      component: ECLComponent.LOGIC
    });
  });

  it("can generateNewComponent ___ other", () => {
    expect(wrapper.vm.generateNewComponent(ECLType.EXPRESSION, 1)).toStrictEqual(undefined);
  });

  it("can createRefinementGroup", () => {
    wrapper.vm.generateRefinementLabel = jest.fn().mockReturnValue("");
    expect(wrapper.vm.createRefinementGroup()).toStrictEqual({
      component: "RefinementGroup",
      id: "refinementGroup_1",
      label: "",
      position: 1,
      type: "refinementGroup",
      value: {
        children: [
          {
            component: "Refinement",
            id: "refinementGroup_1refinement_0",
            label: "",
            position: 0,
            type: "refinement",
            value: null
          },
          {
            component: "AddNext",
            id: "refinementGroup_1addNext_1",
            label: "",
            position: 1,
            type: "addNext",
            value: {
              parentGroup: "refinementGroup",
              previousComponentType: "refinement",
              previousPosition: 0
            }
          }
        ],
        group: false
      }
    });
  });

  it("can generateRefinementLabel ___ no length", () => {
    wrapper.vm.refinementGroupBuild = [];
    expect(wrapper.vm.generateRefinementLabel()).toBe("");
  });

  it("can generateRefinementLabel ___ no group", () => {
    wrapper.vm.refinementGroupBuild = [
      {
        id: "refinementGroup_1refinement_0",
        value: {
          children: []
        },
        position: 0,
        type: "refinement",
        label: "<< * = << *",
        component: "Refinement"
      },
      { id: "refinementGroup_1logic_1", value: "AND", position: 1, type: "logic", component: "Logic", label: "AND" },
      {
        id: "refinementGroup_1refinement_2",
        value: {
          children: []
        },
        position: 2,
        type: "refinement",
        label: "<< * = << *",
        component: "Refinement"
      },
      {
        id: "refinementGroup_1addNext_3",
        value: { previousPosition: 2, previousComponentType: "refinement", parentGroup: "refinementGroup" },
        position: 3,
        type: "addNext",
        label: "",
        component: "AddNext"
      }
    ];
    expect(wrapper.vm.generateRefinementLabel()).toBe(":\n\t<< * = << * AND\n\t<< * = << *");
  });

  it("can generateRefinementLabel ___ group", () => {
    wrapper.vm.group = true;
    wrapper.vm.refinementGroupBuild = [
      {
        id: "refinementGroup_1refinement_0",
        value: {
          children: []
        },
        position: 0,
        type: "refinement",
        label: "<< * = << *",
        component: "Refinement"
      },
      { id: "refinementGroup_1logic_1", value: "AND", position: 1, type: "logic", component: "Logic", label: "AND" },
      {
        id: "refinementGroup_1refinement_2",
        value: {
          children: []
        },
        position: 2,
        type: "refinement",
        label: "<< * = << *",
        component: "Refinement"
      },
      {
        id: "refinementGroup_1addNext_3",
        value: { previousPosition: 2, previousComponentType: "refinement", parentGroup: "refinementGroup" },
        position: 3,
        type: "addNext",
        label: "",
        component: "AddNext"
      }
    ];
    expect(wrapper.vm.generateRefinementLabel()).toBe(":\n\t{<< * = << * AND\n\t<< * = << *}");
  });

  it("can setStartBuild ___ no value", () => {
    expect(wrapper.vm.setStartBuild()).toStrictEqual([
      {
        component: ECLComponent.REFINEMENT,
        id: "refinementGroup_1" + ECLType.REFINEMENT + "_0",
        label: "",
        position: 0,
        type: ECLType.REFINEMENT,
        value: null
      },
      {
        component: ECLComponent.ADD_NEXT,
        id: "refinementGroup_1" + ECLType.ADD_NEXT + "_1",
        value: {
          previousPosition: 0,
          previousComponentType: ECLType.REFINEMENT,
          parentGroup: ECLType.REFINEMENT_GROUP
        },
        position: 1,
        type: ECLType.ADD_NEXT,
        label: ""
      }
    ]);
  });
});

describe("RefinementGroup.vue ___ value", () => {
  let wrapper;

  beforeEach(async () => {
    jest.resetAllMocks();

    wrapper = shallowMount(RefinementGroup, {
      global: { components: { InputSwitch } },
      props: {
        id: "refinementGroup_1",
        last: true,
        position: 1,
        value: {
          children: [
            {
              id: "refinementGroup_1refinement_0",
              value: {
                children: [
                  {
                    id: "refinementGroup_1refinement_0constraint",
                    value: { name: "Descendant or self of", symbol: "<<" },
                    position: 0,
                    type: "constraint",
                    label: "<<",
                    component: "Constraint"
                  },
                  {
                    value: {
                      code: "",
                      name: "ANY",
                      iri: "",
                      isDescendentOf: [],
                      weighting: 0,
                      scheme: {},
                      status: {},
                      match: "ANY",
                      entityType: [{ "@id": "http://endhealth.info/im#Concept", name: "Concept" }]
                    },
                    id: "refinementGroup_1refinement_0expression",
                    position: 1,
                    type: "expression",
                    label: "*",
                    component: "Expression"
                  },
                  {
                    id: "refinementGroup_1refinement_0operator",
                    value: { symbol: "=", name: "Equals" },
                    position: 2,
                    type: "operator",
                    component: "Operator",
                    label: "="
                  },
                  {
                    id: "refinementGroup_1refinement_0constraint",
                    value: { name: "Descendant or self of", symbol: "<<" },
                    position: 3,
                    type: "constraint",
                    label: "<<",
                    component: "Constraint"
                  },
                  {
                    value: {
                      code: "",
                      name: "ANY",
                      iri: "",
                      isDescendentOf: [],
                      weighting: 0,
                      scheme: {},
                      status: {},
                      match: "ANY",
                      entityType: [{ "@id": "http://endhealth.info/im#Concept", name: "Concept" }]
                    },
                    id: "refinementGroup_1refinement_0expression",
                    position: 4,
                    type: "expression",
                    label: "*",
                    component: "Expression"
                  }
                ]
              },
              position: 0,
              type: "refinement",
              label: "<< * = << *",
              component: "Refinement"
            },
            { id: "refinementGroup_1logic_1", value: "AND", position: 1, type: "logic", component: "Logic", label: "AND" },
            {
              id: "refinementGroup_1refinement_2",
              value: {
                children: [
                  {
                    id: "refinementGroup_1refinement_2constraint",
                    value: { name: "Descendant or self of", symbol: "<<" },
                    position: 0,
                    type: "constraint",
                    label: "<<",
                    component: "Constraint"
                  },
                  {
                    value: {
                      code: "",
                      name: "ANY",
                      iri: "",
                      isDescendentOf: [],
                      weighting: 0,
                      scheme: {},
                      status: {},
                      match: "ANY",
                      entityType: [{ "@id": "http://endhealth.info/im#Concept", name: "Concept" }]
                    },
                    id: "refinementGroup_1refinement_2expression",
                    position: 1,
                    type: "expression",
                    label: "*",
                    component: "Expression"
                  },
                  {
                    id: "refinementGroup_1refinement_2operator",
                    value: { symbol: "=", name: "Equals" },
                    position: 2,
                    type: "operator",
                    component: "Operator",
                    label: "="
                  },
                  {
                    id: "refinementGroup_1refinement_2constraint",
                    value: { name: "Descendant or self of", symbol: "<<" },
                    position: 3,
                    type: "constraint",
                    label: "<<",
                    component: "Constraint"
                  },
                  {
                    value: {
                      code: "",
                      name: "ANY",
                      iri: "",
                      isDescendentOf: [],
                      weighting: 0,
                      scheme: {},
                      status: {},
                      match: "ANY",
                      entityType: [{ "@id": "http://endhealth.info/im#Concept", name: "Concept" }]
                    },
                    id: "refinementGroup_1refinement_2expression",
                    position: 4,
                    type: "expression",
                    label: "*",
                    component: "Expression"
                  }
                ]
              },
              position: 2,
              type: "refinement",
              label: "<< * = << *",
              component: "Refinement"
            },
            {
              id: "refinementGroup_1addNext_3",
              value: { previousPosition: 2, previousComponentType: "refinement", parentGroup: "refinementGroup" },
              position: 3,
              type: "addNext",
              label: "",
              component: "AddNext"
            }
          ],
          group: false
        }
      }
    });

    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  it("can setStartBuild ___ value", () => {
    expect(wrapper.vm.setStartBuild()).toStrictEqual([
      {
        id: "refinementGroup_1refinement_0",
        value: {
          children: [
            {
              id: "refinementGroup_1refinement_0constraint",
              value: { name: "Descendant or self of", symbol: "<<" },
              position: 0,
              type: "constraint",
              label: "<<",
              component: "Constraint"
            },
            {
              value: {
                code: "",
                name: "ANY",
                iri: "",
                isDescendentOf: [],
                weighting: 0,
                scheme: {},
                status: {},
                match: "ANY",
                entityType: [{ "@id": "http://endhealth.info/im#Concept", name: "Concept" }]
              },
              id: "refinementGroup_1refinement_0expression",
              position: 1,
              type: "expression",
              label: "*",
              component: "Expression"
            },
            {
              id: "refinementGroup_1refinement_0operator",
              value: { symbol: "=", name: "Equals" },
              position: 2,
              type: "operator",
              component: "Operator",
              label: "="
            },
            {
              id: "refinementGroup_1refinement_0constraint",
              value: { name: "Descendant or self of", symbol: "<<" },
              position: 3,
              type: "constraint",
              label: "<<",
              component: "Constraint"
            },
            {
              value: {
                code: "",
                name: "ANY",
                iri: "",
                isDescendentOf: [],
                weighting: 0,
                scheme: {},
                status: {},
                match: "ANY",
                entityType: [{ "@id": "http://endhealth.info/im#Concept", name: "Concept" }]
              },
              id: "refinementGroup_1refinement_0expression",
              position: 4,
              type: "expression",
              label: "*",
              component: "Expression"
            }
          ]
        },
        position: 0,
        type: "refinement",
        label: "<< * = << *",
        component: "Refinement"
      },
      { id: "refinementGroup_1logic_1", value: "AND", position: 1, type: "logic", component: "Logic", label: "AND" },
      {
        id: "refinementGroup_1refinement_2",
        value: {
          children: [
            {
              id: "refinementGroup_1refinement_2constraint",
              value: { name: "Descendant or self of", symbol: "<<" },
              position: 0,
              type: "constraint",
              label: "<<",
              component: "Constraint"
            },
            {
              value: {
                code: "",
                name: "ANY",
                iri: "",
                isDescendentOf: [],
                weighting: 0,
                scheme: {},
                status: {},
                match: "ANY",
                entityType: [{ "@id": "http://endhealth.info/im#Concept", name: "Concept" }]
              },
              id: "refinementGroup_1refinement_2expression",
              position: 1,
              type: "expression",
              label: "*",
              component: "Expression"
            },
            {
              id: "refinementGroup_1refinement_2operator",
              value: { symbol: "=", name: "Equals" },
              position: 2,
              type: "operator",
              component: "Operator",
              label: "="
            },
            {
              id: "refinementGroup_1refinement_2constraint",
              value: { name: "Descendant or self of", symbol: "<<" },
              position: 3,
              type: "constraint",
              label: "<<",
              component: "Constraint"
            },
            {
              value: {
                code: "",
                name: "ANY",
                iri: "",
                isDescendentOf: [],
                weighting: 0,
                scheme: {},
                status: {},
                match: "ANY",
                entityType: [{ "@id": "http://endhealth.info/im#Concept", name: "Concept" }]
              },
              id: "refinementGroup_1refinement_2expression",
              position: 4,
              type: "expression",
              label: "*",
              component: "Expression"
            }
          ]
        },
        position: 2,
        type: "refinement",
        label: "<< * = << *",
        component: "Refinement"
      },
      {
        id: "refinementGroup_1addNext_3",
        value: { previousPosition: 2, previousComponentType: "refinement", parentGroup: "refinementGroup" },
        position: 3,
        type: "addNext",
        label: "",
        component: "AddNext"
      }
    ]);
  });
});
