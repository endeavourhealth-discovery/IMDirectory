import { render, fireEvent, within } from "@testing-library/vue";
import ArrayObjectNameListboxWithLabel from "../../../../../src/im_library/components/modules/generics/ArrayObjectNameListboxWithLabel.vue";
import Listbox from "primevue/listbox";
import Button from "primevue/button";
import StyleClass from "primevue/styleclass";
import { expect, it } from "vitest";

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

const mockDispatch = vi.fn();
const mockState = { arrayObjectNameListboxWithLabelStartExpanded: ["Is a"] };
const mockCommit = vi.fn();

vi.mock("vuex", () => ({
  useStore: () => ({
    dispatch: mockDispatch,
    state: mockState,
    commit: mockCommit
  })
}));

describe("ArrayObjectNameListboxWithLabel.vue ___ ontology", () => {
  let component;

  beforeEach(() => {
    vi.resetAllMocks();

    component = render(ArrayObjectNameListboxWithLabel, {
      global: {
        components: { Listbox, Button },
        directives: { styleclass: StyleClass }
      },
      props: {
        label: "Is a",
        size: "50%",
        data: [
          { "@id": "http://snomed.info/sct#12903001", name: "Acquired curvature of spine (disorder)" },
          { "@id": "http://snomed.info/sct#298382003", name: "Scoliosis deformity of spine (disorder)" }
        ],
        show: true,
        id: "array-object-name-listbox-with-label"
      }
    });

    vi.clearAllMocks();
  });

  it("renders mounted data ___ expanded on startup", () => {
    const label = component.getByTestId("label");
    within(label).getByText("Is a:");
    const count = component.getByTestId("count");
    within(count).getByText("(2)");
    const rows = component.getAllByTestId("row-text");
    within(rows[0]).getByText("Acquired curvature of spine (disorder)");
    within(rows[1]).getByText("Scoliosis deformity of spine (disorder)");
  });

  it("can navigate", async () => {
    const row = component.getAllByTestId("row-text")[0];
    await fireEvent.click(row);
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith({ name: "Folder", params: { selectedIri: "http://snomed.info/sct#12903001" } });
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

    component = render(ArrayObjectNameListboxWithLabel, {
      global: {
        components: { Listbox, Button },
        directives: { styleclass: StyleClass }
      },
      props: {
        label: "Subtype of",
        size: "50%",
        data: [
          { "@id": "http://snomed.info/sct#12903001", name: "Acquired curvature of spine (disorder)" },
          { "@id": "http://snomed.info/sct#298382003", name: "Scoliosis deformity of spine (disorder)" }
        ],
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
