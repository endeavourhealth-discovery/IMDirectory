import Builder from "@/components/eclSearch/Builder.vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { shallowMount, flushPromises } from "@vue/test-utils";
import Tooltip from "primevue/tooltip";
import { Enums } from "im-library";
import { vi } from "vitest";
const { ECLComponent } = Enums;

describe("Builder.vue", () => {
  let wrapper;
  let mockToast;
  let docSpy;
  let mockLoggerService;

  beforeEach(async () => {
    vi.resetAllMocks();

    mockToast = { add: vi.fn() };
    mockLoggerService = { error: vi.fn(), warn: vi.fn(), info: vi.fn(), success: vi.fn(), debug: vi.fn() };

    wrapper = shallowMount(Builder, {
      global: {
        components: { Dialog, Button },
        mocks: { $toast: mockToast, $loggerService: mockLoggerService },
        directives: { tooltip: Tooltip, clipboard: { copy: vi.fn(), success: vi.fn(), error: vi.fn() } }
      },
      props: { showDialog: true }
    });

    await wrapper.vm.$nextTick();
    vi.clearAllMocks();
  });

  it("mounts", () => {
    expect(wrapper.vm.showDialog).toBe(true);
    expect(wrapper.vm.queryString).toBe("");
    expect(wrapper.vm.queryBuild).toStrictEqual([
      {
        id: ECLComponent.FOCUS_CONCEPT + "_" + 0,
        value: null,
        position: 0,
        type: ECLComponent.FOCUS_CONCEPT,
        queryString: "",
        showButtons: { minus: false, plus: true }
      }
    ]);
  });

  it("generates query string on query build change", () => {
    wrapper.vm.generateQueryString = vi.fn();
    wrapper.vm.$options.watch.queryBuild.handler.call(wrapper.vm, [
      {
        id: ECLComponent.FOCUS_CONCEPT + "_" + 0,
        value: null,
        position: 0,
        type: ECLComponent.FOCUS_CONCEPT,
        queryString: "",
        showButtons: { minus: false, plus: false }
      }
    ]);
    expect(wrapper.vm.queryBuild).toStrictEqual([
      {
        id: ECLComponent.FOCUS_CONCEPT + "_" + 0,
        value: null,
        position: 0,
        type: ECLComponent.FOCUS_CONCEPT,
        queryString: "",
        showButtons: { minus: false, plus: true }
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

  it("can addItem ___ logic", () => {
    wrapper.vm.generateNewComponent = vi.fn().mockReturnValue({
      id: "logic_1",
      value: null,
      position: 1,
      type: ECLComponent.LOGIC,
      queryString: "",
      showButtons: { minus: false, plus: false }
    });
    wrapper.vm.addItem({ selectedType: ECLComponent.LOGIC, position: 1, value: null });
    expect(wrapper.vm.queryBuild).toStrictEqual([
      {
        id: "FocusConcept_0",
        queryString: "",
        position: 0,
        type: "FocusConcept",
        value: null,
        showButtons: { minus: false, plus: true }
      },
      {
        id: "Logic_1",
        queryString: "",
        position: 1,
        type: "Logic",
        value: { data: null, parentGroup: "Builder" },
        showButtons: { minus: true, plus: true }
      }
    ]);
  });

  it("can generateQueryString", () => {
    wrapper.vm.queryBuild = [
      {
        id: "focusConcept_0",
        queryString: "<< *",
        position: 0,
        type: "FocusConcept",
        value: null,
        showButtons: { minus: false, plus: false }
      },
      {
        id: "logic_1",
        queryString: "AND",
        position: 1,
        type: "Logic",
        value: null,
        showButtons: { minus: false, plus: false }
      }
    ];
    wrapper.vm.generateQueryString();
    expect(wrapper.vm.queryString).toBe("<< * AND\n");
  });

  it("can deleteItem ___ length 0", () => {
    wrapper.vm.queryBuild = [
      {
        component: "FocusConcept",
        id: "focusConcept_0",
        queryString: "testLabel",
        position: 0,
        type: "FocusConcept",
        value: null,
        showButtons: { minus: false, plus: false }
      }
    ];
    wrapper.vm.setStartBuild = vi.fn();
    wrapper.vm.deleteItem({
      id: "focusConcept",
      queryString: "testLabel",
      position: 0,
      type: "FocusConcept",
      value: null,
      showButtons: { minus: false, plus: false }
    });
    expect(wrapper.vm.queryBuild).toStrictEqual([]);
    expect(wrapper.vm.setStartBuild).toHaveBeenCalledTimes(1);
  });

  it("can updateItem", () => {
    wrapper.vm.updateItem({
      id: "focusConcept_0",
      value: null,
      position: 0,
      type: "FocusConcept",
      queryString: "testLabel",
      showButtons: { minus: false, plus: false }
    });
    expect(wrapper.vm.queryBuild).toStrictEqual([
      {
        id: "focusConcept_0",
        queryString: "testLabel",
        position: 0,
        type: "FocusConcept",
        value: null,
        showButtons: { minus: false, plus: false }
      }
    ]);
  });

  it("can setStartBuild", () => {
    wrapper.vm.setStartBuild();
    expect(wrapper.vm.queryBuild).toStrictEqual([
      {
        id: ECLComponent.FOCUS_CONCEPT + "_" + 0,
        value: null,
        position: 0,
        type: ECLComponent.FOCUS_CONCEPT,
        queryString: "",
        showButtons: { minus: false, plus: true }
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
    expect(mockToast.add).toHaveBeenCalledWith(mockLoggerService.success("Value copied to clipboard"));
  });

  it("toasts onCopyError", () => {
    wrapper.vm.onCopyError();
    expect(mockToast.add).toHaveBeenCalledTimes(1);
    expect(mockToast.add).toHaveBeenCalledWith(mockLoggerService.error("Failed to copy value to clipboard"));
  });
});
