import { shallowMount } from "@vue/test-utils";
import ReportTable from "@/components/landingPage/ReportTable.vue";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ProgressSpinner from "primevue/progressspinner";

describe("ReportTable.vue ___ label + hasValue input", () => {
  let wrapper;
  let reportData = [
    { "http://endhealth.info/im#hasValue": 2823174, "http://www.w3.org/2000/01/rdf-schema#label": "Ontologies" },
    { "http://endhealth.info/im#hasValue": 2227, "http://www.w3.org/2000/01/rdf-schema#label": "Discovery data model" },
    { "http://endhealth.info/im#hasValue": 1323, "http://www.w3.org/2000/01/rdf-schema#label": "Concept sets and value sets" },
    { "http://endhealth.info/im#hasValue": 159, "http://www.w3.org/2000/01/rdf-schema#label": "Query library" }
  ];

  beforeEach(async () => {
    vi.clearAllMocks();
    wrapper = shallowMount(ReportTable, {
      props: { inputData: reportData, description: "A brief overview of the concepts stored in the Ontology", name: "Ontology overview", id: "reportTable1" },
      global: {
        components: { Card, DataTable, Column, ProgressSpinner }
      }
    });

    await wrapper.vm.$nextTick();
    vi.clearAllMocks();
  });

  it("mounts", () => {
    expect(wrapper.vm.tableData).toStrictEqual([
      { count:  2823174, label: "Ontologies" },
      { count: 2227, label: "Discovery data model" },
      { count: 1323, label: "Concept sets and value sets" },
      { count: 159, label: "Query library" }
    ]);
    expect(wrapper.vm.loading).toBe(false);
  });

  it("can check isCorrectInputData ___ label + hasValue", () => {
    expect(ReportTable.computed.isCorrectInputData.call({ inputData: reportData })).toBe(true);
  });

  it("can check isCorrectInputData ___ count + label", () => {
    const testData = [{ count: 1000, label: "testName" }];
    expect(ReportTable.computed.isCorrectInputData.call({ inputData: testData })).toBe(true);
  });

  it("can check isCorrectInputData ___ false", () => {
    const testData = [{ total: 1000, label: "testName" }];
    expect(ReportTable.computed.isCorrectInputData.call({ inputData: testData })).toBe(false);
  });

  it("can getReportTableData ___ correct object", () => {
    wrapper.vm.tableData = [];
    wrapper.vm.getReportTableData();
    expect(wrapper.vm.tableData).toStrictEqual([
      { count:  2823174, label: "Ontologies" },
      { count: 2227, label: "Discovery data model" },
      { count: 1323, label: "Concept sets and value sets" },
      { count: 159, label: "Query library" }
    ]);
  });
});

describe("ReportTable.vue ___ label + count input", () => {
  let wrapper;
  let reportData = [
    { count:  2823174, label: "Ontologies" },
    { count: 2227, label: "Discovery data model" },
    { count: 1323, label: "Concept sets and value sets" },
    { count: 159, label: "Query library" }
  ];

  beforeEach(async () => {
    vi.clearAllMocks();
    wrapper = shallowMount(ReportTable, {
      props: { inputData: reportData, description: "A brief overview of the concepts stored in the Ontology", name: "Ontology overview", id: "reportTable1" },
      global: {
        components: { Card, DataTable, Column, ProgressSpinner }
      }
    });

    await wrapper.vm.$nextTick();
    vi.clearAllMocks();
  });

  it("can getReportTableData ___ label + count", () => {
    wrapper.vm.tableData = [];
    wrapper.vm.getReportTableData();
    expect(wrapper.vm.tableData).toStrictEqual([
      { count:  2823174, label: "Ontologies" },
      { count: 2227, label: "Discovery data model" },
      { count: 1323, label: "Concept sets and value sets" },
      { count: 159, label: "Query library" }
    ]);
  });
});

describe("ReportTable.vue ___ bad input", () => {
  let wrapper;
  let reportData = [
    { total:  2823174, label: "Ontologies" },
    { total: 2227, label: "Discovery data model" },
    { total: 1323, label: "Concept sets and value sets" },
    { total: 159, label: "Query library" }
  ];

  beforeEach(async () => {
    vi.clearAllMocks();
    wrapper = shallowMount(ReportTable, {
      props: { inputData: reportData, description: "A brief overview of the concepts stored in the Ontology", name: "Ontology overview", id: "reportTable1" },
      global: {
        components: { Card, DataTable, Column, ProgressSpinner }
      }
    });

    await wrapper.vm.$nextTick();
    vi.clearAllMocks();
  });

  it("can getReportTableData ___ label + count", () => {
    wrapper.vm.tableData = [];
    wrapper.vm.getReportTableData();
    expect(wrapper.vm.tableData).toStrictEqual([]);
  });
});
