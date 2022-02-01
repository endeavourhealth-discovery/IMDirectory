import { shallowMount } from "@vue/test-utils";
import ReportTable from "@/components/dashboard/ReportTable.vue";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ProgressSpinner from "primevue/progressspinner";

describe("ReportTable.vue ___ label + hasValue input", () => {
  let wrapper;
  let reportData = [
    { "http://www.w3.org/2002/07/owl#hasValue": 8, "http://www.w3.org/2000/01/rdf-schema#label": "Value sets" },
    { "http://www.w3.org/2002/07/owl#hasValue": 1973, "http://www.w3.org/2000/01/rdf-schema#label": "Data models" },
    { "http://www.w3.org/2002/07/owl#hasValue": 1124984, "http://www.w3.org/2000/01/rdf-schema#label": "Ontology" }
  ];

  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(ReportTable, {
      props: { inputData: reportData, description: "A brief overview of the concepts stored in the Ontology", name: "Ontology overview", id: "reportTable1" },
      global: {
        components: { Card, DataTable, Column, ProgressSpinner }
      }
    });

    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  it("mounts", () => {
    expect(wrapper.vm.tableData).toStrictEqual([
      { count: 8, label: "Value sets" },
      { count: 1973, label: "Data models" },
      { count: 1124984, label: "Ontology" }
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
      { count: 8, label: "Value sets" },
      { count: 1973, label: "Data models" },
      { count: 1124984, label: "Ontology" }
    ]);
  });
});

describe("ReportTable.vue ___ label + count input", () => {
  let wrapper;
  let reportData = [
    { count: 8, label: "Value sets" },
    { count: 1973, label: "Data models" },
    { count: 1124984, label: "Ontology" }
  ];

  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(ReportTable, {
      props: { inputData: reportData, description: "A brief overview of the concepts stored in the Ontology", name: "Ontology overview", id: "reportTable1" },
      global: {
        components: { Card, DataTable, Column, ProgressSpinner }
      }
    });

    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  it("can getReportTableData ___ label + count", () => {
    wrapper.vm.tableData = [];
    wrapper.vm.getReportTableData();
    expect(wrapper.vm.tableData).toStrictEqual([
      { count: 8, label: "Value sets" },
      { count: 1973, label: "Data models" },
      { count: 1124984, label: "Ontology" }
    ]);
  });
});

describe("ReportTable.vue ___ bad input", () => {
  let wrapper;
  let reportData = [
    { total: 8, label: "Value sets" },
    { total: 1973, label: "Data models" },
    { total: 1124984, label: "Ontology" }
  ];

  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(ReportTable, {
      props: { inputData: reportData, description: "A brief overview of the concepts stored in the Ontology", name: "Ontology overview", id: "reportTable1" },
      global: {
        components: { Card, DataTable, Column, ProgressSpinner }
      }
    });

    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  it("can getReportTableData ___ label + count", () => {
    wrapper.vm.tableData = [];
    wrapper.vm.getReportTableData();
    expect(wrapper.vm.tableData).toStrictEqual([]);
  });
});
