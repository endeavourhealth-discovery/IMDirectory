import Properties from "@/components/concept/Properties.vue";
import { flushPromises, shallowMount } from "@vue/test-utils";
import DataTable from "primevue/datatable";
import Button from "primevue/button";
import Column from "primevue/column";
import EntityService from "@/services/EntityService";
import LoggerService from "@/services/LoggerService";

describe("Properties.vue", () => {
  let wrapper;
  let mockRouter;
  let mockRoute;
  let mockRef;
  let docSpy;

  beforeEach(async () => {
    jest.resetAllMocks();

    mockRouter = {
      push: jest.fn()
    };

    mockRoute = {
      name: "Concept"
    };

    mockRef = { render: () => {}, methods: { exportCSV: jest.fn() } };

    docSpy = jest.spyOn(document, "getElementById");
    docSpy.mockReturnValue(undefined);

    EntityService.getDataModelProperties = jest.fn().mockResolvedValue([
      {
        property: {
          name: "manufacturer",
          "@id": "http://endhealth.info/im#manufacturer"
        },
        type: {
          name: "Concept",
          "@id": "http://endhealth.info/im#Concept"
        },
        inheritedFrom: {}
      },
      {
        property: {
          name: "reaction",
          "@id": "http://endhealth.info/im#reaction"
        },
        type: {
          name: "Concept",
          "@id": "http://endhealth.info/im#Concept"
        },
        inheritedFrom: { name: "InheritedParent" },
        minExclusive: 1
      },
      {
        property: {
          name: "vaccination procedure",
          "@id": "http://endhealth.info/im#vaccinationProcedure"
        },
        type: {
          name: "Value set Immunisations - Care connect",
          "@id": "http://endhealth.info/im#VSET_Immunisations_CareConnect"
        },
        inheritedFrom: {},
        minInclusive: 2
      },
      {
        property: {
          name: "vaccine product",
          "@id": "http://endhealth.info/im#vaccineProduct"
        },
        type: {
          name: "Concept",
          "@id": "http://endhealth.info/im#Concept"
        },
        inheritedFrom: {},
        maxInclusive: 3
      },
      {
        property: {
          name: "batch number",
          "@id": "http://endhealth.info/im#batchNumber"
        },
        type: {
          "@id": "http://www.w3.org/2001/XMLSchema#string"
        },
        inheritedFrom: {},
        maxExclusive: 4
      },
      {
        property: {
          name: "dose sequence",
          "@id": "http://endhealth.info/im#doseSequence"
        },
        type: {
          "@id": "http://www.w3.org/2001/XMLSchema#string"
        },
        inheritedFrom: {}
      },
      {
        property: {
          name: "doses required",
          "@id": "http://endhealth.info/im#dosesRequired"
        },
        type: {
          "@id": "http://www.w3.org/2001/XMLSchema#string"
        },
        inheritedFrom: {}
      },
      {
        property: {
          name: "expiry date",
          "@id": "http://endhealth.info/im#expiryDate"
        },
        type: {
          "@id": "http://www.w3.org/2001/XMLSchema#string"
        },
        inheritedFrom: {}
      }
    ]);

    const error = console.error;
    console.error = jest.fn();

    wrapper = shallowMount(Properties, {
      global: {
        components: { DataTable, Column, Button },
        mocks: { $router: mockRouter, $route: mockRoute },
        stubs: { DataTable: mockRef }
      },
      props: { conceptIri: "http://endhealth.info/im#Immunisation" }
    });

    await flushPromises();
    await wrapper.vm.$nextTick();
    jest.clearAllMocks();

    console.error = error;
  });

  it("adds event listener to setScrollHeight on resize", async () => {
    wrapper.vm.setScrollHeight = jest.fn();
    window.dispatchEvent(new Event("resize"));
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.setScrollHeight).toHaveBeenCalledTimes(1);
  });

  it("can remove eventListener", () => {
    const spy = jest.spyOn(global, "removeEventListener");
    wrapper.unmount();
    expect(spy).toHaveBeenCalled();
    spy.mockReset();
  });

  it("sets scrollHeight ___ container fail", async () => {
    wrapper.vm.setScrollHeight();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.scrollHeight).toBe("");
  });

  it("sets scrollHeight ___ container success", async () => {
    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = jest.fn().mockReturnValue({ height: 100 });
    mockElement.getElementsByClassName = jest.fn().mockReturnValue([mockElement]);
    docSpy.mockReturnValue(mockElement);
    wrapper.vm.setScrollHeight();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.scrollHeight).not.toBe("500px");
    docSpy.mockReset();
    jest.clearAllMocks();
  });

  it("sets scrollHeight ___ container no paginator", async () => {
    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = jest.fn().mockReturnValue({ height: 100 });
    mockElement.getElementsByClassName = jest.fn().mockReturnValue([null]);
    docSpy.mockReturnValue(mockElement);
    wrapper.vm.setScrollHeight();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.scrollHeight).not.toBe("500px");
    docSpy.mockReset();
    jest.clearAllMocks();
  });

  it("getsDataModelProps on conceptIri change", async () => {
    wrapper.vm.getDataModelProps = jest.fn();
    wrapper.vm.$options.watch.conceptIri.call(wrapper.vm, "http://endhealth.info/im#DiscoveryOntology");
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.getDataModelProps).toHaveBeenCalledTimes(1);
  });

  it("can resize", () => {
    wrapper.vm.setScrollHeight = jest.fn();
    wrapper.vm.onResize();
    expect(wrapper.vm.setScrollHeight).toHaveBeenCalledTimes(1);
  });

  it("can getDataModelProps", async () => {
    wrapper.vm.getDataModelProps();
    expect(wrapper.vm.loading).toBe(true);
    await flushPromises();
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.dataModelPropsData).toStrictEqual([
      {
        propertyId: "http://endhealth.info/im#manufacturer",
        propertyName: "manufacturer",
        propertyDisplay: "manufacturer",
        typeId: "http://endhealth.info/im#Concept",
        typeName: "Concept",
        typeDisplay: "Concept",
        inheritedId: undefined,
        inheritedName: undefined,
        inheritedDisplay: "-",
        cardinality: "0 : *"
      },
      {
        propertyId: "http://endhealth.info/im#reaction",
        propertyName: "reaction",
        propertyDisplay: "reaction",
        typeId: "http://endhealth.info/im#Concept",
        typeName: "Concept",
        typeDisplay: "Concept",
        inheritedId: undefined,
        inheritedName: "InheritedParent",
        inheritedDisplay: "InheritedParent",
        cardinality: "1 : *"
      },
      {
        propertyId: "http://endhealth.info/im#vaccinationProcedure",
        propertyName: "vaccination procedure",
        propertyDisplay: "vaccination procedure",
        typeId: "http://endhealth.info/im#VSET_Immunisations_CareConnect",
        typeName: "Value set Immunisations - Care connect",
        typeDisplay: "Value set Immunisations - Care connect",
        inheritedId: undefined,
        inheritedName: undefined,
        inheritedDisplay: "-",
        cardinality: "2 : *"
      },
      {
        propertyId: "http://endhealth.info/im#vaccineProduct",
        propertyName: "vaccine product",
        propertyDisplay: "vaccine product",
        typeId: "http://endhealth.info/im#Concept",
        typeName: "Concept",
        typeDisplay: "Concept",
        inheritedId: undefined,
        inheritedName: undefined,
        inheritedDisplay: "-",
        cardinality: "0 : 3"
      },
      {
        propertyId: "http://endhealth.info/im#batchNumber",
        propertyName: "batch number",
        propertyDisplay: "batch number",
        typeId: "http://www.w3.org/2001/XMLSchema#string",
        typeName: undefined,
        typeDisplay: "http://www.w3.org/2001/XMLSchema#string",
        inheritedId: undefined,
        inheritedName: undefined,
        inheritedDisplay: "-",
        cardinality: "0 : 4"
      },
      {
        propertyId: "http://endhealth.info/im#doseSequence",
        propertyName: "dose sequence",
        propertyDisplay: "dose sequence",
        typeId: "http://www.w3.org/2001/XMLSchema#string",
        typeName: undefined,
        typeDisplay: "http://www.w3.org/2001/XMLSchema#string",
        inheritedId: undefined,
        inheritedName: undefined,
        inheritedDisplay: "-",
        cardinality: "0 : *"
      },
      {
        propertyId: "http://endhealth.info/im#dosesRequired",
        propertyName: "doses required",
        propertyDisplay: "doses required",
        typeId: "http://www.w3.org/2001/XMLSchema#string",
        typeName: undefined,
        typeDisplay: "http://www.w3.org/2001/XMLSchema#string",
        inheritedId: undefined,
        inheritedName: undefined,
        inheritedDisplay: "-",
        cardinality: "0 : *"
      },
      {
        propertyId: "http://endhealth.info/im#expiryDate",
        propertyName: "expiry date",
        propertyDisplay: "expiry date",
        typeId: "http://www.w3.org/2001/XMLSchema#string",
        typeName: undefined,
        typeDisplay: "http://www.w3.org/2001/XMLSchema#string",
        inheritedId: undefined,
        inheritedName: undefined,
        inheritedDisplay: "-",
        cardinality: "0 : *"
      }
    ]);
  });

  it("can navigate ___ iri", () => {
    wrapper.vm.navigate("testIri");
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "Concept", params: { selectedIri: "testIri" } });
  });

  it("can navigate ___ no iri", () => {
    wrapper.vm.navigate();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("can exportCSV", () => {
    wrapper.vm.exportCSV();
    expect(mockRef.methods.exportCSV).toBeCalledTimes(1);
  });
});
