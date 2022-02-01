import { flushPromises, shallowMount } from "@vue/test-utils";
import SimpleMaps from "@/components/concept/mapping/SimpleMaps.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

describe("SimpleMapsTable.vue", () => {
  let wrapper: any;
  let mockRouter: any;
  let docSpy: any;
  const SIMPLE_MAP = [
    { name: "Amputation of right foot", iri: "http://endhealth.info/emis#^ESCTAM784250", scheme: "EMIS (inc. Read2 like) namespace" },
    { name: "Amputation of right foot", iri: "http://endhealth.info/emis#^ESCTAM784250", scheme: "EMIS (inc. Read2 like) namespace" }
  ];

  beforeEach(async () => {
    jest.resetAllMocks();
    mockRouter = {
      push: jest.fn()
    };

    docSpy = jest.spyOn(document, "getElementById");
    docSpy.mockReturnValue(undefined);

    const warn = console.warn;
    console.warn = jest.fn();

    wrapper = shallowMount(SimpleMaps, {
      global: {
        components: { DataTable, Column },
        mocks: { $router: mockRouter }
      },
      props: { data: SIMPLE_MAP }
    });

    console.warn = warn;
  });

  it("mounts", async () => {
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.data).toStrictEqual(SIMPLE_MAP);
    expect(wrapper.vm.scrollHeight).toBe("500px");
    expect(wrapper.vm.rows).toBe(25);
  });

  it("adds event listener to setHeight and Scroll on resize", async () => {
    await flushPromises();
    const spy = jest.spyOn(wrapper.vm, "setTableWidth");
    window.dispatchEvent(new Event("resize"));
    await wrapper.vm.$nextTick();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockReset();
  });

  it("can remove eventListener", () => {
    const spy = jest.spyOn(global, "removeEventListener");
    wrapper.unmount();
    expect(spy).toHaveBeenCalled();
    spy.mockReset();
  });

  it("can resize", () => {
    wrapper.vm.setTableWidth = jest.fn();
    wrapper.vm.onResize();
    expect(wrapper.vm.setTableWidth).toHaveBeenCalledTimes(1);
  });

  it("can setTableWidth", () => {
    const mockElement = document.createElement("div");
    mockElement.style.width = "10px";
    mockElement.getElementsByClassName = jest.fn().mockReturnValue([mockElement]);
    docSpy.mockReturnValue(mockElement);
    wrapper.vm.setTableWidth();
    expect(mockElement.style.width).toBe("100%");
  });

  it("can setTableWidth ___ element fail", () => {
    const mockElement = document.createElement("div");
    mockElement.style.width = "10px";
    mockElement.getElementsByClassName = jest.fn().mockReturnValue([undefined]);
    docSpy.mockReturnValue(mockElement);
    wrapper.vm.setTableWidth();
    expect(mockElement.style.width).toBe("10px");
  });

  it("can scrollToTop", () => {
    const mockElement = document.createElement("div");
    mockElement.scrollTop = 100;
    mockElement.getElementsByClassName = jest.fn().mockReturnValue([mockElement]);
    docSpy.mockReturnValue(mockElement);
    wrapper.vm.scrollToTop();
    expect(mockElement.scrollTop).toBe(0);
  });

  it("can scrollToTop ___ id element fail", () => {
    const mockElement = document.createElement("div");
    mockElement.scrollTop = 100;
    mockElement.getElementsByClassName = jest.fn().mockReturnValue([undefined]);
    docSpy.mockReturnValue(mockElement);
    wrapper.vm.scrollToTop();
    expect(mockElement.scrollTop).toBe(100);
  });

  it("can scrollToTop ___ class element fail", () => {
    const mockElement = document.createElement("div");
    mockElement.scrollTop = 100;
    mockElement.getElementsByClassName = jest.fn().mockReturnValue([undefined]);
    docSpy.mockReturnValue(undefined);
    wrapper.vm.scrollToTop();
    expect(mockElement.scrollTop).toBe(100);
  });

  it("can toggle", async () => {
    wrapper.vm.toggle("testEvent", "testData");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().toggleOverlay).toBeTruthy();
    expect(wrapper.emitted().toggleOverlay[0]).toStrictEqual(["testEvent", "testData"]);
  });
});
