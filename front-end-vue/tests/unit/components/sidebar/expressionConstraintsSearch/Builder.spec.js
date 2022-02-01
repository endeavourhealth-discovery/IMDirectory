import Builder from "@/components/sidebar/expressionConstraintsSearch/Builder.vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { shallowMount, flushPromises } from "@vue/test-utils";
import { ECLType } from "@/models/expressionConstraintsLanguage/ECLType";
import { ECLComponent } from "@/models/expressionConstraintsLanguage/ECLComponent";
import Tooltip from "primevue/tooltip";
import LoggerService from "@/services/LoggerService";

describe("Builder.vue", () => {
  let wrapper;
  let mockToast;
  let docSpy;

  beforeEach(async () => {
    jest.resetAllMocks();

    mockToast = { add: jest.fn() };

    wrapper = shallowMount(Builder, {
      global: {
        components: { Dialog, Button },
        mocks: { $toast: mockToast },
        directives: { tooltip: Tooltip, clipboard: { copy: jest.fn(), success: jest.fn(), error: jest.fn() } }
      },
      props: { showDialog: true }
    });

    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  it("mounts", () => {
    expect(wrapper.vm.showDialog).toBe(true);
    expect(wrapper.vm.queryString).toBe(" ");
    expect(wrapper.vm.queryBuild).toStrictEqual([
      {
        component: ECLComponent.FOCUS_CONCEPT,
        id: ECLType.FOCUS_CONCEPT + "_" + 0,
        value: null,
        position: 0,
        type: ECLType.FOCUS_CONCEPT,
        label: ""
      },
      {
        id: ECLType.ADD_NEXT + "_" + 1,
        value: {
          previousPosition: 0,
          previousComponentType: ECLType.FOCUS_CONCEPT,
          parentGroup: undefined
        },
        position: 1,
        type: ECLType.ADD_NEXT,
        label: "",
        component: ECLComponent.ADD_NEXT
      }
    ]);
  });

  it("generates query string on query build change", () => {
    wrapper.vm.generateQueryString = jest.fn();
    wrapper.vm.$options.watch.queryBuild.handler.call(wrapper.vm, [
      {
        id: ECLType.ADD_NEXT + "_" + 1,
        value: {
          previousPosition: 0,
          previousComponentType: ECLType.FOCUS_CONCEPT,
          parentGroup: undefined
        },
        position: 1,
        type: ECLType.ADD_NEXT,
        label: "",
        component: ECLComponent.ADD_NEXT
      },
      {
        component: ECLComponent.FOCUS_CONCEPT,
        id: ECLType.FOCUS_CONCEPT + "_" + 0,
        value: null,
        position: 0,
        type: ECLType.FOCUS_CONCEPT,
        label: ""
      }
    ]);
    expect(wrapper.vm.queryBuild).toStrictEqual([
      {
        component: ECLComponent.FOCUS_CONCEPT,
        id: ECLType.FOCUS_CONCEPT + "_" + 0,
        value: null,
        position: 0,
        type: ECLType.FOCUS_CONCEPT,
        label: ""
      },
      {
        id: ECLType.ADD_NEXT + "_" + 1,
        value: {
          previousPosition: 0,
          previousComponentType: ECLType.FOCUS_CONCEPT,
          parentGroup: undefined
        },
        position: 1,
        type: ECLType.ADD_NEXT,
        label: "",
        component: ECLComponent.ADD_NEXT
      }
    ]);
    expect(wrapper.vm.generateQueryString).toHaveBeenCalledTimes(1);
  });

  it("can submit", async () => {
    wrapper.vm.queryString = "testString";
    wrapper.vm.submit();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().ECLSubmitted).toBeTruthy();
    expect(wrapper.emitted().ECLSubmitted[0]).toStrictEqual(["testString"]);
  });

  it("can closeBuilderDialog", async () => {
    wrapper.vm.closeBuilderDialog();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().closeDialog).toBeTruthy();
    expect(wrapper.emitted().closeDialog[0]).toStrictEqual([]);
  });

  it("can addNextOptions ___ not addNext", () => {
    wrapper.vm.queryBuild = [
      {
        id: "focusConcept_0",
        value: {
          children: []
        },
        position: 0,
        type: "focusConcept",
        label: "",
        component: "FocusConcept"
      },
      { id: "logic_1", value: "AND", position: 1, type: "logic", component: "Logic", label: "AND" },
      {
        id: "addNext_2",
        value: { previousPosition: 1, previousComponentType: "logic", parentGroup: undefined },
        position: 2,
        type: "addNext",
        label: "",
        component: "AddNext"
      }
    ];
    docSpy = jest.spyOn(document, "getElementById");
    docSpy.mockReturnValue(undefined);
    wrapper.vm.getNextOptions = jest.fn().mockReturnValue({
      id: "addNext_1",
      value: {
        previousPosition: 0,
        previousComponentType: "focusConcept",
        parentGroup: undefined
      },
      position: 1,
      type: "addNext",
      label: "",
      component: "AddNext"
    });
    wrapper.vm.updatePositions = jest.fn();
    wrapper.vm.addNextOptions({ previousComponentType: "focusConcept", previousPosition: 0, parentGroup: undefined });
    expect(wrapper.vm.queryBuild).toStrictEqual([
      {
        id: "focusConcept_0",
        value: {
          children: []
        },
        position: 0,
        type: "focusConcept",
        label: "",
        component: "FocusConcept"
      },
      {
        id: "addNext_1",
        value: { previousPosition: 0, previousComponentType: "focusConcept", parentGroup: undefined },
        position: 1,
        type: "addNext",
        label: "",
        component: "AddNext"
      },
      { id: "logic_1", value: "AND", position: 1, type: "logic", component: "Logic", label: "AND" },
      {
        id: "addNext_2",
        value: { previousPosition: 1, previousComponentType: "logic", parentGroup: undefined },
        position: 2,
        type: "addNext",
        label: "",
        component: "AddNext"
      }
    ]);
    expect(wrapper.vm.updatePositions).toHaveBeenCalledTimes(1);
  });

  it("can addNextOptions ___ addNext", async () => {
    wrapper.vm.queryBuild = [
      {
        id: "focusConcept_0",
        value: {
          children: []
        },
        position: 0,
        type: "focusConcept",
        label: "",
        component: "FocusConcept"
      },
      { id: "logic_1", value: "AND", position: 1, type: "logic", component: "Logic", label: "AND" },
      {
        id: "addNext_2",
        value: { previousPosition: 1, previousComponentType: "logic", parentGroup: undefined },
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
      id: "addNext_1",
      value: {
        previousPosition: 1,
        previousComponentType: "logic",
        parentGroup: undefined
      },
      position: 2,
      type: "addNext",
      label: "",
      component: "AddNext"
    });
    wrapper.vm.updatePositions = jest.fn();
    wrapper.vm.addNextOptions({ previousComponentType: "logic", previousPosition: 1, parentGroup: undefined });
    expect(wrapper.vm.queryBuild).toStrictEqual([
      {
        id: "focusConcept_0",
        value: {
          children: []
        },
        position: 0,
        type: "focusConcept",
        label: "",
        component: "FocusConcept"
      },
      { id: "logic_1", value: "AND", position: 1, type: "logic", component: "Logic", label: "AND" },
      {
        id: "addNext_1",
        value: { previousPosition: 1, previousComponentType: "logic", parentGroup: undefined },
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

  it("can addItem ___ end", () => {
    wrapper.vm.updatePositions = jest.fn();
    wrapper.vm.generateNewComponent = jest.fn().mockReturnValue({
      id: "logic_1",
      value: null,
      position: 1,
      type: "logic",
      label: "",
      component: "Logic"
    });
    wrapper.vm.getNextOptions = jest.fn().mockReturnValue({
      id: "addNext_1",
      value: {
        previousPosition: 1,
        previousComponentType: "logic",
        parentGroup: undefined
      },
      position: 2,
      type: "addNext",
      label: "",
      component: "AddNext"
    });
    wrapper.vm.addItem({ selectedType: "logic", position: 1 });
    expect(wrapper.vm.queryBuild).toStrictEqual([
      {
        component: "FocusConcept",
        id: "focusConcept_0",
        label: "",
        position: 0,
        type: "focusConcept",
        value: null
      },
      {
        component: "Logic",
        id: "logic_1",
        label: "",
        position: 1,
        type: "logic",
        value: null
      },
      {
        component: "AddNext",
        id: "addNext_1",
        label: "",
        position: 2,
        type: "addNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "logic",
          previousPosition: 1
        }
      }
    ]);
    expect(wrapper.vm.updatePositions).toHaveBeenCalledTimes(1);
  });

  it("can addItem ___ no end", () => {
    wrapper.vm.queryBuild = [
      {
        component: "FocusConcept",
        id: "focusConcept_0",
        label: "",
        position: 0,
        type: "focusConcept",
        value: null
      },
      {
        component: "AddNext",
        id: "addNext_1",
        label: "",
        position: 1,
        type: "addNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "focusConcept",
          previousPosition: 1
        }
      },
      {
        component: "Logic",
        id: "logic_2",
        label: "",
        position: 2,
        type: "logic",
        value: null
      },
      {
        component: "AddNext",
        id: "addNext_3",
        label: "",
        position: 3,
        type: "addNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "logic",
          previousPosition: 1
        }
      }
    ];
    wrapper.vm.updatePositions = jest.fn();
    wrapper.vm.generateNewComponent = jest.fn().mockReturnValue({
      id: "logic_1",
      value: null,
      position: 1,
      type: "logic",
      label: "",
      component: "Logic"
    });
    wrapper.vm.getNextOptions = jest.fn().mockReturnValue({
      id: "addNext_1",
      value: {
        previousPosition: 1,
        previousComponentType: "logic",
        parentGroup: undefined
      },
      position: 2,
      type: "addNext",
      label: "",
      component: "AddNext"
    });
    wrapper.vm.addItem({ selectedType: "logic", position: 1 });
    expect(wrapper.vm.queryBuild).toStrictEqual([
      {
        component: "FocusConcept",
        id: "focusConcept_0",
        label: "",
        position: 0,
        type: "focusConcept",
        value: null
      },
      {
        component: "Logic",
        id: "logic_1",
        label: "",
        position: 1,
        type: "logic",
        value: null
      },
      {
        component: "Logic",
        id: "logic_2",
        label: "",
        position: 2,
        type: "logic",
        value: null
      },
      {
        component: "AddNext",
        id: "addNext_3",
        label: "",
        position: 3,
        type: "addNext",
        value: {
          parentGroup: undefined,
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

  it("can generateQueryString", () => {
    wrapper.vm.queryBuild = [
      {
        component: "FocusConcept",
        id: "focusConcept_0",
        label: "<< *",
        position: 0,
        type: "focusConcept",
        value: null
      },
      {
        component: "Logic",
        id: "logic_1",
        label: "AND",
        position: 1,
        type: "logic",
        value: null
      },
      {
        component: "AddNext",
        id: "addNext_2",
        label: "",
        position: 2,
        type: "addNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "logic",
          previousPosition: 1
        }
      }
    ];
    wrapper.vm.generateQueryString();
    expect(wrapper.vm.queryString).toBe("<< * AND\n");
  });

  it("can deleteItem ___ position 0", () => {
    wrapper.vm.queryBuild = [
      {
        component: "FocusConcept",
        id: "focusConcept_0",
        label: "testLabel",
        position: 0,
        type: "focusConcept",
        value: null
      },
      {
        component: "AddNext",
        id: "addNext_1",
        label: "",
        position: 1,
        type: "addNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "focusConcept",
          previousPosition: 1
        }
      },
      {
        component: "Logic",
        id: "logic_2",
        label: "",
        position: 2,
        type: "logic",
        value: null
      },
      {
        component: "AddNext",
        id: "addNext_3",
        label: "",
        position: 3,
        type: "addNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "logic",
          previousPosition: 1
        }
      }
    ];
    wrapper.vm.updatePositions = jest.fn();
    wrapper.vm.setStartBuild = jest.fn().mockReturnValue([
      {
        component: ECLComponent.FOCUS_CONCEPT,
        id: ECLType.FOCUS_CONCEPT + "_0",
        label: "",
        position: 0,
        type: ECLType.FOCUS_CONCEPT,
        value: null
      },
      {
        component: ECLComponent.ADD_NEXT,
        id: ECLType.ADD_NEXT + "_1",
        value: {
          previousPosition: 0,
          previousComponentType: ECLType.FOCUS_CONCEPT,
          parentGroup: undefined
        },
        position: 1,
        type: ECLType.ADD_NEXT,
        label: ""
      }
    ]);
    wrapper.vm.getNextOptions = jest.fn().mockReturnValue({
      id: "addNext_1",
      value: {
        previousPosition: 1,
        previousComponentType: "logic",
        parentGroup: undefined
      },
      position: 2,
      type: "addNext",
      label: "",
      component: "AddNext"
    });
    wrapper.vm.deleteItem({
      component: "FocusConcept",
      id: "focusConcept",
      label: "testLabel",
      position: 0,
      type: "focusConcept",
      value: null
    });
    expect(wrapper.vm.queryBuild).toStrictEqual([
      {
        component: "FocusConcept",
        id: "focusConcept_0",
        label: "",
        position: 0,
        type: "focusConcept",
        value: null
      },
      {
        component: "AddNext",
        id: "addNext_1",
        label: "",
        position: 1,
        type: "addNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "focusConcept",
          previousPosition: 1
        }
      },
      {
        component: "Logic",
        id: "logic_2",
        label: "",
        position: 2,
        type: "logic",
        value: null
      },
      {
        component: "AddNext",
        id: "addNext_1",
        label: "",
        position: 2,
        type: "addNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "logic",
          previousPosition: 1
        }
      }
    ]);
    expect(wrapper.vm.updatePositions).toHaveBeenCalledTimes(1);
  });

  it("can deleteItem ___ end", () => {
    wrapper.vm.queryBuild = [
      {
        component: "FocusConcept",
        id: "focusConcept_0",
        label: "testLabel",
        position: 0,
        type: "focusConcept",
        value: null
      },
      {
        component: "AddNext",
        id: "addNext_1",
        label: "",
        position: 1,
        type: "addNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "focusConcept",
          previousPosition: 1
        }
      },
      {
        component: "Logic",
        id: "logic_2",
        label: "",
        position: 2,
        type: "logic",
        value: null
      },
      {
        component: "AddNext",
        id: "addNext_3",
        label: "",
        position: 3,
        type: "addNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "logic",
          previousPosition: 1
        }
      }
    ];
    wrapper.vm.updatePositions = jest.fn();
    wrapper.vm.setStartBuild = jest.fn();
    wrapper.vm.getNextOptions = jest.fn().mockReturnValue({
      id: "addNext_1",
      value: {
        previousPosition: 1,
        previousComponentType: "logic",
        parentGroup: undefined
      },
      position: 2,
      type: "addNext",
      label: "",
      component: "AddNext"
    });
    wrapper.vm.deleteItem({
      component: "AddNext",
      id: "addNext_3",
      label: "",
      position: 3,
      type: "addNext",
      value: {
        parentGroup: undefined,
        previousComponentType: "logic",
        previousPosition: 1
      }
    });
    expect(wrapper.vm.queryBuild).toStrictEqual([
      {
        component: "FocusConcept",
        id: "focusConcept_0",
        label: "testLabel",
        position: 0,
        type: "focusConcept",
        value: null
      },
      {
        component: "AddNext",
        id: "addNext_1",
        label: "",
        position: 1,
        type: "addNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "focusConcept",
          previousPosition: 1
        }
      },
      {
        component: "Logic",
        id: "logic_2",
        label: "",
        position: 2,
        type: "logic",
        value: null
      },
      {
        component: "AddNext",
        id: "addNext_1",
        label: "",
        position: 2,
        type: "addNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "logic",
          previousPosition: 1
        }
      }
    ]);
    expect(wrapper.vm.updatePositions).toHaveBeenCalledTimes(1);
  });

  it("can deleteItem ___ middle ___ addNext followed", () => {
    wrapper.vm.queryBuild = [
      {
        component: "FocusConcept",
        id: "focusConcept_0",
        label: "testLabel",
        position: 0,
        type: "focusConcept",
        value: null
      },
      {
        component: "Logic",
        id: "logic_1",
        label: "",
        position: 1,
        type: "logic",
        value: null
      },
      {
        component: "AddNext",
        id: "addNext_2",
        label: "",
        position: 2,
        type: "addNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "logic",
          previousPosition: 1
        }
      },
      {
        component: "RefinementGroup",
        id: "refinementGroup_3",
        label: "testLabel",
        position: 3,
        type: "refinementGroup",
        value: { children: [] }
      },
      {
        component: "AddNext",
        id: "addNext_4",
        label: "",
        position: 4,
        type: "addNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "logic",
          previousPosition: 1
        }
      }
    ];
    wrapper.vm.updatePositions = jest.fn();
    wrapper.vm.setStartBuild = jest.fn();
    wrapper.vm.getNextOptions = jest.fn().mockReturnValue({
      id: "addNext_1",
      value: {
        previousPosition: 1,
        previousComponentType: "focusConcept",
        parentGroup: undefined
      },
      position: 1,
      type: "addNext",
      label: "",
      component: "AddNext"
    });
    wrapper.vm.deleteItem({
      component: "Logic",
      id: "logic_1",
      label: "",
      position: 1,
      type: "logic",
      value: null
    });
    expect(wrapper.vm.queryBuild).toStrictEqual([
      {
        component: "FocusConcept",
        id: "focusConcept_0",
        label: "testLabel",
        position: 0,
        type: "focusConcept",
        value: null
      },
      {
        component: "AddNext",
        id: "addNext_1",
        label: "",
        position: 1,
        type: "addNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "focusConcept",
          previousPosition: 1
        }
      },
      {
        component: "RefinementGroup",
        id: "refinementGroup_3",
        label: "testLabel",
        position: 3,
        type: "refinementGroup",
        value: { children: [] }
      },
      {
        component: "AddNext",
        id: "addNext_1",
        label: "",
        position: 1,
        type: "addNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "focusConcept",
          previousPosition: 1
        }
      }
    ]);
    expect(wrapper.vm.updatePositions).toHaveBeenCalledTimes(1);
  });

  it("can deleteItem ___ middle ___ other", () => {
    wrapper.vm.queryBuild = [
      {
        component: "FocusConcept",
        id: "focusConcept_0",
        label: "testLabel",
        position: 0,
        type: "focusConcept",
        value: null
      },
      {
        component: "Logic",
        id: "logic_1",
        label: "",
        position: 1,
        type: "logic",
        value: null
      },
      {
        component: "RefinementGroup",
        id: "refinementGroup_2",
        label: "testLabel",
        position: 2,
        type: "refinementGroup",
        value: null
      },
      {
        component: "AddNext",
        id: "addNext_3",
        label: "",
        position: 3,
        type: "addNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "refinementGroup",
          previousPosition: 1
        }
      }
    ];
    wrapper.vm.updatePositions = jest.fn();
    wrapper.vm.setStartBuild = jest.fn();
    wrapper.vm.getNextOptions = jest.fn().mockReturnValue({
      id: "addNext_1",
      value: {
        previousPosition: 1,
        previousComponentType: "focusConcept",
        parentGroup: undefined
      },
      position: 1,
      type: "addNext",
      label: "",
      component: "AddNext"
    });
    wrapper.vm.deleteItem({
      component: "Logic",
      id: "logic_1",
      label: "",
      position: 1,
      type: "logic",
      value: null
    });
    expect(wrapper.vm.queryBuild).toStrictEqual([
      {
        component: "FocusConcept",
        id: "focusConcept_0",
        label: "testLabel",
        position: 0,
        type: "focusConcept",
        value: null
      },
      {
        component: "RefinementGroup",
        id: "refinementGroup_2",
        label: "testLabel",
        position: 2,
        type: "refinementGroup",
        value: null
      },
      {
        component: "AddNext",
        id: "addNext_1",
        label: "",
        position: 1,
        type: "addNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "focusConcept",
          previousPosition: 1
        }
      }
    ]);
    expect(wrapper.vm.updatePositions).toHaveBeenCalledTimes(1);
  });

  it("can updateItem", () => {
    wrapper.vm.updateItem({
      id: "focusConcept_0",
      value: null,
      position: 0,
      type: "focusConcept",
      label: "testLabel",
      component: "FocusConcept"
    });
    expect(wrapper.vm.queryBuild).toStrictEqual([
      {
        component: "FocusConcept",
        id: "focusConcept_0",
        label: "testLabel",
        position: 0,
        type: "focusConcept",
        value: null
      },
      {
        component: "AddNext",
        id: "addNext_1",
        label: "",
        position: 1,
        type: "addNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "focusConcept",
          previousPosition: 0
        }
      }
    ]);
  });

  it("can getNextOptions", () => {
    expect(wrapper.vm.getNextOptions(0, ECLType.FOCUS_CONCEPT, undefined)).toStrictEqual({
      id: "addNext_1",
      value: {
        previousPosition: 0,
        previousComponentType: ECLType.FOCUS_CONCEPT,
        parentGroup: undefined
      },
      position: 1,
      type: ECLType.ADD_NEXT,
      label: "",
      component: ECLComponent.ADD_NEXT
    });
  });

  it("can generateNewComponent ___ refinementGroup", () => {
    expect(wrapper.vm.generateNewComponent(ECLType.REFINEMENT_GROUP, 1)).toStrictEqual({
      id: ECLType.REFINEMENT_GROUP + "_1",
      value: null,
      position: 1,
      type: ECLType.REFINEMENT_GROUP,
      label: "",
      component: ECLComponent.REFINEMENT_GROUP
    });
  });

  it("can generateNewComponent ___ logic", () => {
    expect(wrapper.vm.generateNewComponent(ECLType.LOGIC, 1)).toStrictEqual({
      id: ECLType.LOGIC + "_1",
      value: null,
      position: 1,
      type: ECLType.LOGIC,
      label: "",
      component: ECLComponent.LOGIC
    });
  });

  it("can generateNewComponent ___ focusConcept", () => {
    expect(wrapper.vm.generateNewComponent(ECLType.FOCUS_CONCEPT, 1)).toStrictEqual({
      id: ECLType.FOCUS_CONCEPT + "_1",
      value: null,
      position: 1,
      type: ECLType.FOCUS_CONCEPT,
      label: "",
      component: ECLComponent.FOCUS_CONCEPT
    });
  });

  it("can generateNewComponent ___ other", () => {
    expect(wrapper.vm.generateNewComponent(ECLType.EXPRESSION, 1)).toStrictEqual(undefined);
  });

  it("can setStartBuild", () => {
    expect(wrapper.vm.setStartBuild()).toStrictEqual([
      {
        component: ECLComponent.FOCUS_CONCEPT,
        id: ECLType.FOCUS_CONCEPT + "_" + 0,
        value: null,
        position: 0,
        type: ECLType.FOCUS_CONCEPT,
        label: ""
      },
      {
        id: ECLType.ADD_NEXT + "_" + 1,
        value: {
          previousPosition: 0,
          previousComponentType: ECLType.FOCUS_CONCEPT,
          parentGroup: undefined
        },
        position: 1,
        type: ECLType.ADD_NEXT,
        label: "",
        component: ECLComponent.ADD_NEXT
      }
    ]);
  });

  it("can updatePositions", () => {
    wrapper.vm.queryBuild = [
      {
        component: "FocusConcept",
        id: "focusConcept_0",
        label: "",
        position: 2,
        type: "focusConcept",
        value: null
      },
      {
        component: "Logic",
        id: "logic_1",
        label: "",
        position: 1,
        type: "logic",
        value: null
      },
      {
        component: "AddNext",
        id: "addNext_1",
        label: "",
        position: 0,
        type: "addNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "logic",
          previousPosition: 1
        }
      }
    ];
    wrapper.vm.updatePositions();
    expect(wrapper.vm.queryBuild).toStrictEqual([
      {
        component: "FocusConcept",
        id: "focusConcept_0",
        label: "",
        position: 0,
        type: "focusConcept",
        value: null
      },
      {
        component: "Logic",
        id: "logic_1",
        label: "",
        position: 1,
        type: "logic",
        value: null
      },
      {
        component: "AddNext",
        id: "addNext_1",
        label: "",
        position: 2,
        type: "addNext",
        value: {
          parentGroup: undefined,
          previousComponentType: "logic",
          previousPosition: 1
        }
      }
    ]);
  });

  it("can copyToClipboard", () => {
    wrapper.vm.queryString = "testString";
    expect(wrapper.vm.copyToClipboard()).toBe("testString");
  });

  it("toasts onCopy", () => {
    wrapper.vm.onCopy();
    expect(mockToast.add).toHaveBeenCalledTimes(1);
    expect(mockToast.add).toHaveBeenCalledWith(LoggerService.success("Value copied to clipboard"));
  });

  it("toasts onCopyError", () => {
    wrapper.vm.onCopyError();
    expect(mockToast.add).toHaveBeenCalledTimes(1);
    expect(mockToast.add).toHaveBeenCalledWith(LoggerService.error("Failed to copy value to clipboard"));
  });
});
