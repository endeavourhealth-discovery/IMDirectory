import ReportTable from "@/components/directory/landingPage/ReportTable.vue";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ProgressSpinner from "primevue/progressspinner";
import { describe } from "vitest";
import { render } from "@testing-library/vue";
import PrimeVue from "primevue/config";

describe("ReportTable.vue", () => {
  describe("label + hasValue input", () => {
    let component;
    let reportData = [
      { "http://endhealth.info/im#hasValue": 2823174, "http://www.w3.org/2000/01/rdf-schema#label": "Ontologies" },
      { "http://endhealth.info/im#hasValue": 2227, "http://www.w3.org/2000/01/rdf-schema#label": "Discovery data model" },
      { "http://endhealth.info/im#hasValue": 1323, "http://www.w3.org/2000/01/rdf-schema#label": "Concept sets and value sets" },
      { "http://endhealth.info/im#hasValue": 159, "http://www.w3.org/2000/01/rdf-schema#label": "Query library" }
    ];

    beforeEach(async () => {
      vi.clearAllMocks();
      component = render(ReportTable, {
        props: { inputData: reportData, description: "A brief overview of the concepts stored in the Ontology", name: "Ontology overview", id: "reportTable1" },
        global: {
          components: { Card, DataTable, Column, ProgressSpinner },
          plugins: [PrimeVue]
        }
      });

      vi.clearAllMocks();
    });

    it("mounts", () => {
      component.getByText("Ontologies");
      component.getByText("Discovery data model");
      component.getByText("Concept sets and value sets");
      component.getByText("Query library");
    });

    // it("can check isCorrectInputData ___ label + hasValue", () => {
    //   expect(ReportTable.computed.isCorrectInputData.call({ inputData: reportData })).toBe(true);
    // });

    // it("can check isCorrectInputData ___ count + label", () => {
    //   const testData = [{ count: 1000, label: "testName" }];
    //   expect(ReportTable.computed.isCorrectInputData.call({ inputData: testData })).toBe(true);
    // });

    // it("can check isCorrectInputData ___ false", () => {
    //   const testData = [{ total: 1000, label: "testName" }];
    //   expect(ReportTable.computed.isCorrectInputData.call({ inputData: testData })).toBe(false);
    // });

    // it("can getReportTableData ___ correct object", () => {
    //   wrapper.vm.tableData = [];
    //   wrapper.vm.getReportTableData();
    //   expect(wrapper.vm.tableData).toStrictEqual([
    //     { count: 2823174, label: "Ontologies" },
    //     { count: 2227, label: "Discovery data model" },
    //     { count: 1323, label: "Concept sets and value sets" },
    //     { count: 159, label: "Query library" }
    //   ]);
    // });
  });

  // describe("label + count input", () => {
  //   let component;
  //   let reportData = [
  //     { count: 2823174, label: "Ontologies" },
  //     { count: 2227, label: "Discovery data model" },
  //     { count: 1323, label: "Concept sets and value sets" },
  //     { count: 159, label: "Query library" }
  //   ];

  //   beforeEach(async () => {
  //     vi.clearAllMocks();
  //     component = render(ReportTable, {
  //       props: { inputData: reportData, description: "A brief overview of the concepts stored in the Ontology", name: "Ontology overview", id: "reportTable1" },
  //       global: {
  //         components: { Card, DataTable, Column, ProgressSpinner },
  //         plugins: [PrimeVue]
  //       }
  //     });

  //     vi.clearAllMocks();
  //   });

  //   it("can getReportTableData ___ label + count", () => {
  //     component.getReportTableData();
  //     expect(component.tableData).toStrictEqual([
  //       { count: 2823174, label: "Ontologies" },
  //       { count: 2227, label: "Discovery data model" },
  //       { count: 1323, label: "Concept sets and value sets" },
  //       { count: 159, label: "Query library" }
  //     ]);
  //   });
  // });

  // describe("bad input", () => {
  //   let wrapper;
  //   let reportData = [
  //     { total: 2823174, label: "Ontologies" },
  //     { total: 2227, label: "Discovery data model" },
  //     { total: 1323, label: "Concept sets and value sets" },
  //     { total: 159, label: "Query library" }
  //   ];

  //   beforeEach(async () => {
  //     vi.clearAllMocks();
  //     wrapper = shallowMount(ReportTable, {
  //       props: { inputData: reportData, description: "A brief overview of the concepts stored in the Ontology", name: "Ontology overview", id: "reportTable1" },
  //       global: {
  //         components: { Card, DataTable, Column, ProgressSpinner }
  //       }
  //     });

  //     await wrapper.vm.$nextTick();
  //     vi.clearAllMocks();
  //   });

  //   it("can getReportTableData ___ label + count", () => {
  //     wrapper.vm.tableData = [];
  //     wrapper.vm.getReportTableData();
  //     expect(wrapper.vm.tableData).toStrictEqual([]);
  //   });
  // });
});
