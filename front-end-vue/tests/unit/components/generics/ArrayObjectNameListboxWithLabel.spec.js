import { mount } from "@vue/test-utils";
import ArrayObjectNameListboxWithLabel from "@/components/generics/ArrayObjectNameListboxWithLabel.vue";
import Listbox from "primevue/listbox";
import Button from "primevue/button";
import StyleClass from "primevue/styleclass";

describe("ArrayObjectNameListboxWithLabel.vue ___ ontology", () => {
  let wrapper;
  let mockRoute;
  let mockRouter;
  let mockStore;
  let docSpy;
  let mockButton;

  beforeEach(() => {
    jest.resetAllMocks();

    mockRoute = { name: "Concept" };
    mockRouter = { push: jest.fn() };
    mockStore = {
      state: {
        selectedEntityType: "Ontology"
      }
    };

    mockButton = {
      click: jest.fn()
    };

    docSpy = jest.spyOn(document, "getElementById");
    docSpy.mockReturnValue(mockButton);

    wrapper = mount(ArrayObjectNameListboxWithLabel, {
      global: {
        components: { Listbox, Button },
        mocks: { $route: mockRoute, $router: mockRouter, $store: mockStore },
        directives: { styleclass: StyleClass }
      },
      props: {
        label: "Is a",
        size: "50%",
        data: [
          { "@id": "http://snomed.info/sct#12903001", name: "Acquired curvature of spine (disorder)" },
          { "@id": "http://snomed.info/sct#298382003", name: "Scoliosis deformity of spine (disorder)" }
        ]
      }
    });

    jest.clearAllMocks();
  });

  it("renders mounted data", () => {
    const label = wrapper.get(".label");
    expect(label.text()).toBe("Is a:");
    const row1 = wrapper.get(".data-name");
    expect(row1.text()).toBe("Acquired curvature of spine (disorder)");
    expect(wrapper.vm.selected).toStrictEqual({});
  });

  it("expandAtStartup ___ true", () => {
    wrapper.vm.expandAtStartup();
    expect(mockButton.click).toHaveBeenCalledTimes(1);
  });

  it("can check isArrayObjectWithName ___ true", () => {
    expect(
      ArrayObjectNameListboxWithLabel.computed.isArrayObjectWithName.call({
        data: [
          { "@id": "http://snomed.info/sct#64217002", name: "Curvature of spine (disorder)" },
          { "@id": "http://snomed.info/sct#928000", name: "Disorder of musculoskeletal system (disorder)" },
          { "@id": "http://snomed.info/sct#699699005", name: "Disorder of vertebral column (disorder)" }
        ]
      })
    ).toBe(true);
  });

  it("can check isArrayObjectWithName ___ false ___ empty array", () => {
    expect(ArrayObjectNameListboxWithLabel.computed.isArrayObjectWithName.call({ data: [] })).toBe(false);
  });

  it("can check isArrayObjectWithName ___ false ___ undefined", () => {
    const warn = console.warn;
    console.warn = jest.fn();
    expect(ArrayObjectNameListboxWithLabel.computed.isArrayObjectWithName.call({ data: undefined })).toBe(false);
    expect(console.warn).not.toHaveBeenCalled();
    console.warn = warn;
  });

  it("can check isArrayObjectWithName ___ false ___ bad data", () => {
    const warn = console.warn;
    console.warn = jest.fn();
    expect(
      ArrayObjectNameListboxWithLabel.computed.isArrayObjectWithName.call({
        data: [{ "@id": "http://snomed.info/sct#64217002", statusname: "Curvature of spine (disorder)" }]
      })
    ).toBe(false);
    expect(console.warn).toHaveBeenCalledWith(
      "Data error. Data is not array, array does not contain Object or Object has no property 'name' for use within component ArrayObjectNameListboxWithLabel.vue"
    );
    console.warn = warn;
  });

  it("can navigate", () => {
    wrapper.vm.navigate("testIri");
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "Concept", params: { selectedIri: "testIri" } });
  });

  it("can navigate ___ no iri", () => {
    wrapper.vm.navigate(undefined);
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("can setButtonExpanded ___ true", () => {
    expect(wrapper.vm.buttonExpanded).toBe(false);
    wrapper.vm.setButtonExpanded();
    expect(wrapper.vm.buttonExpanded).toBe(true);
  });

  it("can setButtonExpanded ___ false", () => {
    wrapper.vm.buttonExpanded = true;
    wrapper.vm.setButtonExpanded();
    expect(wrapper.vm.buttonExpanded).toBe(false);
  });

  it("expandAtStartup ___ true", () => {
    wrapper.vm.expandAtStartup();
    expect(mockButton.click).toHaveBeenCalled();
  });

  it("expandAtStartup ___ no button", () => {
    docSpy.mockReturnValue(null);
    wrapper.vm.expandAtStartup();
    expect(mockButton.click).not.toHaveBeenCalled();
  });
});

describe("ArrayObjectNameListboxWithLabel.vue ___ sets", () => {
  let wrapper;
  let mockRoute;
  let mockRouter;
  let mockStore;
  let docSpy;
  let mockButton;

  beforeEach(() => {
    jest.resetAllMocks();

    mockRoute = { name: "Concept" };
    mockRouter = { push: jest.fn() };
    mockStore = {
      state: {
        selectedEntityType: "Sets"
      }
    };

    mockButton = {
      click: jest.fn()
    };

    docSpy = jest.spyOn(document, "getElementById");
    docSpy.mockReturnValue(mockButton);

    wrapper = mount(ArrayObjectNameListboxWithLabel, {
      global: {
        components: { Listbox, Button },
        mocks: { $route: mockRoute, $router: mockRouter, $store: mockStore },
        directives: { styleclass: StyleClass }
      },
      props: {
        label: "Subtype of",
        size: "50%",
        data: [
          { "@id": "http://snomed.info/sct#12903001", name: "Acquired curvature of spine (disorder)" },
          { "@id": "http://snomed.info/sct#298382003", name: "Scoliosis deformity of spine (disorder)" }
        ]
      }
    });

    jest.clearAllMocks();
  });

  it("expandAtStartup ___ false", () => {
    wrapper.vm.expandAtStartup();
    expect(mockButton.click).not.toHaveBeenCalled();
  });
});
