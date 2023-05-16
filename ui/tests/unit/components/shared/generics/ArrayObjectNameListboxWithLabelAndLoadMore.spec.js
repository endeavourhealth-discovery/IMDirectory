import { render, fireEvent, within } from "@testing-library/vue";
import ArrayObjectNameListboxWithLabelAndLoadMore from "@/components/shared/generics/ArrayObjectNameListboxWithLabelAndLoadMore.vue";
import Listbox from "primevue/listbox";
import Button from "primevue/button";
import StyleClass from "primevue/styleclass";
import { expect, it } from "vitest";
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

createTestingPinia({
  initialState: {
    directory: { arrayObjectNameListboxWithLabelStartExpanded: ["Is a"], conceptIri: "http://snomed.info/sct#111266001" }
  }
});

async function loadMore(children, totalCount, nextPage, pageSize, loadButton, iri) {
  return { children: CHILDREN, totalCount: totalCount, nextPage: nextPage, pageSize: pageSize, loadButton: false, iri: iri };
}

const CHILDREN = [
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
  },
  {
    name: "Acquired scoliosis (disorder)",
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
    "@id": "http://snomed.info/sct#111266001"
  },
  {
    name: "Acrodysplasia scoliosis (disorder)",
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
    "@id": "http://snomed.info/sct#773773006"
  },
  {
    name: "Congenital scoliosis due to bony malformation (disorder)",
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
    "@id": "http://snomed.info/sct#205045003"
  },
  {
    name: "Distal arthrogryposis type 4 (disorder)",
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
    "@id": "http://snomed.info/sct#715575001"
  },
  {
    name: "Duane anomaly, myopathy, scoliosis syndrome (disorder)",
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
    "@id": "http://snomed.info/sct#722432000"
  }
];

describe("ArrayObjectNameListboxWithLabelAndLoadMore.vue ___ ontology ___ loadmore", () => {
  let component;

  beforeEach(() => {
    vi.resetAllMocks();

    component = render(ArrayObjectNameListboxWithLabelAndLoadMore, {
      global: {
        components: { Listbox, Button },
        directives: { styleclass: StyleClass }
      },
      props: {
        label: "Is a",
        size: "50%",
        data: {
          children: CHILDREN.slice(0, 9),
          totalCount: 12,
          loadMore: loadMore
        },
        show: true,
        id: "array-object-name-listbox-with-label"
      }
    });

    vi.clearAllMocks();
  });

  it("renders mounted data ___ expanded on startup ___ loadmore", () => {
    const label = component.getByTestId("label");
    within(label).getByText("Is a:");
    const count = component.getByTestId("total-count");
    within(count).getByText("(12)");
    const rows = component.getAllByTestId("row-text");
    expect(rows.length).toBe(9);
    component.getByText("Acquired kyphoscoliosis (disorder)");
    component.getByText("Acquired scoliosis (disorder)");
    component.getAllByTestId("load-more-button");
  });

  it("can loadMore", async () => {
    const loadMore = component.getByTestId("load-more-button");
    await fireEvent.click(loadMore);
    const rows = component.getAllByTestId("row-text");
    expect(rows.length).toBe(12);
  });

  it("can navigate", async () => {
    const row = component.getAllByTestId("row-text")[0];
    await fireEvent.click(row);
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith({ name: "Folder", params: { selectedIri: "http://snomed.info/sct#405771009" } });
  });

  it("can hide data", async () => {
    const button = component.getByTestId("expand-button");
    expect(button.classList.contains("pi pi-minus"));
    await fireEvent.click(button);
    expect(button.classList.contains("pi pi-plus"));
  });
});

describe("ArrayObjectNameListboxWithLabel.vue ___ sets", () => {
  let component;

  beforeEach(() => {
    vi.resetAllMocks();

    component = render(ArrayObjectNameListboxWithLabelAndLoadMore, {
      global: {
        components: { Listbox, Button },
        directives: { styleclass: StyleClass }
      },
      props: {
        label: "Subtype of",
        size: "50%",
        data: {
          children: CHILDREN.slice(0, 9),
          totalCount: 12,
          loadMore: loadMore
        },
        show: true,
        id: "array-object-name-listbox-with-label"
      }
    });

    vi.clearAllMocks();
  });

  it("expandAtStartup ___ false", async () => {
    const button = component.getByTestId("expand-button");
    expect(button.classList.contains("pi pi-plus"));
  });
});
