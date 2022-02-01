import CatalogueSearchResults from "@/components/catalogue/catalogueSideBar/CatalogueSearchResults.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { shallowMount } from "@vue/test-utils";

describe("CatalogueSearchResults", () => {
  let wrapper: any;
  let mockRouter: any;
  let docSpy: any;
  let mockElement: any;

  beforeEach(() => {
    jest.resetAllMocks();

    mockRouter = {
      push: jest.fn()
    };

    docSpy = jest.spyOn(document, "getElementById");
    docSpy.mockReturnValue(undefined);

    wrapper = shallowMount(CatalogueSearchResults, {
      props: { searchResults: [], loading: false },
      global: { components: { DataTable, Column }, mocks: { $router: mockRouter } }
    });

    jest.clearAllMocks();
  });

  it("mounts", () => {
    expect(wrapper.vm.searchResults).toStrictEqual([]);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.selected).toStrictEqual({});
  });

  it("can setSelectedInstance ___ has id", async () => {
    wrapper.vm.selected = { name: "BARTS HEALTH NHS TRUST", iriType: { "@id": "Organisation  (record type)" }, "@id": "http://org.endhealth.info/im#R1H" };
    wrapper.vm.setSelectedInstance();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().searchResultSelected).toBeTruthy();
    expect(wrapper.emitted().searchResultSelected[0]).toStrictEqual([
      {
        name: "BARTS HEALTH NHS TRUST",
        iriType: { "@id": "Organisation  (record type)" },
        "@id": "http://org.endhealth.info/im#R1H"
      }
    ]);
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "Individual", params: { selectedIri: "http://org.endhealth.info/im#R1H" } });
  });

  it("can setSelectedInstance ___ no id", async () => {
    wrapper.vm.selected = { name: "BARTS HEALTH NHS TRUST", iriType: { "@id": "Organisation  (record type)" } };
    wrapper.vm.setSelectedInstance();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().searchResultSelected).toBeFalsy();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("can scroll to top", () => {
    const mockElement = document.createElement("div");
    mockElement.scrollTop = 100;
    mockElement.getElementsByClassName = jest.fn().mockReturnValue([mockElement]);
    docSpy.mockReturnValue(mockElement);
    wrapper.vm.scrollToTop();
    expect(mockElement.scrollTop).toBe(0);
  });

  it("can scroll to top ___ container fail", () => {
    const mockElement = document.createElement("div");
    mockElement.scrollTop = 100;
    mockElement.getElementsByClassName = jest.fn().mockReturnValue([undefined]);
    docSpy.mockReturnValue(undefined);
    wrapper.vm.scrollToTop();
    expect(mockElement.scrollTop).toBe(100);
  });
});
