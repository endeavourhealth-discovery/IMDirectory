import { shallowMount } from "@vue/test-utils";
import PieChartDashCard from "@/components/directory/landingPage/PieChartDashCard.vue";
import Card from "primevue/card";
import { setupServer } from "msw/node";
import { render } from "@testing-library/vue";
import PrimeVue from "primevue/config";

describe("PieChartDashCard.vue", () => {
  let component;
  let docSpyId;
  let docSpyClass;
  let windowSpy;
  let inputData = [
    { "http://www.w3.org/2002/07/owl#hasValue": 1030354, "http://www.w3.org/2000/01/rdf-schema#label": "Class" },
    { "http://www.w3.org/2002/07/owl#hasValue": 93282, "http://www.w3.org/2000/01/rdf-schema#label": "Legacy concept" },
    { "http://www.w3.org/2002/07/owl#hasValue": 1811, "http://www.w3.org/2000/01/rdf-schema#label": "Object property" },
    { "http://www.w3.org/2002/07/owl#hasValue": 1122, "http://www.w3.org/2000/01/rdf-schema#label": "Set" },
    { "http://www.w3.org/2002/07/owl#hasValue": 99, "http://www.w3.org/2000/01/rdf-schema#label": "Node shape" },
    { "http://www.w3.org/2002/07/owl#hasValue": 94, "http://www.w3.org/2000/01/rdf-schema#label": "Record type" },
    { "http://www.w3.org/2002/07/owl#hasValue": 68, "http://www.w3.org/2000/01/rdf-schema#label": "Data property" },
    { "http://www.w3.org/2002/07/owl#hasValue": 45, "http://www.w3.org/2000/01/rdf-schema#label": "Query set" },
    { "http://www.w3.org/2002/07/owl#hasValue": 26, "http://www.w3.org/2000/01/rdf-schema#label": "Functional property" },
    { "http://www.w3.org/2002/07/owl#hasValue": 23, "http://www.w3.org/2000/01/rdf-schema#label": "Annotation property" },
    { "http://www.w3.org/2002/07/owl#hasValue": 11, "http://www.w3.org/2000/01/rdf-schema#label": "Symmetric property" },
    { "http://www.w3.org/2002/07/owl#hasValue": 11, "http://www.w3.org/2000/01/rdf-schema#label": "Transitive property" },
    { "http://www.w3.org/2002/07/owl#hasValue": 8, "http://www.w3.org/2000/01/rdf-schema#label": "Folder" },
    { "http://www.w3.org/2002/07/owl#hasValue": 8, "http://www.w3.org/2000/01/rdf-schema#label": "Value set" },
    { "http://www.w3.org/2002/07/owl#hasValue": 2, "http://www.w3.org/2000/01/rdf-schema#label": "Reflexive property" },
    { "http://www.w3.org/2002/07/owl#hasValue": 1, "http://www.w3.org/2000/01/rdf-schema#label": "Query template" }
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    docSpyId = vi.spyOn(document, "getElementById");
    docSpyId.mockReturnValue(undefined);

    docSpyClass = vi.spyOn(document, "getElementsByClassName");
    docSpyClass.mockReturnValue([undefined]);

    windowSpy = vi.spyOn(window, "getComputedStyle");
    windowSpy.mockReturnValue({ getPropertyValue: vi.fn().mockReturnValue("16px") });

    component = render(PieChartDashCard, {
      props: {
        name: "Ontology concept types",
        inputData: inputData,
        description: "A brief overview of the types of data stored in the Ontology",
        id: "Chart1",
        labelKey: "http://www.w3.org/2000/01/rdf-schema#label",
        dataKey: "http://www.w3.org/2002/07/owl#hasValue"
      },
      global: {
        components: { Card },
        plugins: [PrimeVue],
        stubs: { ResizablePieChart: true }
      }
    });
  });

  it("can mount", () => {
    component.getByText("Ontology concept types");
    component.getByText("A brief overview of the types of data stored in the Ontology");
  });

  // it("calls setChartSize onResize", () => {
  //   wrapper.vm.setChartSize = vi.fn();
  //   wrapper.vm.onResize();
  //   expect(wrapper.vm.setChartSize).toHaveBeenCalled();
  // });

  // it("can setChartSize ___ no container", () => {
  //   mockLoggerService.error = vi.fn();
  //   wrapper.vm.setChartSize();
  //   expect(mockLoggerService.error).toHaveBeenCalledTimes(1);
  //   expect(mockLoggerService.error).toHaveBeenCalledWith(undefined, "Failed to set chart size for element id: Chart1");
  // });

  // it("can setChartSize ___ resize elements", async () => {
  //   const mockElement = document.createElement("div");
  //   mockElement.getBoundingClientRect = vi.fn().mockReturnValue({ height: 100 });
  //   mockElement.getElementsByClassName = vi.fn().mockReturnValue([mockElement]);
  //   docSpyId.mockReturnValue(mockElement);
  //   docSpyClass.mockReturnValue([mockElement]);
  //   wrapper.vm.setChartSize();
  //   await wrapper.vm.$nextTick();
  //   expect(mockElement.style.height).not.toBe("");
  // });

  // it("can setChartSize ___ no class elements", async () => {
  //   const mockElement = document.createElement("div");
  //   mockElement.getBoundingClientRect = vi.fn().mockReturnValue({ height: 100 });
  //   mockElement.getElementsByClassName = vi.fn().mockReturnValue([null]);
  //   docSpyId.mockReturnValue(mockElement);
  //   docSpyClass.mockReturnValueOnce([mockElement]).mockReturnValue(undefined);
  //   windowSpy.mockReturnValue({ getPropertyValue: vi.fn().mockReturnValue(undefined) });
  //   wrapper.vm.setChartSize();
  //   await wrapper.vm.$nextTick();
  //   expect(mockElement.style.height).toBe("");
  // });
});
