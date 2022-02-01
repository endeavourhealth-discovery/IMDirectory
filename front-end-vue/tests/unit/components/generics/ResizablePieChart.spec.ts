import { shallowMount } from "@vue/test-utils";
import ResizeablePieChart from "@/components/generics/ResizeablePieChart.vue";
import Card from "primevue/card";
import Chart from "primevue/chart";
import ProgressSpinner from "primevue/progressspinner";

import { PieChartData } from "@/models/charts/PieChartData";

describe("ResizablePieChart.vue", () => {
  let wrapper: any;
  let docSpyId: any;
  let docSpyClass: any;
  let windowSpy: any;
  let mockEvent: any;

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
    jest.clearAllMocks();

    docSpyId = jest.spyOn(document, "getElementById");
    docSpyId.mockReturnValue(undefined);

    docSpyClass = jest.spyOn(document, "getElementsByClassName");
    docSpyClass.mockReturnValue([undefined]);

    windowSpy = jest.spyOn(window, "getComputedStyle");
    windowSpy.mockReturnValue({ getPropertyValue: jest.fn().mockReturnValue("16px") });

    wrapper = shallowMount(ResizeablePieChart, {
      props: {
        inputData: inputData,
        labelKey: "http://www.w3.org/2000/01/rdf-schema#label",
        dataKey: "http://www.w3.org/2002/07/owl#hasValue"
      },
      global: {
        components: { Card, Chart, ProgressSpinner }
      }
    });

    await wrapper.vm.$nextTick();
  });

  it("can remove eventListener", () => {
    console.error = jest.fn();
    const spy = jest.spyOn(global, "removeEventListener");
    wrapper.unmount();
    expect(spy).toHaveBeenCalled();
    spy.mockReset();
  });

  it("can watch inputData", () => {
    wrapper.vm.setChartData = jest.fn();
    wrapper.vm.$options.watch.inputData.handler.call(wrapper.vm, []);
    expect(wrapper.vm.setChartData).toHaveBeenCalledTimes(1);
  });

  it("can setChartData", async () => {
    const testChartConceptType = {
      datasets: [
        {
          backgroundColor: [
            "#781c81BB",
            "#4d1f82BB",
            "#403e95BB",
            "#4063b0BB",
            "#4684c2BB",
            "#519cb8BB",
            "#62ac9aBB",
            "#77b77bBB",
            "#90bc62BB",
            "#abbe51BB",
            "#c3ba45BB",
            "#d7af3dBB",
            "#e39a36BB",
            "#e77830BB",
            "#e34d28BB",
            "#d92120BB"
          ],
          borderRadius: 1,
          data: [
            680405.1187499999,
            67617.9,
            6339.178124999999,
            6339.178124999999,
            6339.178124999999,
            6339.178124999999,
            6339.178124999999,
            6339.178124999999,
            6339.178124999999,
            6339.178124999999,
            6339.178124999999,
            6339.178124999999,
            6339.178124999999,
            6339.178124999999,
            6339.178124999999,
            6339.178124999999
          ],
          hoverBackgroundColor: [
            "#781c81",
            "#4d1f82",
            "#403e95",
            "#4063b0",
            "#4684c2",
            "#519cb8",
            "#62ac9a",
            "#77b77b",
            "#90bc62",
            "#abbe51",
            "#c3ba45",
            "#d7af3d",
            "#e39a36",
            "#e77830",
            "#e34d28",
            "#d92120"
          ]
        }
      ],
      labels: [
        "Class",
        "Legacy concept",
        "Object property",
        "Set",
        "Node shape",
        "Record type",
        "Data property",
        "Query set",
        "Functional property",
        "Annotation property",
        "Symmetric property",
        "Transitive property",
        "Folder",
        "Value set",
        "Reflexive property",
        "Query template"
      ]
    };
    wrapper.vm.realData = [] as number[];
    wrapper.vm.chartConceptTypes = new PieChartData(
      [
        {
          data: [],
          backgroundColor: [],
          hoverBackgroundColor: [],
          borderRadius: 1
        }
      ],
      []
    ) as PieChartData;
    await wrapper.vm.$nextTick();
    wrapper.vm.setChartData();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.chartConceptTypes).toEqual(testChartConceptType);
    expect(wrapper.vm.realData).toStrictEqual({
      "0": 1030354,
      "1": 93282,
      "2": 1811,
      "3": 1122,
      "4": 99,
      "5": 94,
      "6": 68,
      "7": 45,
      "8": 26,
      "9": 23,
      "10": 11,
      "11": 11,
      "12": 8,
      "13": 8,
      "14": 2,
      "15": 1
    });
  });

  it("can setChartColours", async () => {
    wrapper.vm.chartConceptTypes = new PieChartData(
      [
        {
          data: [],
          backgroundColor: [],
          hoverBackgroundColor: [],
          borderRadius: 1
        }
      ],
      []
    ) as PieChartData;
    const mockRes = [
      {
        iri: "http://www.w3.org/2002/07/owl#Class",
        label: "Class",
        count: 1030270
      },
      {
        iri: "http://endhealth.info/im#LegacyConcept",
        label: "Legacy Concept",
        count: 93282
      },
      {
        iri: "http://www.w3.org/2002/07/owl#ObjectProperty",
        label: "Object Property",
        count: 1813
      },
      {
        iri: "http://endhealth.info/im#Set",
        label: "Set",
        count: 1122
      },
      {
        iri: "http://endhealth.info/im#RecordType",
        label: "Record Type",
        count: 94
      },
      {
        iri: "http://www.w3.org/2002/07/owl#DataProperty",
        label: "Data Property",
        count: 68
      },
      {
        iri: "http://endhealth.info/im#QuerySet",
        label: "Query set",
        count: 45
      },
      {
        iri: "http://www.w3.org/2002/07/owl#FunctionalProperty",
        label: "Functional Property",
        count: 26
      },
      {
        iri: "http://www.w3.org/2002/07/owl#AnnotationProperty",
        label: "Annotation Property",
        count: 23
      },
      {
        iri: "http://www.w3.org/2002/07/owl#TransitiveProperty",
        label: "Transitive Property",
        count: 11
      },
      {
        iri: "http://www.w3.org/2002/07/owl#SymmetricProperty",
        label: "Symmetric Property",
        count: 11
      },
      {
        iri: "http://endhealth.info/im#ValueSet",
        label: "Value Set",
        count: 8
      },
      {
        iri: "http://endhealth.info/im#Folder",
        label: "Folder",
        count: 8
      },
      {
        iri: "http://www.w3.org/2002/07/owl#ReflexiveProperty",
        label: "Reflexive Property",
        count: 2
      },
      {
        iri: "http://endhealth.info/im#QueryTemplate",
        label: "Query Template",
        count: 1
      },
      {
        iri: "http://www.w3.org/ns/shacl#NodeShape",
        label: "Node Shape",
        count: 1
      }
    ];
    wrapper.vm.setChartColours(mockRes);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.chartConceptTypes).toEqual({
      datasets: [
        {
          backgroundColor: [],
          borderRadius: 1,
          data: [],
          hoverBackgroundColor: []
        }
      ],
      labels: []
    });
  });

  it("can handle legend cursors ___ onHover", () => {
    mockEvent = { native: { target: { style: { cursor: "default" } } } };
    wrapper.vm.chartOptions.plugins.legend.onHover(mockEvent);
    expect(mockEvent.native.target.style.cursor).toBe("pointer");
  });

  it("can handle legend cursors ___ onLeave", () => {
    mockEvent = { native: { target: { style: { cursor: "pointer" } } } };
    wrapper.vm.chartOptions.plugins.legend.onLeave(mockEvent);
    expect(mockEvent.native.target.style.cursor).toBe("default");
  });

  it("setsLegendOptions ___ width > 1750", async () => {
    global.innerWidth = 1760;
    const testOptions = {
      legend: {
        position: "right",
        labels: {
          boxWidth: 40,
          fontSize: 12
        },
        onHover: function(e: any) {
          e.target.style.cursor = "pointer";
        }
      },
      hover: {
        onHover: function(e: any) {
          e.target.style.cursor = "default";
        }
      }
    };
    wrapper.vm.setLegendOptions();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.chartOptions.toString()).toEqual(testOptions.toString());
  });

  it("setsLegendOptions ___ width > 1300", async () => {
    global.innerWidth = 1310;
    const testOptions = {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 20,
          fontSize: 10
        },
        onHover: function(e: any) {
          e.target.style.cursor = "pointer";
        }
      },
      hover: {
        onHover: function(e: any) {
          e.target.style.cursor = "default";
        }
      }
    };
    wrapper.vm.setLegendOptions();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.chartOptions.toString()).toEqual(testOptions.toString());
  });

  it("setsLegendOptions ___ width >= 1024", async () => {
    global.innerWidth = 1024;
    const testOptions = {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 10,
          fontSize: 8
        },
        onHover: function(e: any) {
          e.target.style.cursor = "pointer";
        }
      },
      hover: {
        onHover: function(e: any) {
          e.target.style.cursor = "default";
        }
      }
    };
    wrapper.vm.setLegendOptions();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.chartOptions.toString()).toEqual(testOptions.toString());
  });

  it("setsLegendOptions ___ width >= 892", async () => {
    global.innerWidth = 892;
    const testOptions = {
      legend: {
        position: "right",
        labels: {
          boxWidth: 40,
          fontSize: 8
        },
        onHover: function(e: any) {
          e.target.style.cursor = "pointer";
        }
      },
      hover: {
        onHover: function(e: any) {
          e.target.style.cursor = "default";
        }
      }
    };
    wrapper.vm.setLegendOptions(892);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.chartOptions.toString()).toEqual(testOptions.toString());
  });

  it("setsLegendOptions ___ width >= 557", async () => {
    global.innerWidth = 557;
    const testOptions = {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 20,
          fontSize: 6
        },
        onHover: function(e: any) {
          e.target.style.cursor = "pointer";
        }
      },
      hover: {
        onHover: function(e: any) {
          e.target.style.cursor = "default";
        }
      }
    };
    wrapper.vm.setLegendOptions();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.chartOptions.toString()).toEqual(testOptions.toString());
  });

  it("setsLegendOptions ___ width >= 0", async () => {
    global.innerWidth = 0;
    const testOptions = {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 10,
          fontSize: 4
        },
        onHover: function(e: any) {
          e.target.style.cursor = "pointer";
        }
      },
      hover: {
        onHover: function(e: any) {
          e.target.style.cursor = "default";
        }
      }
    };
    wrapper.vm.setLegendOptions();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.chartOptions.toString()).toEqual(testOptions.toString());
  });

  it("setsLegendOptions ___ width other", async () => {
    global.innerWidth = -1;
    const testOptions = {
      legend: {
        display: false
      }
    };
    wrapper.vm.setLegendOptions(-1);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.chartOptions.toString()).toEqual(testOptions.toString());
  });
});
