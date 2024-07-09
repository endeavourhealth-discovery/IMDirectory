import { render, fireEvent, within } from "@testing-library/vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SecondaryTree from "@/components/shared/SecondaryTree.vue";
import axios from "axios";
import Button from "primevue/button";
import Tree from "primevue/tree";
import ProgressSpinner from "primevue/progressspinner";
import Popover from "primevue/popover";
import Tooltip from "primevue/tooltip";
import { flushPromises } from "@vue/test-utils";
import { EntityService } from "@/services";
import PrimeVue from "primevue/config";
import testData from "./SecondaryTree.testData";
import { createTestingPinia } from "@pinia/testing";

const mockPush = vi.fn();
const mockGo = vi.fn();
const mockRoute = { name: "Concept" };

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: mockPush,
    go: mockGo
  }),
  useRoute: () => mockRoute
}));

createTestingPinia();

vi.mock("primevue/usetoast", () => ({
  useToast: () => ({
    add: mockAdd
  })
}));

const mockAdd = vi.fn();

describe("SecondaryTree.vue", () => {
  let getPartialEntitySpy = vi.spyOn(EntityService, "getPartialEntity").mockResolvedValue(testData.ENTITY);
  let getEntityParentsSpy = vi.spyOn(EntityService, "getEntityParents").mockResolvedValue(testData.PARENTS);
  let getPagedChildrenSpy = vi.spyOn(EntityService, "getPagedChildren").mockResolvedValue(testData.CHILDREN);
  let getEntitySummarySpy = vi.spyOn(EntityService, "getEntitySummary").mockResolvedValue(testData.SUMMARY);
  let component;

  beforeEach(() => {
    component = render(SecondaryTree, {
      global: {
        components: { Button, Tree, ProgressSpinner, Popover },
        stubs: { FontAwesomeIcon: true },
        directives: { Tooltip: Tooltip },
        provide: { axios: axios },
        plugins: [PrimeVue]
      },
      props: { entityIri: "http://snomed.info/sct#298382003" }
    });
  });

  it("has the selected item in the tree", async () => {
    await flushPromises();
    const entity = component.getByText("Acquired scoliosis (disorder)");
    expect(entity).toBeTruthy();
  });

  it("sets the first parent as a parent button", async () => {
    await flushPromises();
    const button = component.getByTestId("parent");
    within(button).getByText("Acquired curvature of spine (disorder)");
  });

  it("sets the other parents as alternateParents buttons", async () => {
    await flushPromises();
    const button = component.getByTestId("alt-parent");
    within(button).getByText("Scoliosis deformity of spine (disorder)");
  });

  it("has children", async () => {
    await flushPromises();
    const child = component.getByText("Acquired kyphoscoliosis (disorder)");
    const rows = component.getAllByTestId("row");
    expect(rows.length).toBe(8);
  });

  it("can expand a row item", async () => {
    await flushPromises();
    getPagedChildrenSpy.mockResolvedValue({
      result: [
        {
          name: "Thoracogenic kyphoscoliosis (disorder)",
          parents: [],
          hasChildren: false,
          hasGrandChildren: false,
          type: [
            {
              name: "Terminology Concept",
              "@id": "http://endhealth.info/im#Concept"
            }
          ],
          orderNumber: 0,
          "@id": "http://snomed.info/sct#281376007"
        }
      ],
      totalCount: 1
    });
    const expanders = component.getAllByRole("button");
    // await fireEvent.click(expanders[3]);
    await flushPromises();
    // component.getByText("Thoracogenic kyphoscoliosis (disorder)");
  });

  it("can select a parent", async () => {
    await flushPromises();
    getEntityParentsSpy.mockResolvedValueOnce(testData.PARENTS).mockResolvedValue([
      {
        name: "Acquired deformity of spine (disorder)",
        parents: [],
        hasChildren: false,
        hasGrandChildren: false,
        type: [
          {
            name: "Terminology Concept",
            "@id": "http://endhealth.info/im#Concept"
          }
        ],
        orderNumber: 0,
        "@id": "http://snomed.info/sct#77567004"
      },
      {
        name: "Acquired musculoskeletal deformity (disorder)",
        parents: [],
        hasChildren: false,
        hasGrandChildren: false,
        type: [
          {
            name: "Terminology Concept",
            "@id": "http://endhealth.info/im#Concept"
          }
        ],
        orderNumber: 0,
        "@id": "http://snomed.info/sct#40668007"
      },
      {
        name: "Curvature of spine (disorder)",
        parents: [],
        hasChildren: false,
        hasGrandChildren: false,
        type: [
          {
            name: "Terminology Concept",
            "@id": "http://endhealth.info/im#Concept"
          }
        ],
        orderNumber: 0,
        "@id": "http://snomed.info/sct#64217002"
      }
    ]);
    getPartialEntitySpy.mockResolvedValue({
      name: "Acquired curvature of spine (disorder)",
      parents: [],
      hasChildren: false,
      hasGrandChildren: false,
      type: [
        {
          name: "Terminology Concept",
          "@id": "http://endhealth.info/im#Concept"
        }
      ],
      orderNumber: 0,
      "@id": "http://snomed.info/sct#12903001"
    });
    const parent = component.getByTestId("parent");
    await fireEvent.click(parent);
    await flushPromises();
    await component.findByText("Acquired curvature of spine (disorder)");
    const newParent = component.getByTestId("parent");
    within(newParent).getByText("Acquired deformity of spine (disorder)");
  });
});
