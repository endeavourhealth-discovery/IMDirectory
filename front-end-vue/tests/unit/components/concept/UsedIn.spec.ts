import { flushPromises, shallowMount } from "@vue/test-utils";
import UsedIn from "@/components/concept/UsedIn.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import EntityService from "@/services/EntityService";

describe("UsedIn.vue", () => {
  let wrapper: any;
  let mockRouter: any;
  let mockToast: any;
  let docSpy: any;
  const USAGES = [
    { name: "Acrodysplasia scoliosis (disorder)", "@id": "http://snomed.info/sct#773773006" },
    { name: "Anterior vertebral body tethering (procedure)", "@id": "http://snomed.info/sct#788325009" },
    { name: "Congenital scoliosis due to bony malformation (disorder)", "@id": "http://snomed.info/sct#205045003" },
    { name: "Distal arthrogryposis type 4 (disorder)", "@id": "http://snomed.info/sct#715575001" },
    { name: "Duane anomaly, myopathy, scoliosis syndrome (disorder)", "@id": "http://snomed.info/sct#722432000" },
    { name: "Family history of scoliosis deformity of spine (situation)", "@id": "http://snomed.info/sct#430544007" },
    { name: "Horizontal gaze palsy with progressive scoliosis (disorder)", "@id": "http://snomed.info/sct#702381007" },
    { name: "Lordoscoliosis (disorder)", "@id": "http://snomed.info/sct#111268000" },
    { name: "Post-surgical scoliosis (disorder)", "@id": "http://snomed.info/sct#203647008" },
    { name: "Scoliosis in neurofibromatosis (disorder)", "@id": "http://snomed.info/sct#203663000" },
    { name: "Scoliosis in skeletal dysplasia (disorder)", "@id": "http://snomed.info/sct#203661003" }
  ];

  beforeEach(async () => {
    jest.resetAllMocks();
    EntityService.getEntityUsages = jest.fn().mockResolvedValue(USAGES);
    EntityService.getUsagesTotalRecords = jest.fn().mockResolvedValue(50);
    mockRouter = {
      push: jest.fn()
    };
    mockToast = {
      add: jest.fn()
    };
    docSpy = jest.spyOn(document, "getElementById");
    docSpy.mockReturnValue(undefined);

    const warn = console.warn;
    console.warn = jest.fn();

    const error = console.error;
    console.error = jest.fn();

    wrapper = shallowMount(UsedIn, {
      global: {
        components: { DataTable, Column },
        mocks: { $router: mockRouter, $toast: mockToast }
      },
      props: { conceptIri: "http://snomed.info/sct#298382003" }
    });

    await flushPromises();
    jest.clearAllMocks();

    console.warn = warn;
    console.error = error;
  });

  it("starts with empty values", () => {
    expect(wrapper.vm.selected).toStrictEqual({});
    expect(wrapper.vm.usages).toStrictEqual(USAGES);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.recordsTotal).toBe(50);
    expect(wrapper.vm.currentPage).toBe(0);
    expect(wrapper.vm.pageSize).toBe(25);
    expect(wrapper.vm.scrollHeight).toBe("");
    expect(wrapper.vm.templateString).toBe("Displaying {first} to {last} of {totalRecords} concepts");
  });

  it("inits on iri change", async () => {
    wrapper.vm.init = jest.fn();
    wrapper.vm.$options.watch.conceptIri.call(wrapper.vm, "http://endhealth.info/im#DiscoveryOntology");
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.init).toHaveBeenCalledTimes(1);
  });

  it("adds event listener to setHeight and Scroll on resize", async () => {
    console.error = jest.fn();
    await flushPromises();
    const spy = jest.spyOn(wrapper.vm, "setScrollHeight");
    window.dispatchEvent(new Event("resize"));
    await wrapper.vm.$nextTick();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockReset();
  });

  it("can remove eventListener", () => {
    console.error = jest.fn();
    const spy = jest.spyOn(global, "removeEventListener");
    wrapper.unmount();
    expect(spy).toHaveBeenCalled();
    spy.mockReset();
  });

  it("can resize", () => {
    console.error = jest.fn();
    console.warn = jest.fn();
    wrapper.vm.setScrollHeight = jest.fn();
    wrapper.vm.onResize();
    expect(wrapper.vm.setScrollHeight).toHaveBeenCalledTimes(1);
  });

  it("gets usages", async () => {
    wrapper.vm.getUsages("http://snomed.info/sct#298382003", 0, 25);
    await flushPromises();
    expect(EntityService.getEntityUsages).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityUsages).toHaveBeenCalledWith("http://snomed.info/sct#298382003", 0, 25);
    expect(wrapper.vm.usages).toStrictEqual(USAGES);
  });

  it("gets recordsSize ___ success", async () => {
    wrapper.vm.records = 0;
    wrapper.vm.getRecordsSize("http://snomed.info/sct#298382003");
    await flushPromises();
    expect(EntityService.getUsagesTotalRecords).toHaveBeenCalledTimes(1);
    expect(EntityService.getUsagesTotalRecords).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(wrapper.vm.recordsTotal).toBe(50);
  });

  it("can handle page", () => {
    wrapper.vm.getPage = jest.fn();
    wrapper.vm.scrollToTop = jest.fn();
    wrapper.vm.handlePage({ rows: 100, page: 7 });
    expect(wrapper.vm.pageSize).toBe(100);
    expect(wrapper.vm.currentPage).toBe(7);
  });

  it("can handlePage", async () => {
    wrapper.vm.getUsages = jest.fn();
    wrapper.vm.scrollToTop = jest.fn();
    wrapper.vm.handlePage({ rows: 50, page: 7 });
    expect(wrapper.vm.loading).toBe(true);
    expect(wrapper.vm.pageSize).toBe(50);
    expect(wrapper.vm.currentPage).toBe(7);
    expect(wrapper.vm.getUsages).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.getUsages).toHaveBeenCalledWith("http://snomed.info/sct#298382003", 7, 50);
    await flushPromises();
    expect(wrapper.vm.scrollToTop).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.loading).toBe(false);
  });

  it("can handleSelected", () => {
    wrapper.vm.selected = { "@id": "testIri" };
    wrapper.vm.handleSelected();
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "Concept", params: { selectedIri: "testIri" } });
  });

  it("can handleSelected ___ no selected", () => {
    wrapper.vm.handleSelected();
    expect(mockRouter.push).not.toHaveBeenCalledTimes(1);
  });

  it("can scroll to top", () => {
    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = jest.fn().mockReturnValue({ height: 100 });
    mockElement.scrollTop = 100;
    mockElement.getElementsByClassName = jest.fn().mockReturnValue([mockElement]);
    docSpy.mockReturnValue(mockElement);
    wrapper.vm.scrollToTop();
    expect(mockElement.scrollTop).toBe(0);
  });

  it("can scroll to top ___ container fail", () => {
    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = jest.fn().mockReturnValue({ height: 100 });
    mockElement.scrollTop = 100;
    mockElement.getElementsByClassName = jest.fn().mockReturnValue([undefined]);
    docSpy.mockReturnValue(undefined);
    wrapper.vm.scrollToTop();
    expect(mockElement.scrollTop).toBe(100);
  });

  it("can setScrollHeight", () => {
    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = jest.fn().mockReturnValue({ height: 100 });
    mockElement.scrollTop = 100;
    mockElement.getElementsByClassName = jest.fn().mockReturnValue([mockElement]);
    docSpy.mockReturnValue(mockElement);
    wrapper.vm.setScrollHeight();
    expect(wrapper.vm.scrollHeight).not.toBe("");
  });

  it("can setScrollHeight ___ paginator fail", () => {
    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = jest.fn().mockReturnValue({ height: 100 });
    mockElement.scrollTop = 100;
    mockElement.getElementsByClassName = jest.fn().mockReturnValue([undefined]);
    docSpy.mockReturnValue(mockElement);
    wrapper.vm.setScrollHeight();
    expect(wrapper.vm.scrollHeight).not.toBe("500px");
  });

  it("can setScrollHeight ___ container fail", () => {
    wrapper.vm.setScrollHeight();
    expect(wrapper.vm.scrollHeight).toBe("");
  });
});
