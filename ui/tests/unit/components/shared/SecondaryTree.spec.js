import { render, fireEvent, within } from "@testing-library/vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SecondaryTree from "@/components/shared/SecondaryTree.vue";
import axios from "axios";
import Button from "primevue/button";
import Tree from "primevue/tree";
import ProgressSpinner from "primevue/progressspinner";
import OverlayPanel from "primevue/overlaypanel";
import Tooltip from "primevue/tooltip";
import { flushPromises } from "@vue/test-utils";
import { EntityService } from "@/services";

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

const ENTITY = {
  "@id": "http://snomed.info/sct#111266001",
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [
    {
      "@id": "http://endhealth.info/im#Concept",
      name: "Terminology Concept"
    }
  ],
  "http://www.w3.org/2000/01/rdf-schema#label": "Acquired scoliosis (disorder)"
};

const PARENTS = [
  {
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
  },
  {
    name: "Scoliosis deformity of spine (disorder)",
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
    "@id": "http://snomed.info/sct#298382003"
  }
];

const CHILDREN = {
  totalCount: 7,
  result: [
    {
      name: "Acquired kyphoscoliosis (disorder)",
      parents: [],
      hasChildren: true,
      hasGrandChildren: false,
      type: [
        {
          name: "Terminology Concept",
          "@id": "http://endhealth.info/im#Concept"
        }
      ],
      orderNumber: 0,
      "@id": "http://snomed.info/sct#405771009"
    },
    {
      name: "Adolescent idiopathic scoliosis (disorder)",
      parents: [],
      hasChildren: true,
      hasGrandChildren: true,
      type: [
        {
          name: "Terminology Concept",
          "@id": "http://endhealth.info/im#Concept"
        }
      ],
      orderNumber: 0,
      "@id": "http://snomed.info/sct#203646004"
    },
    {
      name: "Infantile idiopathic scoliosis of cervical spine (disorder)",
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
      "@id": "http://snomed.info/sct#310421000119106"
    },
    {
      name: "Post-surgical scoliosis (disorder)",
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
      "@id": "http://snomed.info/sct#203647008"
    },
    {
      name: "Scoliosis caused by radiation (disorder)",
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
      "@id": "http://snomed.info/sct#47518006"
    },
    {
      name: "Scoliosis due to and following traumatic injury (disorder)",
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
      "@id": "http://snomed.info/sct#1162310008"
    },
    {
      name: "Thoracogenic scoliosis (disorder)",
      parents: [],
      hasChildren: true,
      hasGrandChildren: false,
      type: [
        {
          name: "Terminology Concept",
          "@id": "http://endhealth.info/im#Concept"
        }
      ],
      orderNumber: 0,
      "@id": "http://snomed.info/sct#72992003"
    }
  ]
};

const SUMMARY = {
  name: "Acquired scoliosis",
  iri: "http://snomed.info/sct#111266001",
  code: "111266001",
  description: "Acquired scoliosis (disorder)",
  status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
  scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
  entityType: [
    { name: "Ontological Concept", "@id": "http://endhealth.info/im#Concept" },
    { name: "Organisation  (record type)", "@id": "http://endhealth.info/im#Organisation" }
  ],
  isDescendentOf: [],
  match: "629792015"
};

describe("SecondaryTree.vue", () => {
  let getPartialEntitySpy = vi.spyOn(EntityService, "getPartialEntity").mockResolvedValue(ENTITY);
  let getEntityParentsSpy = vi.spyOn(EntityService, "getEntityParents").mockResolvedValue(PARENTS);
  let getPagedChildrenSpy = vi.spyOn(EntityService, "getPagedChildren").mockResolvedValue(CHILDREN);
  let getEntitySummarySpy = vi.spyOn(EntityService, "getEntitySummary").mockResolvedValue(SUMMARY);
  let component;

  beforeEach(() => {
    component = render(SecondaryTree, {
      global: {
        components: { Button, Tree, ProgressSpinner, OverlayPanel },
        stubs: { FontAwesomeIcon: true },
        directives: { Tooltip: Tooltip },
        provide: { axios: axios }
      },
      props: { conceptIri: "http://snomed.info/sct#298382003" }
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
    await fireEvent.click(expanders[3]);
    await flushPromises();
    component.getByText("Thoracogenic kyphoscoliosis (disorder)");
  });

  it("can select a parent", async () => {
    await flushPromises();
    getEntityParentsSpy.mockResolvedValueOnce(PARENTS).mockResolvedValue([
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
