import { mount } from "@vue/test-utils";
import TermsTable from "@/components/home/infoSideBar/TermsTable.vue";
import Button from "primevue/button";
import StyleClass from "primevue/styleclass";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { setupServer } from "msw/node";
import { render } from "@testing-library/vue";
import PrimeVue from "primevue/config";

describe("TermsTable.vue", () => {
  let component;

  beforeEach(() => {
    component = render(TermsTable, {
      global: {
        components: { Button, StyleClass, DataTable, Column },
        directives: { styleclass: StyleClass },
        plugins: [PrimeVue]
      },
      props: {
        label: "Terms",
        size: "100%",
        id: "TermsTable17",
        data: [
          { name: "Scoliosis deformity of spine", code: "439061010", scheme: "Snomed-CT namespace" },
          { name: "Scoliosis", code: "439062015", scheme: "Snomed-CT namespace" },
          { name: "Scoliosis deformity of spine (disorder)", code: "2153143014", scheme: "Snomed-CT namespace" }
        ]
      }
    });
  });

  it("can mount", () => {
    component.getByText("(3)");
    component.getByText("Scoliosis deformity of spine");
  });

  // it("can setButtonExpanded ___ false", () => {
  //   expect(wrapper.vm.buttonExpanded).toBe(false);
  //   wrapper.vm.setButtonExpanded();
  //   expect(wrapper.vm.buttonExpanded).toBe(true);
  // });

  // it("can setButtonExpanded ___ true", () => {
  //   wrapper.vm.buttonExpanded = true;
  //   expect(wrapper.vm.buttonExpanded).toBe(true);
  //   wrapper.vm.setButtonExpanded();
  //   expect(wrapper.vm.buttonExpanded).toBe(false);
  // });
});
