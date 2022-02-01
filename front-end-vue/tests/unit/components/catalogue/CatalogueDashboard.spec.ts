import { shallowMount } from "@vue/test-utils";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Chart from "primevue/chart";
import ProgressSpinner from "primevue/progressspinner";
import CatalogueDashboard from "@/components/catalogue/CatalogueDashboard.vue";
import Column from "primevue/column";
import PieChartDashCard from "@/components/dashboard/PieChartDashCard.vue";

describe("CatalogueDashboard.vue", () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = shallowMount(CatalogueDashboard, {
      global: {
        components: { Card, DataTable, Chart, Column, PieChartDashCard, ProgressSpinner }
      },
      props: {
        types: [
          {
            count: 267904,
            iri: "http://endhealth.info/im#Organisation",
            label: "Organisation  (record type)"
          },
          {
            count: 267904,
            iri: "http://endhealth.info/im#Address",
            label: "Address (record type)"
          }
        ],
        loading: false
      }
    });
  });

  it("mounts", () => {
    expect(wrapper.vm.types).toStrictEqual([
      {
        count: 267904,
        iri: "http://endhealth.info/im#Organisation",
        label: "Organisation  (record type)"
      },
      {
        count: 267904,
        iri: "http://endhealth.info/im#Address",
        label: "Address (record type)"
      }
    ]);
    expect(wrapper.vm.loading).toBe(false);
  });
});
